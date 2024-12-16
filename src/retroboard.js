import React, { useState } from 'react';

const RetroBoard = () => {
  const [goWellComments, setGoWellComments] = useState([]);
  const [didntGoWellComments, setDidntGoWellComments] = useState([]);
  const [areasForImprovementComments, setAreasForImprovementComments] = useState([]);
  const [actionsComments, setActionsComments] = useState([]);

  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [roomCreated, setRoomCreated] = useState(false);

  //handles adding comments to each section
  const handleAddComment = (section, comment) => {
    if (section === 'goWell') {
      setGoWellComments([...goWellComments, comment]);
    } else if (section === 'didntGoWell') {
      setDidntGoWellComments([...didntGoWellComments, comment]);
    } else if (section === 'areasForImprovement') {
      setAreasForImprovementComments([...areasForImprovementComments, comment]);
    } else if (section === 'actions') {
      setActionsComments([...actionsComments, comment]);
    }
  };

  //handles room creation
  const handleCreateRoom = () => {
    setRoomCreated(true);
    setIsInRoom(true);
  };

  //handle room joining
  const handleJoinRoom = () => {
    if (inviteCode) {
      setIsInRoom(true);
    } else {
      setError('Please enter a valid invite code.');
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] p-4">
      {!isInRoom && !roomCreated && (
        <div className="flex space-x-4">
          <div className="w-1/2 bg-[#1C1C1C] shadow-lg rounded-lg p-6 mr-4 space-y-4">
            <h2 className="text-2xl font-semibold mb-4 text-[#03A9F4]">Available Rooms</h2>
            <ul className="space-y-2">
              {/*loops through the array of rooms to display them*/}
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
          {/*room creation and joining*/}
          <div className="w-1/2 bg-[#1C1C1C] shadow-lg rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-semibold mb-4 text-[#03A9F4]">Retro Board</h2>
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
            </div>
          </div>
        </div>
      )}
      {(isInRoom || roomCreated) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">

          {/*what did go well*/}
          <div className="bg-[#1C1C1C] shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-[#39D353]">What did go well</h3>
            <input
              type="text"
              placeholder="Add comment"
              className="border border-[#39D353] rounded w-full px-2 py-1 mt-2 text-[#E0E0E0] bg-[#121212]"
              id="goWellComment"
            />
            <button
              className="mt-2 bg-[#39D353] text-white px-4 py-1 rounded hover:bg-[#2D9F41]"
              onClick={() => {
                const comment = document.getElementById('goWellComment').value;
                if (comment) {
                  handleAddComment('goWell', comment);
                  //clear the input field after adding
                  document.getElementById('goWellComment').value = '';
                }
              }}
            >
              Add
            </button>
            <ul className="mt-4">
              {goWellComments.map((comment, index) => (
                <li key={index} className="text-[#E0E0E0] mb-1">{comment}</li>
              ))}
            </ul>
          </div>

          {/*what didn't go well*/}
          <div className="bg-[#1C1C1C] shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-[#FF4081]">What didn't go well</h3>
            <input
              type="text"
              placeholder="Add comment"
              className="border border-[#FF4081] rounded w-full px-2 py-1 mt-2 text-[#E0E0E0] bg-[#121212]"
              id="didntGoWellComment"
            />
            <button
              className="mt-2 bg-[#FF4081] text-white px-4 py-1 rounded hover:bg-[#D81B60]"
              onClick={() => {
                const comment = document.getElementById('didntGoWellComment').value;
                if (comment) {
                  handleAddComment('didntGoWell', comment);
                  //clear the input field after adding
                  document.getElementById('didntGoWellComment').value = '';
                }
              }}
            >
              Add
            </button>
            <ul className="mt-4">
              {didntGoWellComments.map((comment, index) => (
                <li key={index} className="text-[#E0E0E0] mb-1">{comment}</li>
              ))}
            </ul>
          </div>

          {/*areas for improvement*/}
          <div className="bg-[#1C1C1C] shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-[#03A9F4]">Areas for improvement</h3>
            <input
              type="text"
              placeholder="Add comment"
              className="border border-[#03A9F4] rounded w-full px-2 py-1 mt-2 text-[#E0E0E0] bg-[#121212]"
              id="areasForImprovementComment"
            />
            <button
              className="mt-2 bg-[#03A9F4] text-white px-4 py-1 rounded hover:bg-[#0288D1]"
              onClick={() => {
                const comment = document.getElementById('areasForImprovementComment').value;
                if (comment) {
                  handleAddComment('areasForImprovement', comment);
                  //clear the input field after adding
                  document.getElementById('areasForImprovementComment').value = '';
                }
              }}
            >
              Add
            </button>
            <ul className="mt-4">
              {areasForImprovementComments.map((comment, index) => (
                <li key={index} className="text-[#E0E0E0] mb-1">{comment}</li>
              ))}
            </ul>
          </div>

          {/*actions*/}
          <div className="bg-[#1C1C1C] shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-[#9C27B0]">Actions</h3>
            <input
              type="text"
              placeholder="Add comment"
              className="border border-[#9C27B0] rounded w-full px-2 py-1 mt-2 text-[#E0E0E0] bg-[#121212]"
              id="actionsComment"
            />
            <button
              className="mt-2 bg-[#9C27B0] text-white px-4 py-1 rounded hover:bg-[#8E24AA]"
              onClick={() => {
                const comment = document.getElementById('actionsComment').value;
                if (comment) {
                  handleAddComment('actions', comment);
                  //clear the input field after adding
                  document.getElementById('actionsComment').value = '';
                }
              }}
            >
              Add
            </button>
            <ul className="mt-4">
              {actionsComments.map((comment, index) => (
                <li key={index} className="text-[#E0E0E0] mb-1">{comment}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetroBoard;