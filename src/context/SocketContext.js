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
    const newSocket = io(process.env.REACT_APP_BACKEND_URL);
    setSocket(newSocket);

    axios.get(`${process.env.REACT_APP_BACKEND_URL}/rooms`)
      .then((res) => setRooms(res.data.rooms))
      .catch((err) => console.error("Error fetching rooms:", err));

    //Listen for the real-time updates
    newSocket.on("updateRooms", setRooms);
    newSocket.on("comment_added", setComments);
    newSocket.on("prediction_submitted", setPredictions);
    newSocket.on("action_added", (newAction) => setActions((prev) => [...prev, newAction]));

    //Error Handling
    newSocket.on("connect_error", () => setSocketError("WebSocket connection failed. Retrying..."));
    newSocket.on("disconnect", () => setSocketError("Disconnected from server."));

    return () => newSocket.disconnect();
  }, []);

  //Room functions
  const createRoom = (roomName, isPersistent) => {
    if (socket) socket.emit("createRoom", { roomName, isPersistent });
  };
  const joinRoom = (roomId) => {
    if (socket) socket.emit("join_room", roomId);
  };
  const leaveRoom = (roomId) => {
    if (socket) socket.emit("leave_room", roomId);
  };

  //Retro Board functions
  const sendComment = (roomId, comment) => {
    if (socket) socket.emit("add_comment", { roomId, comment });
  };
  const sendAction = (roomId, userName, description) => {
    if (socket) socket.emit("create_action", { roomId, userName, description });
  };

  //Refinement Board functions
  const sendPrediction = (roomId, role, name, prediction) => {
    if (socket) socket.emit("submit_prediction", { roomId, role, name, prediction });
  };

  return (
    <SocketContext.Provider
      value={{
        socket, rooms, comments, predictions, actions,
        createRoom, joinRoom, leaveRoom, sendComment, sendPrediction, sendAction, socketError
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
