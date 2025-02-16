import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_BACKEND_URL);
    setSocket(newSocket);

    // Fetch rooms from API
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/rooms`)
      .then((res) => setRooms(res.data.rooms))
      .catch((err) => console.error('Error fetching rooms:', err));

    // Listen for real-time room updates
    newSocket.on('updateRooms', (updatedRooms) => {
      setRooms(updatedRooms);
    });

    return () => newSocket.disconnect();
  }, []);

  const createRoom = (roomName, isPersistent) => {
    if (socket) {
      socket.emit('createRoom', { roomName, isPersistent }, (response) => {
        if (!response.success) {
          alert(response.message);
        }
      });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, rooms, createRoom }}>
      {children}
    </SocketContext.Provider>
  );
};
