import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import { useAuth0 } from "@auth0/auth0-react";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth0();
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [comments, setComments] = useState([]);
  const [actions, setActions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize WebSocket
  useEffect(() => {
    if (!isAuthenticated) return;

    const newSocket = io(process.env.BACK_APP, { transports: ["websocket"], reconnection: true });

    const handleConnect = () => console.log("Connected to WebSocket");
    const handleDisconnect = () => console.log("Disconnected from WebSocket");
    const handleError = (err) => setError(err?.message || "Socket error");
    const handlePredictionSubmitted = (data) => setPredictions((prev) => [...prev, data]);
    const handleNewComment = (comment) => setComments((prev) => [...prev, comment]);
    const handleActionAdded = (action) => setActions((prev) => [...prev, action]);
    const handleUserListUpdate = (userList) => console.log("User List Updated:", userList);

    newSocket.on("connect", handleConnect);
    newSocket.on("disconnect", handleDisconnect);
    newSocket.on("error", handleError);
    newSocket.on("prediction_submitted", handlePredictionSubmitted);
    newSocket.on("new_comment", handleNewComment);
    newSocket.on("action_added", handleActionAdded);
    newSocket.on("user_list", handleUserListUpdate);

    setSocket(newSocket);

    return () => {
      newSocket.off("connect", handleConnect);
      newSocket.off("disconnect", handleDisconnect);
      newSocket.off("error", handleError);
      newSocket.off("prediction_submitted", handlePredictionSubmitted);
      newSocket.off("new_comment", handleNewComment);
      newSocket.off("action_added", handleActionAdded);
      newSocket.off("user_list", handleUserListUpdate);
      newSocket.disconnect();
    };
  }, [isAuthenticated]);

  // =================== Helper for API Calls ===================
  const request = async (url, method, body = null) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.BACK_APP}${url}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : null,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Request failed");
      return data;
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // =================== Room Management ===================

  // Create and Join Refinement Room
  const createAndJoinRefinementRoom = async () => {
    if (!user) return setError("User not authenticated");
  
    try {
      const data = await request(`/refinement/create/room`, "POST");
      if (data) {
        // Set room ID and invite code
        setRoomId(data.room_id);
        
        // Emit room creation event
        socket?.emit("join_room", { 
          invite_code: data.invite_code, 
          name: user.name, 
          email: user.email 
        });
  
        // Return invite code for UI to use
        return data.invite_code;
      }
      return null;
    } catch (error) {
      setError(error.message || "Failed to create room");
      return null;
    }
  };

  /*
  if (data) {
    setRoomId(data.room_id);
    await joinRefinementRoom(data.invite_code);
  }
  */

  const joinRefinementRoom = async (inviteCode) => {
    if (!user) return setError("User not authenticated");

    const data = await request(`/refinement/join/room`, "POST", {
      name: user.name,
      email: user.email,
      invite_code: inviteCode,
    });

    if (data) {
      setRoomId(data.room_id);
      socket?.emit("join_room", { room_id: data.room_id, invite_code: inviteCode, name: user.name, email: user.email });
    }
  };

  // Create and Join Retro Room
  const createAndJoinRetroRoom = async () => {
    if (!user) return setError("User not authenticated");
  
    try {
      const data = await request(`/retro/create/room`, "POST");
      if (data) {
        // Set room ID and invite code
        setRoomId(data.room_id);
        
        // Emit room creation event
        socket?.emit("join_room", { 
          invite_code: data.invite_code, 
          name: user.name, 
          email: user.email 
        });
  
        // Return invite code for UI to use
        return data.invite_code;
      }
      return null;
    } catch (error) {
      setError(error.message || "Failed to create room");
      return null;
    }
  };

  /*
  if (data) {
    setRoomId(data.room_id);
    await joinRetroRoom(data.invite_code);
  }
  */

  const joinRetroRoom = async (inviteCode) => {
    if (!user) return setError("User not authenticated");

    const data = await request(`/retro/join/room`, "POST", {
      name: user.name,
      email: user.email,
      invite_code: inviteCode,
    });

    if (data) {
      setRoomId(data.room_id);
      socket?.emit("join_room", { room_id: data.room_id, invite_code: inviteCode, name: user.name, email: user.email });
    }
  };

  // =================== Refinement ===================
  const submitPrediction = async (role, prediction) => {
    if (!roomId) return setError("No room ID set");

    const data = await request("/refinement/prediction/submit", "POST", { room_id: roomId, role, prediction });
    if (data) {
      socket?.emit("submit_prediction", { room_id: roomId, role, prediction });
    }
  };

  const getPredictions = async () => {
    if (!roomId) return setError("No room ID set");

    const data = await request(`/refinement/get/predictions?room_id=${roomId}`, "GET");
    if (data) setPredictions(data.predictions);
  };

  // =================== Retro ===================
  const addComment = async (comment) => {
    if (!roomId) return setError("No room ID set");

    const data = await request("/retro/new/comment", "POST", { room_id: roomId, comment });
    if (data) {
      socket?.emit("new_comment", comment);
    }
  };

  const createAction = async (description) => {
    if (!roomId) return setError("No room ID set");

    const data = await request("/retro/create/action", "POST", { room_id: roomId, user_name: user.name, description });
    if (data) {
      socket?.emit("create_action", { room_id: roomId, user_name: user.name, description });
    }
  };

  const leaveRoom = () => {
    if (!roomId) return;
    socket?.emit("leave_room", { room_id: roomId });
    setRoomId(null);
    setPredictions([]);
    setComments([]);
    setActions([]);
  };

  // =================== Memoized Context ===================
  const contextValue = useMemo(() => ({
    socket,
    createAndJoinRefinementRoom,
    createAndJoinRetroRoom,
    joinRefinementRoom,
    joinRetroRoom,
    leaveRoom,
    submitPrediction,
    getPredictions,
    addComment,
    createAction,
    predictions,
    comments,
    actions,
    roomId,
    error,
    loading,
  }), [socket, roomId]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
