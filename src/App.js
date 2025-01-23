import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import RetroBoard from './retroboard';
import RefinementBoard from './refinementboard';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from './auth/login';
import LogoutButton from './auth/logout';
import Profile from './auth/profile';

const socket = io('http://localhost:3000');

function App() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const { isAuthenticated, isLoading } = useAuth0();

  //This will initialise the socket.io server
  useEffect(() => {
    socket.on('connect', () => console.log('Connected to Socket.io server'));
    socket.on('disconnect', () => console.log('Disconnected from Socket.io server'));
    socket.on('newPrediction', (data) => {
      setPredictions((prev) => [...prev, data]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('newPrediction');
    };
  }, []);

  //For creating a new room
  const createRoom = async (roomName, isPersistent) => {
    try {
      const response = await axios.post('http://localhost:3000/api/rooms', { roomName, isPersistent });
      const { room } = response.data;
      setNewRoomName('');
      setError('');
      setSuccess(`Room "${room.room_id}" created successfully.`);
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room. Please try again.');
      setSuccess('');
    }
  };

  //For Join an existing room
  const joinRoom = async () => {
    if (!inviteCode) {
      setError('Please provide a valid invite code.');
      setSuccess('');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/rooms/join', { inviteCode });
      const { room } = response.data;
      setCurrentRoom(room);
      setInviteCode('');
      setError('');
      setSuccess(`Successfully joined room "${room.room_id}".`);
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join the room. Please check the invite code.');
      setSuccess('');
    }
  };

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
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-white font-bold">AgileFlow</h1>
              <nav className="mt-4 flex space-x-6">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive
                      ? 'text-[#03A9F4] text-lg font-bold px-4 py-2 hover:bg-[#1C1C1C] rounded'
                      : 'text-[#E0E0E0] text-lg px-4 py-2 hover:bg-[#1C1C1C] rounded'
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/retro-board"
                  className={({ isActive }) =>
                    isActive
                      ? 'text-[#03A9F4] text-lg font-bold px-4 py-2 hover:bg-[#1C1C1C] rounded'
                      : 'text-[#E0E0E0] text-lg px-4 py-2 hover:bg-[#1C1C1C] rounded'
                  }
                >
                  Retro Board
                </NavLink>
                <NavLink
                  to="/refinement-board"
                  className={({ isActive }) =>
                    isActive
                      ? 'text-[#03A9F4] text-lg font-bold px-4 py-2 hover:bg-[#1C1C1C] rounded'
                      : 'text-[#E0E0E0] text-lg px-4 py-2 hover:bg-[#1C1C1C] rounded'
                  }
                >
                  Refinement Board
                </NavLink>
              </nav>
              <div className="flex items-center space-x-4">
                <Profile />
                <LogoutButton />
              </div>
            </div>
          </header>

          <main className="container mx-auto my-10">
            <Routes>
              <Route path="/retro-board" element={<RetroBoard />} />
              <Route path="/refinement-board" element={<RefinementBoard />} />
            </Routes>
            <div className="bg-[#1C1C1C] shadow-md rounded-lg p-6 my-6">
              <h3 className="text-xl font-semibold mb-4 text-[#E0E0E0]">What is the Refinement Board for?</h3>
              <p className="text-[#E0E0E0]">
                The Refinement Board helps teams estimate the time required to complete tickets during development.
                Developers and QA members provide estimates for their respective stages, and averages are calculated
                automatically for the team to make better decisions collaboratively.
              </p>
            </div>
            <div className="bg-[#1C1C1C] shadow-md rounded-lg p-6 my-6">
              <h3 className="text-xl font-semibold mb-4 text-[#E0E0E0]">What is the Retro Board for?</h3>
              <p className="text-[#E0E0E0]">
                The Retro Board allows teams to review past sprints by giving feedback on what went well, what didn’t,
                and areas of improvement. Actions are created and assigned to team members to improve processes for the
                next sprint.
              </p>
            </div>

            {/*Display an error or success messages*/}
            {error && <div className="bg-red-500 text-white p-2 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-500 text-white p-2 rounded mb-4">{success}</div>}

            {/*Current Room Information */}
            <div className="bg-[#1C1C1C] shadow-md rounded-lg p-6 my-6">
              <h3 className="text-xl font-semibold mb-4 text-[#E0E0E0]">Current Room</h3>
              {currentRoom ? (
                <p className="text-[#E0E0E0]">
                  Room Name: {currentRoom.room_id}, Invite Code: {currentRoom.invite_code}
                </p>
              ) : (
                <p className="text-[#E0E0E0]">No active room. Join or create a room to get started.</p>
              )}
            </div>
          </main>
        </div>
      )}
    </Router>
  );
}

export default App;