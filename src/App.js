import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import io from 'socket.io-client';
import RetroBoard from './retroboard';
import RefinementBoard from './refinementboard';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from './auth/login';
import LogoutButton from './auth/logout';
import Profile from './auth/profile';

// Set the endpoint for socket.io
const socket = io('http://localhost:3000');

function App() {
  const [message, setMessage] = useState('');
  const [roomId, setRoomId] = useState('');
  const [connected, setConnected] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [protectedData, setProtectedData] = useState(null);

  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    socket.on('connect', () => {
      setConnected(true);
      console.log('Connected to Socket.io server');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from Socket.io server');
    });

    socket.on('new-user', (message) => {
      setMessage(message);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('new-user');
    };
  }, []);

  // Fetch protected data after authentication
  useEffect(() => {
    if (isAuthenticated) {
      fetchProtectedData();
    }
  }, [isAuthenticated]);

  const fetchProtectedData = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('http://localhost:3000/api/protected', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setProtectedData(data);
    } catch (error) {
      console.error('Error fetching protected data:', error);
    }
  };

  const joinRoom = (room) => {
    setRoomId(room);
    socket.emit('join-room', room);
    console.log(`Joined room: ${room}`);
  };

  const createRoom = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('http://localhost:3000/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newRoomName, adminId: 'admin-id-placeholder' }),
      });
      const createdRoom = await response.json();
      setRooms((prevRooms) => [...prevRooms, createdRoom.room]);
      setNewRoomName('');
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  // Show a loading message while Auth0 is initializing
  if (isLoading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <Router>
      {!isAuthenticated ? (
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
          <LoginButton />
        </div>
      ) : (
        <div className="min-h-screen bg-[#121212]">
          <header className="bg-[#1C1C1C] text-[#E0E0E0] py-4">
            <div className="container mx-auto text-center">
              <h1 className="text-white font-bold">AgileFlow</h1>
              <nav className="mt-4">
                <NavLink
                  to="/"
                  className={({ isActive }) => (isActive ? 'text-[#03A9F4] mx-2 font-bold' : 'text-[#E0E0E0] mx-2')}
                >
                  Home
                </NavLink>
                <NavLink
                  to="/retro-board"
                  className={({ isActive }) => (isActive ? 'text-[#03A9F4] mx-2 font-bold' : 'text-[#E0E0E0] mx-2')}
                >
                  Retro Board
                </NavLink>
                <NavLink
                  to="/refinement-board"
                  className={({ isActive }) => (isActive ? 'text-[#03A9F4] mx-2 font-bold' : 'text-[#E0E0E0] mx-2')}
                >
                  Refinement Board
                </NavLink>
                <LogoutButton />
              </nav>
            </div>
          </header>

          <main className="container mx-auto my-10">
            <Profile />
            <Routes>
              <Route path="/retro-board" element={<RetroBoard />} />
              <Route path="/refinement-board" element={<RefinementBoard />} />
            </Routes>

            <div className="bg-[#1C1C1C] shadow-md rounded-lg p-6 my-6">
              <h3 className="text-xl font-semibold mb-4 text-[#E0E0E0]">Protected Data</h3>
              <pre className="text-[#E0E0E0]">{protectedData ? JSON.stringify(protectedData, null, 2) : 'Loading...'}</pre>
            </div>

            <div className="bg-[#1C1C1C] shadow-md rounded-lg p-6 my-6">
              <h3 className="text-xl font-semibold mb-4 text-[#E0E0E0]">Create a Room</h3>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Room Name"
                className="bg-[#333333] text-white p-2 rounded"
              />
              <button
                onClick={createRoom}
                className="bg-[#03A9F4] text-white px-4 py-2 rounded ml-2 hover:bg-[#0288D1]"
              >
                Create Room
              </button>
              <ul className="mt-4 text-[#E0E0E0]">
                {rooms.map((room) => (
                  <li key={room.id} className="my-2">
                    {room.name} - <button onClick={() => joinRoom(room.id)}>Join</button>
                  </li>
                ))}
              </ul>
            </div>
          </main>
        </div>
      )}
    </Router>
  );
}

export default App;