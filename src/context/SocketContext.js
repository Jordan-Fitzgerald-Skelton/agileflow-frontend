import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import { useAuth0 } from "@auth0/auth0-react";

const SERVER_URL = "http://localhost:5000"; // Update this for production
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

  useEffect(() => {
    if (!isAuthenticated) return;

    const newSocket = io(SERVER_URL, { transports: ["websocket"] });

    newSocket.on("connect", () => console.log("Connected to WebSocket server"));
    newSocket.on("disconnect", () => console.log("Disconnected from WebSocket server"));

    newSocket.on("prediction_submitted", (data) => setPredictions((prev) => [...prev, data]));
    newSocket.on("new_comment", (comment) => setComments((prev) => [...prev, comment]));
    newSocket.on("action_added", (action) => setActions((prev) => [...prev, action]));

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [isAuthenticated]);

  //===================Rooms=======================

  const createAndJoinRoom = async (roomType) => {
    if (!user) return setError("User not authenticated");

    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/${roomType}/create/room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.success) {
        setRoomId(data.room_id);
        await joinRoom(data.invite_code, roomType);
      } else {
        setError(data.message || "Failed to create room");
      }
    } catch (error) {
      setError("Error creating room: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (inviteCode, roomType) => {
    if (!user) return setError("User not authenticated");

    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/${roomType}/join/room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: user.name, email: user.email, invite_code: inviteCode }),
      });
      const data = await res.json();

      if (data.success) {
        setRoomId(data.room_id);
        socket?.emit("join_room", { invite_code: inviteCode, name: user.name, email: user.email });
      } else {
        setError(data.message || "Failed to join room");
      }
    } catch (error) {
      setError("Error joining room: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  //======================Refinement==========================

  const submitPrediction = async (role, prediction) => {
    if (!roomId) return setError("No room ID set");

    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/refinement/prediction/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId, role, prediction }),
      });
      const data = await res.json();

      if (data.success) {
        socket?.emit("submit_prediction", { room_id: roomId, role, prediction });
      } else {
        setError(data.message || "Failed to submit prediction");
      }
    } catch (error) {
      setError("Error submitting prediction: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPredictions = async () => {
    if (!roomId) return setError("No room ID set");

    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/refinement/get/predictions?room_id=${roomId}`);
      const data = await res.json();

      if (data.success) {
        setPredictions(data.predictions);
      } else {
        setError(data.message || "Failed to fetch predictions");
      }
    } catch (error) {
      setError("Error fetching predictions: " + error.message);
    } finally {
      setLoading(false);
    }
  };

//=======================Retro=====================

  const addComment = async (comment) => {
    if (!roomId) return setError("No room ID set");

    setLoading(true);
    try {
      await fetch(`${SERVER_URL}/retro/new/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId, comment }),
      });

      socket?.emit("new_comment", comment);
    } catch (error) {
      setError("Error adding comment: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const createAction = async (description) => {
    if (!roomId) return setError("No room ID set");

    setLoading(true);
    try {
      await fetch(`${SERVER_URL}/retro/create/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId, user_name: user.name, description }),
      });

      socket?.emit("create_action", { room_id: roomId, user_name: user.name, description });
    } catch (error) {
      setError("Error creating action item: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const contextValue = useMemo(() => ({
    socket,
    createAndJoinRefinementRoom: () => createAndJoinRoom("refinement"),
    createAndJoinRetroRoom: () => createAndJoinRoom("retro"),
    joinRefinementRoom: (inviteCode) => joinRoom(inviteCode, "refinement"),
    joinRetroRoom: (inviteCode) => joinRoom(inviteCode, "retro"),
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
  }), [socket, roomId, predictions, comments, actions, error, loading]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
