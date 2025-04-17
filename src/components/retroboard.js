import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import './retroboard.css';

const RetroBoard = () => {
  const {
    createAndJoinRetroRoom,
    joinRetroRoom,
    addComment,
    createAction,
    comments,
    actions,
    roomId,
    inviteCode: contextInviteCode,
    error,
    loading,
    leaveRoom,
    socket,
    subscribe,
  } = useSocket();

  // Local state for room management
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [localError, setLocalError] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Controlled inputs for comment and action entries
  const [goWellInput, setGoWellInput] = useState('');
  const [didntGoWellInput, setDidntGoWellInput] = useState('');
  const [improvementInput, setImprovementInput] = useState('');
  const [actionInput, setActionInput] = useState('');

  // Categorized comments
  const [goWellComments, setGoWellComments] = useState([]);
  const [didntGoWellComments, setDidntGoWellComments] = useState([]);
  const [improvementComments, setImprovementComments] = useState([]);
  const [retroActions, setRetroActions] = useState([]);

  // Handle room creation
  const handleCreateRoom = async () => {
    try {
      setLocalError('');
      const result = await createAndJoinRetroRoom();
      if (result) {
        setIsInRoom(true);
        setIsAdmin(true);
      }
    } catch (err) {
      setLocalError('Error creating room. Please try again.');
    }
  };

  // Handle joining room
  const handleJoinRoom = async () => {
    if (!inviteCodeInput.trim()) {
      setLocalError('Please enter a valid invite code.');
      return;
    }
    
    try {
      setLocalError('');
      const result = await joinRetroRoom(inviteCodeInput);
      if (result) {
        setIsInRoom(true);
        setIsAdmin(false);
      } else {
        setLocalError('Failed to join the room. Please check your invite code.');
      }
    } catch (err) {
      setLocalError('Failed to join the room. Please try again.');
    }
  };

  // Handle adding comments
  const handleAddComment = async (category, comment) => {
    if (!comment.trim()) return;
    
    try {
      const commentText = `${category}: ${comment}`;
      await addComment(commentText);
      
      // Clear input after sending
      switch (category) {
        case 'WhatWentWell':
          setGoWellInput('');
          break;
        case 'WhatDidntGoWell':
          setDidntGoWellInput('');
          break;
        case 'AreasForImprovement':
          setImprovementInput('');
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setLocalError('Failed to add comment. Please try again.');
    }
  };

  // Handle creating an action item (admin only)
  const handleCreateAction = async () => {
    if (!actionInput.trim() || !isAdmin) return;
    
    try {
      await createAction(actionInput);
      setActionInput('');
    } catch (err) {
      console.error('Error creating action:', err);
      setLocalError('Failed to create action. Please try again.');
    }
  };

  // Room cleanup when leaving
  const handleLeaveRoom = () => {
    leaveRoom();
    setIsInRoom(false);
    setIsAdmin(false);
    setInviteCodeInput('');
    setGoWellComments([]);
    setDidntGoWellComments([]);
    setImprovementComments([]);
    setRetroActions([]);
  };

  // Process comments when they change
  useEffect(() => {
    // Process and categorize all comments
    const wellComments = [];
    const didntWellComments = [];
    const improvementComments = [];
    
    comments.forEach(comment => {
      if (typeof comment === 'string') {
        if (comment.startsWith('WhatWentWell:')) {
          wellComments.push(comment.substring('WhatWentWell:'.length).trim());
        } else if (comment.startsWith('WhatDidntGoWell:')) {
          didntWellComments.push(comment.substring('WhatDidntGoWell:'.length).trim());
        } else if (comment.startsWith('AreasForImprovement:')) {
          improvementComments.push(comment.substring('AreasForImprovement:'.length).trim());
        }
      }
    });
    
    setGoWellComments(wellComments);
    setDidntGoWellComments(didntWellComments);
    setImprovementComments(improvementComments);
  }, [comments]);

  // Process actions when they change
  useEffect(() => {
    setRetroActions(actions);
  }, [actions]);

  // Subscribe to new_comment and action_added events
  useEffect(() => {
    if (!socket || !isInRoom) return;
    
    const newCommentUnsubscribe = subscribe('new_comment', (newComment) => {
      console.log('New comment received via subscription:', newComment);
    });
    
    const actionAddedUnsubscribe = subscribe('action_added', (newAction) => {
      console.log('New action received via subscription:', newAction);
    });
    
    return () => {
      newCommentUnsubscribe();
      actionAddedUnsubscribe();
    };
  }, [socket, isInRoom, subscribe]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 relative">
      {/* Header and Leave Room Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-400">Retro Board</h1>
        {isInRoom && (
          <button
            onClick={handleLeaveRoom}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Leave Room
          </button>
        )}
      </div>
      
      {!isInRoom ? (
        <div className="max-w-lg mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Create a new Retro Room</h2>
              <button
                onClick={handleCreateRoom}
                className="w-full bg-blue-500 text-white px-4 py-3 rounded-md hover:bg-blue-600 transition-colors"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Room'}
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">OR</span>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Join an existing Retro Room</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter invite code"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleJoinRoom}
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Joining...' : 'Join Room'}
                </button>
              </div>
            </div>
            
            {(localError || error) && (
              <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-red-200">
                {localError || error}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="container mx-auto">
          {/* Room info */}
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-400">
              Room ID: <span className="font-mono">{roomId}</span>
            </p>
            {isAdmin && contextInviteCode && (
              <p className="text-sm text-gray-400 mt-1">
                Invite Code: <span className="font-mono font-bold text-blue-400">{contextInviteCode}</span>
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* What went well */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-4">
              <h3 className="text-xl font-semibold mb-4 text-green-400 border-b border-gray-700 pb-2">
                What Went Well
              </h3>
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  placeholder="Add comment"
                  value={goWellInput}
                  onChange={(e) => setGoWellInput(e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                />
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  onClick={() => handleAddComment('WhatWentWell', goWellInput)}
                  disabled={loading}
                >
                  Add
                </button>
              </div>
              <ul className="space-y-2">
                {goWellComments.map((comment, index) => (
                  <li key={index} className="bg-gray-700 p-3 rounded-md">{comment}</li>
                ))}
              </ul>
            </div>

            {/* What didn't go well */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-4">
              <h3 className="text-xl font-semibold mb-4 text-red-400 border-b border-gray-700 pb-2">
                What Didn't Go Well
              </h3>
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  placeholder="Add comment"
                  value={didntGoWellInput}
                  onChange={(e) => setDidntGoWellInput(e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                />
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  onClick={() => handleAddComment('WhatDidntGoWell', didntGoWellInput)}
                  disabled={loading}
                >
                  Add
                </button>
              </div>
              <ul className="space-y-2">
                {didntGoWellComments.map((comment, index) => (
                  <li key={index} className="bg-gray-700 p-3 rounded-md">{comment}</li>
                ))}
              </ul>
            </div>

            {/* Areas for improvement */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-4">
              <h3 className="text-xl font-semibold mb-4 text-blue-400 border-b border-gray-700 pb-2">
                Areas for Improvement
              </h3>
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  placeholder="Add comment"
                  value={improvementInput}
                  onChange={(e) => setImprovementInput(e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                />
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => handleAddComment('AreasForImprovement', improvementInput)}
                  disabled={loading}
                >
                  Add
                </button>
              </div>
              <ul className="space-y-2">
                {improvementComments.map((comment, index) => (
                  <li key={index} className="bg-gray-700 p-3 rounded-md">{comment}</li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Actions section */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="text-xl font-semibold mb-4 text-purple-400 border-b border-gray-700 pb-2">
              Action Items
            </h3>
            {isAdmin && (
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  placeholder="Add action item"
                  value={actionInput}
                  onChange={(e) => setActionInput(e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                />
                <button
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                  onClick={handleCreateAction}
                  disabled={loading}
                >
                  Add Action
                </button>
              </div>
            )}
            <ul className="space-y-2">
              {retroActions.map((action, index) => (
                <li key={index} className="bg-gray-700 p-3 rounded-md flex items-center">
                  <div className="mr-2 text-purple-400">•</div>
                  <div>
                    <p>{action.description}</p>
                    <p className="text-xs text-gray-400 mt-1">Assigned to: {action.user_name}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-white">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetroBoard;
