import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

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

  //Handles when a user creates a room
  const handleCreateRoom = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName: 'RefinementRoom' }),
      });
      if (!response.ok) {
        throw new Error('Failed to create room.');
      }
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

  //Handles when a user joins a room
  const handleJoinRoom = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter a valid invite code.');
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
        throw new Error('Invalid invite code or failed to join the room.');
      }
      const result = await response.json();
      setRoomCreated(true);
      setIsInRoom(true);
      setError('');
      setSuccess('Joined room successfully.');
    } catch (error) {
      setError(error.message);
      setSuccess('');
    }
  };

  //Role selection
  const handleAssignRole = (selectedRole) => {
    setRole(selectedRole);
  };

  //Takes the users inputs
  const handlePredictionChange = (e) => {
    const value = e.target.value;
    setError('');
    if (value < 0) {
      setError('Prediction cannot be negative.');
    } else if (value > 1000) {
      setError('Prediction cannot exceed 1000 days.');
    } else {
      setPrediction(value);
    }
  };

  //Handles when the usre submits a prediction
  const handlePredictionSubmit = () => {
    if (prediction === '' || error) {
      setError('Please enter a valid prediction.');
      return;
    }
    socket.emit('submitPrediction', { roomName: 'RefinementRoom', role, prediction: Number(prediction) }, (response) => {
      if (response.success) {
        setPredictionsList([...predictionsList, { role, prediction }]);
        setPrediction('');
        setError('');
      } else {
        setError(response.message);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] p-4">
      {!isInRoom && !roomCreated && (
        <div className="flex space-x-4">
          <div className="w-1/2 bg-[#1C1C1C] shadow-lg rounded-lg p-6 mr-4 space-y-4">
            <h2 className="text-2xl font-semibold mb-4 text-[#03A9F4]">Available Rooms</h2>
            <ul className="space-y-2">
              {['Room 1', 'Room 2', 'Room 3'].map((room, index) => (
                <li key={index} className="flex justify-between items-center text-[#E0E0E0] border-b border-[#444] pb-2">
                  <span>{room}</span>
                  <button
                    className="bg-[#4CAF50] text-white px-4 py-2 rounded hover:opacity-80"
                    disabled
                  >
                    Join Room
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-1/2 bg-[#1C1C1C] shadow-lg rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-semibold mb-4 text-[#03A9F4]">Refinement Board</h2>
            <button
              onClick={handleCreateRoom}
              className="bg-[#03A9F4] text-white px-4 py-2 rounded hover:opacity-80"
            >
              Create Room
            </button>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Enter invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="border border-[#03A9F4] rounded w-full px-4 py-2 text-[#E0E0E0] bg-[#121212] placeholder-[#E0E0E0] focus:ring-2 focus:ring-[#03A9F4] focus:outline-none"
              />
              <button
                onClick={handleJoinRoom}
                className="mt-2 bg-[#4CAF50] text-white px-4 py-2 rounded hover:opacity-80"
              >
                Join Room
              </button>
              {error && <p className="text-red-500 mt-2">{error}</p>}
              {success && <p className="text-green-500 mt-2">{success}</p>}
            </div>
          </div>
        </div>
      )}

      {isInRoom && !role && (
        <div className="bg-[#1C1C1C] shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-[#03A9F4]">Select Your Role</h2>
          <select
            value={role}
            onChange={(e) => handleAssignRole(e.target.value)}
            className="border border-[#03A9F4] rounded w-full px-2 py-1 mt-2 text-[#E0E0E0] bg-[#121212]"
          >
            <option value="">Select a role...</option>
            {roles.map((roleOption) => (
              <option key={roleOption} value={roleOption}>
                {roleOption}
              </option>
            ))}
          </select>
        </div>
      )}

      {role && isInRoom && (
        <div className="bg-[#1C1C1C] shadow-md rounded-lg p-6 max-w-md mx-auto mt-10">
          <h2 className="text-2xl font-semibold mb-4 text-[#FF4081]">Make Your Prediction</h2>
          <div>
            <label className="block text-lg font-semibold text-[#E0E0E0]">Your Prediction (in days)</label>
            <input
              type="number"
              value={prediction}
              onChange={handlePredictionChange}
              className="border border-[#FF4081] rounded w-full px-2 py-1 mt-2 text-[#E0E0E0] bg-[#121212]"
              placeholder="Enter your predicted time"
            />
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
          <button
            onClick={handlePredictionSubmit}
            className="mt-4 bg-[#FF4081] text-white px-4 py-2 rounded hover:bg-[#D81B60]"
            disabled={!!error || prediction === ''}
          >
            Submit Prediction
          </button>
        </div>
      )}

      {predictionsList.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4 text-[#03A9F4]">Submitted Predictions:</h3>
          <ul>
            {predictionsList.map((item, index) => (
              <li key={index} className="text-[#E0E0E0] mb-2">
                {item.role} predicted {item.prediction} days
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RefinementBoard;