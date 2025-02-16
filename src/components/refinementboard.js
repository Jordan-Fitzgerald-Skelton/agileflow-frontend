import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RefinementBoard = ({ socket }) => {
  const [rooms, setRooms] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [roomName, setRoomName] = useState('');
  const [isPersistent, setIsPersistent] = useState(false);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const response = await axios.get('http://localhost:3000/rooms');
        setRooms(response.data.rooms);
      } catch (err) {
        console.error('Error fetching rooms:', err);
      }
    }
    fetchRooms();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/rooms', { roomName, isPersistent });
      setRooms((prev) => [...prev, response.data.room]);
      setRoomName('');
      setIsPersistent(false);
    } catch (err) {
      setError('Failed to create room. Please try again.');
    }
  };

  const handleJoinRoom = async () => {
    if (!inviteCode.trim() || inviteCode.length !== 6) {
      setError('Please enter a valid 6-character invite code.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/rooms/join', { inviteCode });
      console.log('Joined Room:', response.data.room);
    } catch (err) {
      setError('Invalid invite code or failed to join the room.');
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] p-4">
      <div className="flex space-x-4">
        <div className="w-1/2 bg-[#1C1C1C] shadow-lg rounded-lg p-6 mr-4 space-y-4">
          <h2 className="text-2xl font-semibold mb-4 text-[#03A9F4]">Available Rooms</h2>
          <ul className="space-y-2">
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <li
                  key={room.room_id}
                  className="flex justify-between items-center text-[#E0E0E0] border-b border-[#444] pb-2"
                >
                  <span>{room.name}</span>
                  <button className="bg-[#4CAF50] text-white px-4 py-2 rounded hover:opacity-80">
                    Join Room
                  </button>
                </li>
              ))
            ) : (
              <p>No available rooms</p>
            )}
          </ul>
        </div>

        <div className="w-1/2 bg-[#1C1C1C] shadow-lg rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-semibold mb-4 text-[#03A9F4]">Retro Board</h2>
          <form onSubmit={handleCreateRoom}>
            <div>
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
    </div>
  );
};

export default RefinementBoard;