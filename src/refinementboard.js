import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Dialog } from '@headlessui/react';

const socket = io('http://localhost:3000');

function CreateRoomForm({ isOpen, onClose, onCreateRoom }) {
  const [roomName, setRoomName] = useState('');
  const [isPersistent, setIsPersistent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateRoom({ roomName, isPersistent });
    setRoomName('');
    setIsPersistent(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <div className="relative bg-white rounded max-w-sm mx-auto p-6">
          <Dialog.Title className="text-xl font-bold">Create Room</Dialog.Title>
          <form onSubmit={handleSubmit}>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Room Name</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="mt-1 p-2 w-full border rounded"
                required
              />
            </div>
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isPersistent}
                  onChange={(e) => setIsPersistent(e.target.checked)}
                  className="mr-2"
                />
                Persistent
              </label>
            </div>
            <div className="mt-6">
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                Create Room
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}

const RefinementBoard = () => {
  const roles = ['Developer', 'QA', 'UI', 'UX', 'Production', 'Architect'];

  const [role, setRole] = useState('');
  const [prediction, setPrediction] = useState('');
  const [predictionsList, setPredictionsList] = useState([]);
  const [isInRoom, setIsInRoom] = useState(false);
  const [roomDetails, setRoomDetails] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleNewPrediction = (data) => {
      setPredictionsList((prev) => [...prev, data]);
    };

    socket.on('newPrediction', handleNewPrediction);
    return () => {
      socket.off('newPrediction', handleNewPrediction);
    };
  }, []);

  const handleCreateRoom = async ({ roomName, isPersistent }) => {
    try {
      const response = await fetch('http://localhost:3000/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, isPersistent }),
      });
      if (!response.ok) {
        throw new Error('Failed to create room.');
      }
      const result = await response.json();
      setRoomDetails(result.room); // Store room details
      setIsInRoom(true);
      setSuccess(`Room created! Invite Code: ${result.room.invite_code}`);
      setError('');
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  // Handles joining an existing room
  const handleJoinRoom = async () => {
    if (!inviteCode.trim() || inviteCode.length !== 6) {
      setError('Please enter a valid 6-character invite code.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode }),
      });
      if (!response.ok) {
        throw new Error('Invalid invite code or failed to join the room.');
      }
      const result = await response.json();
      setRoomDetails(result.room);
      setIsInRoom(true);
      setSuccess(`Joined room successfully! Room ID: ${result.room.room_id}`);
      setError('');
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  // Assign a role to the user
  const handleAssignRole = (selectedRole) => {
    setRole(selectedRole);
  };

  // Validates and updates the predictions 
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

  // Submit the prediction via the socket connection
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
      {/* If not in a room, show room selection/creation UI */}
      {!isInRoom && (
        <div className="flex space-x-4">
          {/* Available Rooms Section */}
          <div className="w-1/2 bg-[#1C1C1C] shadow-lg rounded-lg p-6 mr-4 space-y-4">
            <h2 className="text-2xl font-semibold mb-4 text-[#03A9F4]">Available Rooms</h2>
            <ul className="space-y-2">
              {['Room 1', 'Room 2', 'Room 3'].map((room, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center text-[#E0E0E0] border-b border-[#444] pb-2"
                >
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

          {/* Room Creation and Join Section */}
          <div className="w-1/2 bg-[#1C1C1C] shadow-lg rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-semibold mb-4 text-[#03A9F4]">Retro Board</h2>
            <button
              onClick={() => setIsModalOpen(true)}
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
            </div>
          </div>
        </div>
      )}

      {/* Include the CreateRoomForm modal */}
      <CreateRoomForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError('');
        }}
        onCreateRoom={handleCreateRoom}
      />

      {/* Once in a room, show role selection if not yet assigned */}
      {isInRoom && !role && (
        <div className="bg-[#1C1C1C] shadow-md rounded-lg p-6 mt-6">
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

      {/* Prediction submission section */}
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
            disabled={Boolean(error) || prediction === ''}
          >
            Submit Prediction
          </button>
        </div>
      )}

      {/* Display submitted predictions */}
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

      {/* Global error and success messages */}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">{success}</p>}
    </div>
  );
};

export default RefinementBoard;