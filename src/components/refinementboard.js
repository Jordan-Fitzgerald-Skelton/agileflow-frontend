import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

const RefinementBoard = () => {
  const roles = ['Developer', 'QA', 'UI', 'UX', 'Production', 'Architect'];

  const [role, setRole] = useState('');
  const [prediction, setPrediction] = useState('');
  const [predictionsList, setPredictionsList] = useState([]);
  const [isInRoom, setIsInRoom] = useState(false);
  const [roomCreated, setRoomCreated] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    socket.on('newPrediction', (data) => {
      setPredictionsList((prevPredictions) => [...prevPredictions, data]);
    });

    return () => {
      socket.off('newPrediction');
    };
  }, []);

  const handleCreateRoom = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: 'RefinementRoom' }),
      });
      if (!response.ok) throw new Error('Failed to create room.');
      const result = await response.json();
      setRoomCreated(true);
      setIsInRoom(true);
      setInviteCode(result.room.inviteCode);
      setSuccess('Room created successfully.');
      setError('');
    } catch (error) {
      setError(error.message);
      setSuccess('');
    }
  };

  const handleJoinRoom = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter a valid invite code.');
      return;
    }
    try {
      const response = await fetch('http://localhost:4000/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode }),
      });
      if (!response.ok) throw new Error('Invalid invite code or failed to join the room.');
      setRoomCreated(true);
      setIsInRoom(true);
      setError('');
      setSuccess('Joined room successfully.');
    } catch (error) {
      setError(error.message);
      setSuccess('');
    }
  };

  const handleLeaveRoom = () => {
    socket.emit('leaveRoom', { roomName: 'RefinementRoom' });
    setIsInRoom(false);
    setRoomCreated(false);
    setRole('');
    setPrediction('');
    setPredictionsList([]);
    setInviteCode('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] p-4 relative">
      {isInRoom && (
        <button
          onClick={handleLeaveRoom}
          className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Leave Room
        </button>
      )}
      {!isInRoom && !roomCreated && (
        <div className="flex space-x-4">
          <div className="w-1/2 bg-[#1C1C1C] shadow-lg rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-[#03A9F4]">Refinement Board</h2>
            <button onClick={handleCreateRoom} className="bg-[#03A9F4] text-white px-4 py-2 rounded">
              Create Room
            </button>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Enter invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="border border-[#03A9F4] rounded w-full px-4 py-2 text-[#E0E0E0] bg-[#121212]"
              />
              <button onClick={handleJoinRoom} className="mt-2 bg-[#4CAF50] text-white px-4 py-2 rounded">
                Join Room
              </button>
              {error && <p className="text-red-500 mt-2">{error}</p>}
              {success && <p className="text-green-500 mt-2">{success}</p>}
            </div>
          </div>
        </div>
      )}
      {isInRoom && role && (
        <div className="bg-[#1C1C1C] shadow-md rounded-lg p-6 max-w-md mx-auto mt-10">
          <h2 className="text-2xl font-semibold text-[#FF4081]">Make Your Prediction</h2>
          <input
            type="number"
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
            className="border border-[#FF4081] rounded w-full px-2 py-1 mt-2"
            placeholder="Enter your predicted time"
          />
          <button
            onClick={() => socket.emit('submitPrediction', { roomName: 'RefinementRoom', role, prediction })}
            className="mt-4 bg-[#FF4081] text-white px-4 py-2 rounded"
          >
            Submit Prediction
          </button>
        </div>
      )}
    </div>
  );
};

export default RefinementBoard;
