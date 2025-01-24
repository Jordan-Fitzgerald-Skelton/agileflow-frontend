import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import CreateRoomForm from './createRoomForm';

const socket = io('http://localhost:3000');

const RefinementBoard = () => {
  const roles = ['Developer', 'QA', 'UI', 'UX', 'Production', 'Architect'];

  const [role, setRole] = useState('');
  const [prediction, setPrediction] = useState('');
  const [predictionsList, setPredictionsList] = useState([]);
  const [isInRoom, setIsInRoom] = useState(false);
  //This will store the room details (room_id and invite code)
  const [roomDetails, setRoomDetails] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  //State for the popup form
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    //Waits for new predictions from the server
    socket.on('newPrediction', (data) => {
      setPredictionsList((prevPredictions) => [...prevPredictions, data]);
    });

    return () => {
      socket.off('newPrediction');
    };
  }, []);

  //Handles the room creation
  const handleCreateRoom = async ({ roomName, isPersistent }) => {
    try {
      const response = await fetch('http://localhost:3000/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName, isPersistent }),
      });
      if (!response.ok) {
        throw new Error('Failed to create room.');
      }
      const result = await response.json();
      setRoomDetails(result.room); // Store the room details
      setIsInRoom(true);
      setSuccess(`Room created! Invite Code: ${result.room.invite_code}`);
      setError('');
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  //Handles joining a room
  const handleJoinRoom = async () => {
    if (!inviteCode.trim() || inviteCode.length !== 6) {
      setError('Please enter a valid 6-character invite code.');
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
       //Stores the room details
      setRoomDetails(result.room);
      setIsInRoom(true);
      setSuccess(`Joined room successfully! Room ID: ${result.room.room_id}`);
      setError('');
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  //For role selection
  const handleAssignRole = (selectedRole) => {
    setRole(selectedRole);
    setError('');
  };

  //Validates and then set the prediction
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

  //Submits the prediction
  const handlePredictionSubmit = () => {
    if (!role) {
      setError('Please select a role before submitting.');
      return;
    }
    if (!roomDetails?.room_id) {
      setError('Room details are missing. Please create or join a room.');
      return;
    }
    socket.emit(
      'submitPrediction',
      { roomName: roomDetails.room_id, role, prediction: Number(prediction) },
      (response) => {
        if (response.success) {
          setPrediction('');
          setError('');
        } else {
          setError(response.message);
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] p-4">
      {!isInRoom && (
        <div className="flex space-x-4">
          <div className="w-1/2 bg-[#1C1C1C] shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-[#03A9F4]">Create a Room</h2>
            <button
              //Opens the popup form
              onClick={() => setIsModalOpen(true)}
              className="bg-[#03A9F4] text-white px-4 py-2 rounded mt-4 hover:opacity-80"
            >
              Create Room
            </button>
          </div>
          <div className="w-1/2 bg-[#1C1C1C] shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-[#03A9F4]">Join a Room</h2>
            <input
              type="text"
              placeholder="Enter invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="border border-[#03A9F4] rounded w-full px-4 py-2 mt-2 bg-[#121212] text-[#E0E0E0]"
            />
            <button
              onClick={handleJoinRoom}
              className="bg-[#4CAF50] text-white px-4 py-2 rounded mt-4 hover:opacity-80"
            >
              Join Room
            </button>
          </div>
        </div>
      )}

      <CreateRoomForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError('');
        }}
        onCreateRoom={handleCreateRoom}
      />

      {/* Role selection */}
      {isInRoom && !role && (
        <div className="bg-[#1C1C1C] shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-[#03A9F4]">Select Your Role</h2>
          <select
            value={role}
            onChange={(e) => handleAssignRole(e.target.value)}
            className="border border-[#03A9F4] rounded w-full px-4 py-2 bg-[#121212] text-[#E0E0E0]"
          >
            <option value="">Select a role...</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      )}

      {/*Prediction submission*/}
      {role && isInRoom && (
        <div className="bg-[#1C1C1C] shadow-md rounded-lg p-6 mt-6">
          <h2 className="text-2xl font-semibold text-[#FF4081]">Make Your Prediction</h2>
          <input
            type="number"
            value={prediction}
            onChange={handlePredictionChange}
            className="border border-[#FF4081] rounded w-full px-4 py-2 mt-2 bg-[#121212] text-[#E0E0E0]"
            placeholder="Enter your prediction (in days)"
          />
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <button
            onClick={handlePredictionSubmit}
            className="bg-[#FF4081] text-white px-4 py-2 rounded mt-4 hover:bg-[#D81B60]"
            disabled={!!error || prediction === ''}
          >
            Submit Prediction
          </button>
        </div>
      )}

      {/*Displays the predictions*/}
      {predictionsList.length > 0 && (
        <div className="bg-[#1C1C1C] shadow-md rounded-lg p-6 mt-6">
          <h3 className="text-xl font-semibold text-[#03A9F4]">Submitted Predictions</h3>
          <ul className="mt-4">
            {predictionsList.map((item, index) => (
              <li key={index} className="text-[#E0E0E0]">
                {item.role}: {item.prediction} days
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Error and Success Messages */}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">{success}</p>}
    </div>
  );
};

export default RefinementBoard;