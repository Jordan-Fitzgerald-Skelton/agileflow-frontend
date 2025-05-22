import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth0 } from "@auth0/auth0-react";

const SERVER_URL = process.env.REACT_APP_BACK_APP;
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

  // Setup and cleanup of WebSocket connection
  useEffect(() => {
    if (!isAuthenticated) return;

    const socketInstance = io(SERVER_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      console.log("WebSocket connected:", socketInstance.id);
      setIsConnected(true);
      setError(null);

      // Auto rejoin after reconnect
      if (inviteCode && user) {
        socketInstance.emit("join_room", {
          invite_code: inviteCode,
          name: user.name,
          email: user.email,
        });
      }
    });

    socketInstance.on("disconnect", (reason) => {
      console.warn("WebSocket disconnected:", reason);
      setIsConnected(false);
    });

    socketInstance.on("error", (err) => {
      console.error("WebSocket error:", err);
      setError(err?.message || "Socket error");
    });

    // Realtime events
    socketInstance.on("user_list", setUserList);
    socketInstance.on("prediction_submitted", (data) => {
      setPredictions((prev) => {
        const idx = prev.findIndex(p => p.role === data.role);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = data;
          return updated;
        }
        return [...prev, data];
      });
    });

    socketInstance.on("session_reset", () => setPredictions([]));
    socketInstance.on("results_revealed", setPredictions);
    socketInstance.on("new_comment", (comment) => setComments(prev => [...prev, comment]));
    socketInstance.on("action_added", (action) => setActions(prev => [...prev, action]));

    // New backend events
    socketInstance.on("room_expired", ({ message }) => {
      setError(message);
      leaveRoom();
    });

    socketInstance.on("room_closed", ({ message }) => {
      setError(message);
      leaveRoom();
    });

    socketInstance.on("server_shutdown", ({ message }) => {
      setError(message);
      leaveRoom();
    });

    setSocket(socketInstance);
    return () => socketInstance.disconnect();
  }, [isAuthenticated, user, inviteCode]);

  // Helper: API Request Wrapper
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
      if (!data.success) throw new Error(data.message);
      return data;
    } catch (err) {
      console.error(`Request to ${url} failed:`, err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ROOM JOIN & CREATE

  const createAndJoinRoom = useCallback(async (type) => {
    if (!user) return setError("Not authenticated");

    const data = await request("/create/room", "POST", { room_type: type });
    if (data) {
      setRoomId(data.room_id);
      setInviteCode(data.invite_code);
      await joinRoom(data.invite_code);
    }
    return data;
  }, [user, request]);

  const joinRoom = useCallback(async (invite_code) => {
    if (!user) return setError("Not authenticated");

    const data = await request("/join/room", "POST", {
      name: user.name,
      email: user.email,
      invite_code,
    });

    if (data) {
      setRoomId(data.room_id);
      setInviteCode(invite_code);
      socket?.emit("join_room", {
        invite_code,
        name: user.name,
        email: user.email,
      });
    }
    return data;
  }, [user, socket, request]);

  const leaveRoom = useCallback(() => {
    if (roomId && socket && isConnected) {
      socket.emit("leave_room", { roomId });
    }
    setRoomId(null);
    setInviteCode(null);
    setUserList([]);
    setPredictions([]);
    setComments([]);
    setActions([]);
  }, [roomId, socket, isConnected]);

  // REFINEMENT FUNCTIONS

  const submitPrediction = useCallback(async (role, prediction) => {
    if (!roomId) return setError("Room ID missing");

    const data = await request("/refinement/prediction/submit", "POST", {
      room_id: roomId,
      name: user.name,
      role,
      prediction
    });

    if (data) {
      socket?.emit("submit_prediction", {
        room_id: roomId,
        name: user.name,
        role,
        prediction
      });
    }
    return data;
  }, [roomId, socket, user, request]);

  const getPredictions = useCallback(async () => {
    if (!roomId) return setError("Room ID missing");

    const data = await request(`/refinement/get/predictions?room_id=${roomId}`, "GET");
    if (data) setPredictions(data.predictions);
    return data?.predictions || null;
  }, [roomId, request]);

  const resetSession = useCallback(() => {
    if (roomId && socket && isConnected) {
      socket.emit("reset_session", { room_id: roomId });
    }
  }, [roomId, socket, isConnected]);

  const revealResults = useCallback((predictions) => {
    if (roomId && socket && isConnected) {
      socket.emit("reveal_results", { room_id: roomId, predictions });
    }
  }, [roomId, socket, isConnected]);

  // RETRO FUNCTIONS

  const addComment = useCallback(async (comment) => {
    if (!roomId) return setError("Room ID missing");

    const data = await request("/retro/new/comment", "POST", {
      room_id: roomId,
      comment,
      user_name: user.name,
      email: user.email
    });

    return data;
  }, [roomId, user, request]);

  const createAction = useCallback(async (description, assignee_name = null) => {
    if (!roomId || !user) return setError("Room or user missing");

    const data = await request("/retro/create/action", "POST", {
      room_id: roomId,
      user_name: user.name,
      description,
      assignee_name: assignee_name || user.name
    });

    return data;
  }, [roomId, user, request]);

  const subscribe = useCallback((event, callback) => {
    if (!socket) return () => {};
    socket.off(event);
    socket.on(event, callback);
    return () => socket.off(event);
  }, [socket]);

  // CONTEXT VALUE
  const contextValue = useMemo(() => ({
    socket,
    isConnected,
    roomId,
    inviteCode,
    userList,
    predictions,
    comments,
    actions,
    error,
    loading,

    createAndJoinRefinementRoom: () => createAndJoinRoom("refinement"),
    createAndJoinRetroRoom: () => createAndJoinRoom("retro"),
    joinRoom,
    leaveRoom,

    submitPrediction,
    getPredictions,
    resetSession,
    revealResults,

    addComment,
    createAction,

    subscribe,
    clearError: () => setError(null),
    resetData: () => {
      setPredictions([]);
      setComments([]);
      setActions([]);
    }
  }), [
    socket, isConnected, roomId, inviteCode, userList, predictions,
    comments, actions, error, loading, joinRoom, leaveRoom,
    submitPrediction, getPredictions, resetSession, revealResults,
    addComment, createAction, subscribe, createAndJoinRoom
  ]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
