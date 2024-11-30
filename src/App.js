import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import io from 'socket.io-client';
import RetroBoard from './retroboard';
import RefinementBoard from './refinementboard';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from './auth/login';
import LogoutButton from './auth/logout';
import Profile from './auth/profile';

//sets the endpoint
const socket = io('http://localhost:3000');

function App() {
  const [message, setMessage] = useState('');
  const [roomId, setRoomId] = useState('');
  const [connected, setConnected] = useState(false);

  const { isAuthenticated, isLoading } = useAuth0();

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

  // for joining a room 
  const joinRoom = (room) => {
    setRoomId(room);
    socket.emit('join-room', room);
    console.log(`Joined room: ${room}`);
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
            <Profile /> {/* Optional: Show user profile */}
            <Routes>
              <Route path="/retro-board" element={<RetroBoard />} />
              <Route path="/refinement-board" element={<RefinementBoard />} />
            </Routes>

            <div className="bg-[#1C1C1C] shadow-md rounded-lg p-6 my-6">
              <section className="bg-[#1C1C1C] shadow-md rounded-lg p-6">
                <h2 className="text-white font-semibold mb-4">Welcome to AgileFlow</h2>
                <p className="text-[#E0E0E0]">Click on "Retro Board" or "Refinement Board" above to start your session.</p>
              </section>
            </div>

            <div className="bg-[#1C1C1C] shadow-md rounded-lg p-6 my-6">
              <h3 className="text-xl font-semibold mb-4 text-[#E0E0E0]">Socket.io Status</h3>
              {connected ? (
                <p className="text-[#03A9F4]">Connected to Server</p>
              ) : (
                <p className="text-[#FF4081]">Connecting...</p>
              )}
              <div className="mt-4">
                <button
                  onClick={() => joinRoom('room1')}
                  className="bg-[#03A9F4] text-white px-4 py-2 rounded mr-2 hover:bg-[#0288D1]"
                >
                  Join Room 1
                </button>
                <button
                  onClick={() => joinRoom('room2')}
                  className="bg-[#FF4081] text-white px-4 py-2 rounded hover:bg-[#D81B60]"
                >
                  Join Room 2
                </button>
              </div>
              <div className="mt-4">
                <h4 className="text-lg font-semibold text-[#E0E0E0]">Room: {roomId || 'No room joined'}</h4>
                <p className="text-[#E0E0E0]">{message || 'Waiting for new messages...'}</p>
              </div>
            </div>
          </main>
        </div>
      )}
    </Router>
  );
}

export default App;