import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [comments, setComments] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [actions, setActions] = useState([]);
  const [socketError, setSocketError] = useState(null);

  useEffect(() => {
    // Starts the socket connection
    const newSocket = io(process.env.REACT_APP_BACKEND_URL, {
      reconnectionAttempts: 5, // Try reconnecting 5 times before failing
      transports: ["websocket"],
    });

    setSocket(newSocket);

    // Fetch initial room data
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/rooms`);
        setRooms(response.data.rooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    fetchRooms();

    //Event listeners
    const handleRoomUpdate = (updatedRooms) => setRooms(updatedRooms);
    const handleCommentAdded = (newComment) => setComments((prev) => [...prev, newComment]);
    const handlePredictionSubmitted = (newPrediction) => setPredictions((prev) => [...prev, newPrediction]);
    const handleActionAdded = (newAction) => setActions((prev) => [...prev, newAction]);
    const handleConnectError = () => setSocketError("WebSocket connection failed. Retrying...");
    const handleDisconnect = () => setSocketError("Disconnected from server.");

    //Register the socket events
    newSocket.on("updateRooms", handleRoomUpdate);
    newSocket.on("comment_added", handleCommentAdded);
    newSocket.on("prediction_submitted", handlePredictionSubmitted);
    newSocket.on("action_added", handleActionAdded);
    newSocket.on("connect_error", handleConnectError);
    newSocket.on("disconnect", handleDisconnect);

    // Cleanup function (removes event listeners when disconnected)
    return () => {
      newSocket.off("updateRooms", handleRoomUpdate);
      newSocket.off("comment_added", handleCommentAdded);
      newSocket.off("prediction_submitted", handlePredictionSubmitted);
      newSocket.off("action_added", handleActionAdded);
      newSocket.off("connect_error", handleConnectError);
      newSocket.off("disconnect", handleDisconnect);
      newSocket.disconnect();
    };
  }, []);

  //Room Management
  const createRoom = (roomName, isPersistent) => {
    socket?.emit("createRoom", { roomName, isPersistent });
  };

  const joinRoom = (roomId) => {
    socket?.emit("join_room", roomId);
  };

  const leaveRoom = (roomId) => {
    socket?.emit("leave_room", roomId);
  };

  //Retro Board
  const sendComment = (roomId, comment) => {
    socket?.emit("add_comment", { roomId, comment });
  };

  const sendAction = (roomId, userName, description) => {
    socket?.emit("create_action", { roomId, userName, description });
  };

  //Refinement Board
  const sendPrediction = (roomId, role, name, prediction) => {
    socket?.emit("submit_prediction", { roomId, role, name, prediction });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        rooms,
        comments,
        predictions,
        actions,
        createRoom,
        joinRoom,
        leaveRoom,
        sendComment,
        sendPrediction,
        sendAction,
        socketError,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
