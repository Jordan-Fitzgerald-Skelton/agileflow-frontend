import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3000");

    newSocket.on("connect", () => console.log("Connected to Socket.io server"));
    newSocket.on("disconnect", () => console.log("Disconnected from Socket.io server"));

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

// Custom hook to use the socket in other components
export const useSocket = () => useContext(SocketContext);