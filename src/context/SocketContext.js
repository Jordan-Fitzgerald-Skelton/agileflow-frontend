import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:5000"; // Update if needed
const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    const newSocket = io(SERVER_URL, { transports: ["websocket"] });

    newSocket.on("connect", () => console.log("Connected to WebSocket server"));
    newSocket.on("disconnect", () => console.log("Disconnected from WebSocket server"));

    newSocket.on("prediction_submitted", (data) => setPredictions((prev) => [...prev, data]));
    newSocket.on("new_comment", (comment) => console.log("New comment:", comment));
    newSocket.on("action_added", (action) => console.log("New action item:", action));

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  //Creating and joining the new room
  const createAndJoinRoom = async (name, email, roomType) => {
    try {
      const res = await fetch(`${SERVER_URL}/${roomType}/create/room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.success) {
        setRoomId(data.room_id);
        await joinRoom(name, email, data.invite_code, roomType);
      }
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  //joining an existing room
  const joinRoom = async (name, email, inviteCode, roomType) => {
    try {
      const res = await fetch(`${SERVER_URL}/${roomType}/join/room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, invite_code: inviteCode }),
      });
      const data = await res.json();

      if (data.success) {
        setRoomId(data.room_id);
        socket?.emit("join_room", { invite_code: inviteCode, name });
      }
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  // Submit Prediction (Refinement rooms)
  const submitPrediction = async (role, prediction) => {
    if (!roomId) return console.error("No room ID set");

    try {
      const res = await fetch(`${SERVER_URL}/refinement/prediction/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId, role, prediction }),
      });
      const data = await res.json();

      if (data.success) {
        socket?.emit("submit_prediction", { room_id: roomId, role, prediction });
      }
    } catch (error) {
      console.error("Error submitting prediction:", error);
    }
  };

  // Get Final Predictions
  const getPredictions = async () => {
    if (!roomId) return console.error("No room ID set");

    try {
      const res = await fetch(`${SERVER_URL}/refinement/get/predictions?room_id=${roomId}`);
      const data = await res.json();

      if (data.success) {
        setPredictions(data.predictions);
      }
    } catch (error) {
      console.error("Error fetching predictions:", error);
    }
  };

  // Add Comment (Retro board)
  const addComment = async (comment) => {
    if (!roomId) return console.error("No room ID set");

    try {
      await fetch(`${SERVER_URL}/retro/new/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId, comment }),
      });

      socket?.emit("new_comment", comment);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Create an Action Item (Retro board)
  const createAction = async (userName, description) => {
    if (!roomId) return console.error("No room ID set");

    try {
      await fetch(`${SERVER_URL}/retro/create/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId, user_name: userName, description }),
      });

      socket?.emit("create_action", { room_id: roomId, user_name: userName, description });
    } catch (error) {
      console.error("Error creating action item:", error);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        createAndJoinRefinementRoom: (name, email) => createAndJoinRoom(name, email, "refinement"),
        createAndJoinRetroRoom: (name, email) => createAndJoinRoom(name, email, "retro"),
        joinRefinementRoom: (name, email, inviteCode) => joinRoom(name, email, inviteCode, "refinement"),
        joinRetroRoom: (name, email, inviteCode) => joinRoom(name, email, inviteCode, "retro"),
        submitPrediction,
        getPredictions,
        addComment,
        createAction,
        predictions,
        roomId,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};