import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

const RetroBoard = () => {
  const {
    createAndJoinRetroRoom,
    joinRetroRoom,
    createAction,
    comments,
    actions,
    roomId,
    error,
    loading,
    leaveRoom,
    socket,
  } = useSocket();

  // Local state for room management
  const [inviteCode, setInviteCode] = useState('');
  const [localError, setLocalError] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [roomCreated, setRoomCreated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Controlled inputs for comment and action entries
  const [goWellInput, setGoWellInput] = useState('');
  const [didntGoWellInput, setDidntGoWellInput] = useState('');
  const [improvementInput, setImprovementInput] = useState('');
  const [actionInput, setActionInput] = useState('');

  // Handle room creation and joining
  const handleCreateRoom = async () => {
    try {
      const roomInviteCode = await createAndJoinRetroRoom();
      if (roomInviteCode) {
        setInviteCode(roomInviteCode);
        setRoomCreated(true);
        setIsInRoom(true);
        setIsAdmin(true);
      }
    } catch (err) {
      setLocalError('Error creating room. Please try again.');
    }
  };

  const handleJoinRoom = async () => {
    if (inviteCode.trim() === '') {
      setLocalError('Please enter a valid invite code.');
      return;
    }
    try {
      const success = await joinRetroRoom(inviteCode);
      if (success) {
        setIsInRoom(true);
        setIsAdmin(false);
      } else {
        setLocalError('Failed to join the room. Please try again.');
      }
    } catch (err) {
      setLocalError('Failed to join the room. Please try again.');
    }
  };

  const handleAddComment = async (category, text) => {
    if (!text.trim()) return;
    try {
      await socket.emit('add_comment', { category, text, roomId });
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  // Handle adding comments
  useEffect(() => {
    if (!socket) return;

    const handleNewComment = (newComment) => {
      // Only update the comments array if it's from the correct room
      if (newComment.roomId === roomId) {
        // Add the new comment to the correct category
        switch (newComment.category) {
          case 'goWell':
            goWellComments.push(newComment);
            break;
          case 'didntGoWell':
            didntGoWellComments.push(newComment);
            break;
          case 'areasForImprovement':
            improvementComments.push(newComment);
            break;
          default:
            break;
        }
      }
    };

    socket.on('new_comment', handleNewComment);
    return () => {
      socket.off('new_comment', handleNewComment);
    };
  }, [socket, roomId, comments]);

  // Room cleanup when leaving
  const handleLeaveRoom = async () => {
    try {
      await leaveRoom();
      setIsInRoom(false);
      setRoomCreated(false);
      setInviteCode('');
      setIsAdmin(false);
    } catch (err) {
      setLocalError('Error leaving room. Please try again.');
    }
  };

  // Filter global comments by category
  const goWellComments = comments.filter(c => c.category === 'goWell');
  const didntGoWellComments = comments.filter(c => c.category === 'didntGoWell');
  const improvementComments = comments.filter(c => c.category === 'areasForImprovement');

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] p-4 relative">
      {/* Leave Room Button */}
      {(isInRoom || roomCreated) && (
        <div className="absolute top-4 left-4">
          <button
            onClick={handleLeaveRoom}
            className="bg-red-500 text-white px-4 py-2 rounded hover:opacity-80"
          >
            Leave Room
          </button>
        </div>
      )}
      
      {!(isInRoom || roomCreated) ? (
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="w-full sm:w-1/2 bg-[#1C1C1C] shadow-lg rounded-lg p-6 space-y-4">
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
              {(localError || error) && (
                <p className="text-red-500 mt-2">{localError || error}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-center text-sm mb-4">Room ID: {roomId}</p>
          {isAdmin && roomId && (
            <p className="text-center text-sm mb-4">
              Invite Code: <span className="font-bold text-[#03A9F4]">{inviteCode}</span>
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* What did go well */}
            <div className="bg-[#1C1C1C] shadow-md rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-[#39D353]">What did go well</h3>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Add comment"
                  value={goWellInput}
                  onChange={(e) => setGoWellInput(e.target.value)}
                  className="border border-[#39D353] rounded w-full px-2 py-1 text-[#E0E0E0] bg-[#121212]"
                />
                <button
                  className="ml-2 bg-[#39D353] text-white px-4 py-1 rounded hover:bg-[#2D9F41]"
                  onClick={async () => {
                    await handleAddComment('goWell', goWellInput);
                    setGoWellInput('');
                  }}
                >
                  Add
                </button>
              </div>
              <ul className="mt-4">
                {goWellComments.map((comment, index) => (
                  <li key={index} className="text-[#E0E0E0] mb-1">{comment.text}</li>
                ))}
              </ul>
            </div>

            {/* What didn't go well */}
            <div className="bg-[#1C1C1C] shadow-md rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-[#FF4081]">What didn't go well</h3>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Add comment"
                  value={didntGoWellInput}
                  onChange={(e) => setDidntGoWellInput(e.target.value)}
                  className="border border-[#FF4081] rounded w-full px-2 py-1 text-[#E0E0E0] bg-[#121212]"
                />
                <button
                  className="ml-2 bg-[#FF4081] text-white px-4 py-1 rounded hover:bg-[#D81B60]"
                  onClick={async () => {
                    await handleAddComment('didntGoWell', didntGoWellInput);
                    setDidntGoWellInput('');
                  }}
                >
                  Add
                </button>
              </div>
              <ul className="mt-4">
                {didntGoWellComments.map((comment, index) => (
                  <li key={index} className="text-[#E0E0E0] mb-1">{comment.text}</li>
                ))}
              </ul>
            </div>


            {/* Areas for improvement */}
            <div className="bg-[#1C1C1C] shadow-md rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-[#03A9F4]">Areas for improvement</h3>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Add comment"
                  value={improvementInput}
                  onChange={(e) => setImprovementInput(e.target.value)}
                  className="border border-[#03A9F4] rounded w-full px-2 py-1 text-[#E0E0E0] bg-[#121212]"
                />
                <button
                  className="ml-2 bg-[#03A9F4] text-white px-4 py-1 rounded hover:bg-[#0288D1]"
                  onClick={async () => {
                    await handleAddComment('areasForImprovement', improvementInput);
                    setImprovementInput('');
                  }}
                >
                  Add
                </button>
              </div>
              <ul className="mt-4">
                {improvementComments.map((comment, index) => (
                  <li key={index} className="text-[#E0E0E0] mb-1">{comment.text}</li>
                ))}
              </ul>
            </div>


            {/* Actions */}
            <div className="bg-[#1C1C1C] shadow-md rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-[#9C27B0]">Actions</h3>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Add action"
                  value={actionInput}
                  onChange={(e) => setActionInput(e.target.value)}
                  className="border border-[#9C27B0] rounded w-full px-2 py-1 text-[#E0E0E0] bg-[#121212]"
                />
                <button
                  className="ml-2 bg-[#9C27B0] text-white px-4 py-1 rounded hover:bg-[#8E24AA]"
                  onClick={async () => {
                    await createAction(actionInput);
                    setActionInput('');
                  }}
                >
                  Add
                </button>
              </div>
              <ul className="mt-4">
                {actions.map((action, index) => (
                  <li key={index} className="text-[#E0E0E0] mb-1">{action.description}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      {loading && (
        <p className="text-center mt-4">Loading...</p>
      )}
    </div>
  );
};

export default RetroBoard;
