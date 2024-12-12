import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import io from 'socket.io-client';
import RetroBoard from './retroboard';
import RefinementBoard from './refinementboard';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from './auth/login';
import LogoutButton from './auth/logout';
import Profile from './auth/profile';

//Where the server is running
const socket = io('http://localhost:3000');

function App() {
  //create a room
  const [newRoomName, setNewRoomName] = useState('');
  //join a room
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  //for Auth0 authentication 
  const { isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to Socket.io server');
    });
    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.io server');
    });
    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  //for joining a room
  const joinRoom = async () => {
    if (!inviteCode) {
      setError('Please provide a valid invite code.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/api/rooms/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inviteCode }),
      });

      if (!response.ok) {
        throw new Error('Error joining room');
      }
      const roomData = await response.json();
      console.log('Room joined:', roomData);
      //clears the input field for the invite code
      setInviteCode('');
      //clears any errors
      setError('');
    } catch (error) {
      setError('Failed to join the room');
      console.error('Error joining room:', error);
    }
  };

  //for creating a room
  const createRoom = async () => {
    if (!newRoomName) {
      setError('Please provide a valid room name.');
      return;
    }
    try {
      const roomData = { name: newRoomName };
      const response = await fetch('http://localhost:3000/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
      });

      if (!response.ok) {
        throw new Error('Error creating room');
      }
      const createdRoom = await response.json();
      console.log('Room created:', createdRoom);
      setNewRoomName(''); // Clear the room name input field
      //clears any errors
      setError('');
    } catch (error) {
      setError('Failed to create room');
      console.error('Error creating room:', error);
    }
  };

  //show a loading message while Auth0 is starting
  if (isLoading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <Router>
      {/*starts when a user is authenticated*/} 
      {!isAuthenticated ? (
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
          <LoginButton />
        </div>
      ) : (
        <div className="min-h-screen bg-[#121212]">
          <header className="bg-[#1C1C1C] text-[#E0E0E0] py-4">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-white font-bold">AgileFlow</h1>
              {/*nav bar*/}
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
                The Refinement Board is designed to streamline the process involved in evaluating and vote on the length of time, 
                different roles of a team would expect a particular ticket to take to complete during refinement meetings. 
                Traditionally in refinement meetings would involve team members from Development, QA, and Product teams reviewing ticket descriptions, 
                validating acceptance criteria, and estimating the length of time required to complete each ticket. Instead of relying on direct 
                messages to share estimates, causing delays, the Refinement Board provides a space where everyone can contribute their inputs 
                together abd simultaneously.
              </p>
            </div>

            <div className="bg-[#1C1C1C] shadow-md rounded-lg p-6 my-6">
              <h3 className="text-xl font-semibold mb-4 text-[#E0E0E0]">What is the Retro Board for?</h3>
              <p className="text-[#E0E0E0]">
                The Retro Board helps teams conduct effective retrospective meetings by organizing feedback into four sections: 
                "what went well", "what didn’t go well", "areas for improvement", and "actions". These meetings are an impportant part of reflecting 
                on the past sprint and identifying ways to help the team work more effectivly moving forward. This process results in "action" items being created,
                with tasks for members of the team to work on to help the team. Traditionally, team leaders manually create action 
                tickets based on the discussion, which can be time-consuming and lead to delays. The Retro Board plans to automates this process 
                by generating alerts for "action" items. This will help to ensures that the team can work on improvements much faster and without delay.
              </p>
            </div>
          </main>
        </div>
      )}
    </Router>
  );
}

export default App;