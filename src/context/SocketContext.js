import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth0 } from "@auth0/auth0-react";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";
const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth0();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [inviteCode, setInviteCode] = useState(null);
  const [userList, setUserList] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [comments, setComments] = useState([]);
  const [actions, setActions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize WebSocket
  useEffect(() => {
    if (!isAuthenticated) return;

    const socketInstance = io(SERVER_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
      transports: ["websocket"]
    });

    socketInstance.on("connect", () => {
      console.log("Connected to WebSocket:", socketInstance.id);
      setIsConnected(true);
      setError(null);
      
      // Rejoin room if we were in one before reconnecting
      if (roomId && inviteCode && user) {
        socketInstance.emit("join_room", { 
          invite_code: inviteCode, 
          name: user.name, 
          email: user.email 
        });
      }
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Disconnected from WebSocket:", reason);
      setIsConnected(false);
    });

    socketInstance.on("error", (err) => {
      console.error("Socket error:", err);
      setError(err?.message || "Socket error");
    });

    // Room events
    socketInstance.on("user_list", (users) => {
      console.log("Received user list:", users);
      setUserList(users);
    });

    // Refinement events
    socketInstance.on("prediction_submitted", (data) => {
      console.log("Prediction submitted:", data);
      setPredictions(prev => {
        // Replace prediction if role exists, otherwise add new
        const exists = prev.findIndex(p => p.role === data.role);
        if (exists >= 0) {
          const newPredictions = [...prev];
          newPredictions[exists] = data;
          return newPredictions;
        }
        return [...prev, data];
      });
    });

    // Retro events
    socketInstance.on("new_comment", (comment) => {
      console.log("New comment received:", comment);
      setComments(prev => [...prev, comment]);
    });

    socketInstance.on("action_added", (action) => {
      console.log("New action received:", action);
      setActions(prev => [...prev, action]);
    });
    
    socketInstance.on("room_created", (roomData) => {
      console.log("Room created:", roomData);
    });
    
    socketInstance.on("action_created", (actionData) => {
      console.log("Action created:", actionData);
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [isAuthenticated, roomId, inviteCode, user]);

  // =================== Helper for API Calls ===================
  const request = useCallback(async (url, method, body = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${SERVER_URL}${url}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : null,
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Request failed");
      }
      
      return data;
    } catch (error) {
      console.error(`API Error (${url}):`, error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // =================== Room Management ===================
  const createAndJoinRefinementRoom = useCallback(async () => {
    if (!user) {
      setError("User not authenticated");
      return null;
    }

    const data = await request(`/refinement/create/room`, "POST");
    if (data) {
      setRoomId(data.room_id);
      setInviteCode(data.invite_code);
      await joinRefinementRoom(data.invite_code);
      return data;
    }
    return null;
  }, [user, request]);

  const joinRefinementRoom = useCallback(async (invite_code) => {
    if (!user) {
      setError("User not authenticated");
      return null;
    }

    const data = await request(`/refinement/join/room`, "POST", {
      name: user.name,
      email: user.email,
      invite_code,
    });

    if (data) {
      setRoomId(data.room_id);
      setInviteCode(invite_code);
      
      if (socket && isConnected) {
        socket.emit("join_room", { 
          invite_code, 
          name: user.name, 
          email: user.email 
        });
      }
      
      return data;
    }
    return null;
  }, [user, socket, isConnected, request]);

  const createAndJoinRetroRoom = useCallback(async () => {
    if (!user) {
      setError("User not authenticated");
      return null;
    }

    const data = await request(`/retro/create/room`, "POST");
    if (data) {
      setRoomId(data.room_id);
      setInviteCode(data.invite_code);
      await joinRetroRoom(data.invite_code);
      return data;
    }
    return null;
  }, [user, request]);

  const joinRetroRoom = useCallback(async (invite_code) => {
    if (!user) {
      setError("User not authenticated");
      return null;
    }

    const data = await request(`/retro/join/room`, "POST", {
      name: user.name,
      email: user.email,
      invite_code,
    });

    if (data) {
      setRoomId(data.room_id);
      setInviteCode(invite_code);
      
      if (socket && isConnected) {
        socket.emit("join_room", { 
          invite_code, 
          name: user.name, 
          email: user.email 
        });
      }
      
      return data;
    }
    return null;
  }, [user, socket, isConnected, request]);

  const leaveRoom = useCallback(() => {
    if (!roomId || !socket || !isConnected) return;
    
    socket.emit("leave_room", { roomId });
    console.log(`Left room: ${roomId}`);
    
    setRoomId(null);
    setInviteCode(null);
    setPredictions([]);
    setComments([]);
    setActions([]);
    setUserList([]);
  }, [roomId, socket, isConnected]);

  // =================== Refinement ===================
  const submitPrediction = useCallback(async (role, prediction) => {
    if (!roomId) {
      setError("No room ID set");
      return null;
    }

    const data = await request("/refinement/prediction/submit", "POST", { 
      room_id: roomId, 
      role, 
      prediction 
    });

    if (data && socket && isConnected) {
      socket.emit("submit_prediction", { 
        room_id: roomId, 
        role, 
        prediction 
      });
      return data;
    }
    return null;
  }, [roomId, socket, isConnected, request]);

  const getPredictions = useCallback(async () => {
    if (!roomId) {
      setError("No room ID set");
      return null;
    }

    const data = await request(`/refinement/get/predictions?room_id=${roomId}`, "GET");
    if (data) {
      setPredictions(data.predictions);
      return data.predictions;
    }
    return null;
  }, [roomId, request]);

  // =================== Retro ===================
  const addComment = useCallback(async (comment) => {
    if (!roomId) {
      setError("No room ID set");
      return null;
    }

    const data = await request("/retro/new/comment", "POST", { 
      room_id: roomId, 
      comment 
    });

    if (data && socket && isConnected) {
      socket.emit("new_comment", { room_id: roomId, comment });
      return data;
    }
    return null;
  }, [roomId, socket, isConnected, request]);

  const createAction = useCallback(async (description) => {
    if (!roomId || !user) {
      setError("No room ID or user not authenticated");
      return null;
    }

    const data = await request("/retro/create/action", "POST", { 
      room_id: roomId, 
      user_name: user.name, 
      description 
    });

    if (data && socket && isConnected) {
      socket.emit("create_action", { 
        room_id: roomId, 
        user_name: user.name, 
        description 
      });
      return data;
    }
    return null;
  }, [roomId, user, socket, isConnected, request]);

  // =================== Advanced socket subscription ===================
  const subscribe = useCallback((event, callback) => {
    if (!socket) return () => {};
    
    console.log(`Subscribing to ${event}`);
    socket.off(event);
    socket.on(event, callback);
    
    return () => socket.off(event);
  }, [socket]);

  // =================== Memoized Context Value ===================
  const contextValue = useMemo(() => ({
    // Socket state
    socket,
    isConnected,
    roomId,
    inviteCode,
    userList,
    error,
    loading,

    // Data state
    predictions,
    comments,
    actions,
    
    // Room management
    createAndJoinRefinementRoom,
    createAndJoinRetroRoom,
    joinRefinementRoom,
    joinRetroRoom,
    leaveRoom,
    
    // Refinement operations
    submitPrediction,
    getPredictions,
    
    // Retro operations
    addComment,
    createAction,
    
    // Advanced usage
    subscribe,
    clearError: () => setError(null),
    
    // Reset state
    resetData: () => {
      setPredictions([]);
      setComments([]);
      setActions([]);
    }
  }), [
    socket, isConnected, roomId, inviteCode, userList, 
    error, loading, predictions, comments, actions,
    createAndJoinRefinementRoom, createAndJoinRetroRoom,
    joinRefinementRoom, joinRetroRoom, leaveRoom,
    submitPrediction, getPredictions, addComment, createAction,
    subscribe
  ]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};