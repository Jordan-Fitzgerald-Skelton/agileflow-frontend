import React, { useState, useEffect } from "react";
import { FaClipboard, FaUser, FaCrown } from "react-icons/fa";

const RetroBoard = () => {
  // Mock socket context for demo purposes
  const mockSocket = {
    createAndJoinRetroRoom: () => Promise.resolve(true),
    joinRetroRoom: (code) => Promise.resolve(true),
    addComment: (comment) => Promise.resolve(),
    createAction: (action, assignee) => Promise.resolve(),
    comments: ['WhatWentWell: Great team collaboration', 'WhatDidntGoWell: Missed some deadlines', 'AreasForImprovement: Better time management'],
    actions: [{ description: 'Implement daily standups', user_name: 'John Doe' }],
    roomId: 'ROOM123',
    inviteCode: 'ABC123',
    error: null,
    loading: false,
    leaveRoom: () => {},
    userList: [
      { id: 1, name: 'John Doe', is_admin: true },
      { id: 2, name: 'Jane Smith', is_admin: false },
      { id: 3, name: 'Bob Wilson', is_admin: false }
    ]
  };

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
    userList,
  } = mockSocket;

  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [localError, setLocalError] = useState('');
  const [isInRoom, setIsInRoom] = useState(true); // Set to true for demo
  const [isAdmin, setIsAdmin] = useState(true); // Set to true for demo
  const [copied, setCopied] = useState(false);
  //Comment sections
  const [goWellInput, setGoWellInput] = useState('');
  const [didntGoWellInput, setDidntGoWellInput] = useState('');
  const [improvementInput, setImprovementInput] = useState('');
  const [actionInput, setActionInput] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [goWellComments, setGoWellComments] = useState([]);
  const [didntGoWellComments, setDidntGoWellComments] = useState([]);
  const [improvementComments, setImprovementComments] = useState([]);
  const [retroActions, setRetroActions] = useState([]);

  const createRoom = async () => {
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

  const joinRoom = async () => {
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

  const copyInviteCode = () => {
    if (!contextInviteCode) return;
    navigator.clipboard.writeText(contextInviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const newComment = async (category, comment) => {
    if (!comment.trim()) return;
    try {
      const commentText = `${category}: ${comment}`;
      await addComment(commentText);
      // Clear the input box after sending the comment
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

  const newAction = async () => {
    if (!actionInput.trim() || !isAdmin) return;
    try {
      await createAction(actionInput, selectedAssignee || null);
      setActionInput('');
      setSelectedAssignee('');
    } catch (err) {
      console.error('Error creating action:', err);
      setLocalError('Failed to create action. Please try again.');
    }
  };

   //cleanup when a user leaving
  const exitRoom = () => {
    leaveRoom();
    setIsInRoom(false);
    setIsAdmin(false);
    setInviteCodeInput('');
    setGoWellComments([]);
    setDidntGoWellComments([]);
    setImprovementComments([]);
    setRetroActions([]);
  };

  useEffect(() => {
    //Identifies where the new comments go
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

  useEffect(() => {
    setRetroActions(actions);
  }, [actions]);

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] p-4 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#03A9F4]">Retro Board</h1>
        {isInRoom && (
          <button
            onClick={exitRoom}
            className="bg-[#F44336] text-[#E0E0E0] px-4 py-2 rounded-md hover:bg-[#D32F2F] transition-colors shadow-lg"
          >
            Leave Room
          </button>
        )}
      </div>
      
      {!isInRoom ? (
        <div className="max-w-lg mx-auto bg-[#1E1E1E] rounded-lg shadow-xl p-6 border border-[#2C2C2C]">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#E0E0E0]">Create a new Retro Room</h2>
              <button
                onClick={createRoom}
                className="w-full bg-[#03A9F4] text-[#E0E0E0] px-4 py-3 rounded-md hover:bg-[#0288D1] transition-colors shadow-lg font-medium"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Room'}
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2C2C2C]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1E1E1E] text-[#B0B0B0]">OR</span>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#E0E0E0]">Join an existing Retro Room</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter invite code"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-md px-4 py-3 text-[#E0E0E0] placeholder-[#B0B0B0] focus:ring-2 focus:ring-[#03A9F4] focus:border-transparent transition-all"
                />
                <button
                  onClick={joinRoom}
                  className="w-full bg-[#4CAF50] text-[#E0E0E0] px-4 py-3 rounded-md hover:bg-[#388E3C] transition-colors shadow-lg font-medium"
                  disabled={loading}
                >
                  {loading ? 'Joining...' : 'Join Room'}
                </button>
              </div>
            </div>
            
            {(localError || error) && (
              <div className="mt-4 p-3 bg-[#F44336]/20 border border-[#F44336]/50 rounded-md text-[#F44336]">
                {localError || error}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="container mx-auto">
          <div className="mb-6 text-center">
            {isAdmin && (
              <p className="text-sm text-[#B0B0B0]">
                Room ID: <span className="font-mono text-[#E0E0E0]">{roomId}</span>
              </p>
            )}
            {isAdmin && contextInviteCode && (
              <div className="flex items-center justify-center gap-2 text-sm text-[#B0B0B0] mt-1">
                <span>
                  Invite Code: <span className="font-mono font-bold text-[#03A9F4]">{contextInviteCode}</span>
                </span>
                <button
                  onClick={copyInviteCode}
                  title="Copy Invite Code"
                  className="text-[#03A9F4] hover:text-[#0288D1] transition-colors"
                >
                  <FaClipboard />
                </button>
                {copied && <span className="text-[#4CAF50] text-xs">Copied!</span>}
              </div>
            )}
          </div>
          
          {/*user list*/}
          <div className="bg-[#1E1E1E] rounded-lg shadow-xl p-4 mb-6 border border-[#2C2C2C]">
            <h3 className="text-xl font-semibold mb-4 text-[#E0E0E0] border-b border-[#2C2C2C] pb-2 flex items-center gap-2">
              <FaUser className="text-[#03A9F4]" /> Users
            </h3>
            <ul className="space-y-2">
              {(userList || []).map((user, index) => (
                <li key={index} className="flex items-center space-x-2 bg-[#121212] p-3 rounded-md border border-[#2C2C2C]">
                  <span className="text-[#E0E0E0]">{user.name}</span>
                  {user.is_admin && <FaCrown className="text-[#FFC107]" title="Admin" />}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/*what went well*/}
            <div className="bg-[#1E1E1E] rounded-lg shadow-xl p-4 border border-[#2C2C2C]">
              <h3 className="text-xl font-semibold mb-4 text-[#4CAF50] border-b border-[#2C2C2C] pb-2">
                What Went Well
              </h3>
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  placeholder="Add comment"
                  value={goWellInput}
                  onChange={(e) => setGoWellInput(e.target.value)}
                  className="flex-1 bg-[#121212] border border-[#2C2C2C] rounded-md px-3 py-2 text-[#E0E0E0] placeholder-[#B0B0B0] focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && newComment('WhatWentWell', goWellInput)}
                />
                <button
                  className="bg-[#4CAF50] text-[#E0E0E0] px-4 py-2 rounded-md hover:bg-[#388E3C] transition-colors shadow-lg"
                  onClick={() => newComment('WhatWentWell', goWellInput)}
                  disabled={loading}
                >
                  Add
                </button>
              </div>
              <ul className="space-y-2">
                {goWellComments.map((comment, index) => (
                  <li key={index} className="bg-[#121212] p-3 rounded-md break-words border border-[#2C2C2C] text-[#E0E0E0]">{comment}</li>
                ))}
              </ul>
            </div>

            {/*what didn't go well*/}
            <div className="bg-[#1E1E1E] rounded-lg shadow-xl p-4 border border-[#2C2C2C]">
              <h3 className="text-xl font-semibold mb-4 text-[#F44336] border-b border-[#2C2C2C] pb-2">
                What Didn't Go Well
              </h3>
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  placeholder="Add comment"
                  value={didntGoWellInput}
                  onChange={(e) => setDidntGoWellInput(e.target.value)}
                  className="flex-1 bg-[#121212] border border-[#2C2C2C] rounded-md px-3 py-2 text-[#E0E0E0] placeholder-[#B0B0B0] focus:ring-2 focus:ring-[#F44336] focus:border-transparent transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && newComment('WhatDidntGoWell', didntGoWellInput)}
                />
                <button
                  className="bg-[#F44336] text-[#E0E0E0] px-4 py-2 rounded-md hover:bg-[#D32F2F] transition-colors shadow-lg"
                  onClick={() => newComment('WhatDidntGoWell', didntGoWellInput)}
                  disabled={loading}
                >
                  Add
                </button>
              </div>
              <ul className="space-y-2">
                {didntGoWellComments.map((comment, index) => (
                  <li key={index} className="bg-[#121212] p-3 rounded-md break-words border border-[#2C2C2C] text-[#E0E0E0]">{comment}</li>
                ))}
              </ul>
            </div>

            {/*areas for improvement*/}
            <div className="bg-[#1E1E1E] rounded-lg shadow-xl p-4 border border-[#2C2C2C]">
              <h3 className="text-xl font-semibold mb-4 text-[#03A9F4] border-b border-[#2C2C2C] pb-2">
                Areas for Improvement
              </h3>
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  placeholder="Add comment"
                  value={improvementInput}
                  onChange={(e) => setImprovementInput(e.target.value)}
                  className="flex-1 bg-[#121212] border border-[#2C2C2C] rounded-md px-3 py-2 text-[#E0E0E0] placeholder-[#B0B0B0] focus:ring-2 focus:ring-[#03A9F4] focus:border-transparent transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && newComment('AreasForImprovement', improvementInput)}
                />
                <button
                  className="bg-[#03A9F4] text-[#E0E0E0] px-4 py-2 rounded-md hover:bg-[#0288D1] transition-colors shadow-lg"
                  onClick={() => newComment('AreasForImprovement', improvementInput)}
                  disabled={loading}
                >
                  Add
                </button>
              </div>
              <ul className="space-y-2">
                {improvementComments.map((comment, index) => (
                  <li key={index} className="bg-[#121212] p-3 rounded-md break-words border border-[#2C2C2C] text-[#E0E0E0]">{comment}</li>
                ))}
              </ul>
            </div>
          </div>
          
          {/*action section */}
          <div className="bg-[#1E1E1E] rounded-lg shadow-xl p-4 border border-[#2C2C2C]">
            <h3 className="text-xl font-semibold mb-4 text-[#9C27B0] border-b border-[#2C2C2C] pb-2">
              Action Items
            </h3>
            {isAdmin && (
              <div className="flex flex-col space-y-3 mb-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add action item"
                    value={actionInput}
                    onChange={(e) => setActionInput(e.target.value)}
                    className="flex-1 bg-[#121212] border border-[#2C2C2C] rounded-md px-3 py-2 text-[#E0E0E0] placeholder-[#B0B0B0] focus:ring-2 focus:ring-[#9C27B0] focus:border-transparent transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && newAction()}
                  />
                  <select
                    value={selectedAssignee}
                    onChange={(e) => setSelectedAssignee(e.target.value)}
                    className="bg-[#121212] border border-[#2C2C2C] rounded-md px-3 py-2 text-[#E0E0E0] focus:ring-2 focus:ring-[#9C27B0] focus:border-transparent transition-all"
                  >
                    <option value="">Assign to...</option>
                    {(userList || []).map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  <button
                    className="bg-[#9C27B0] text-[#E0E0E0] px-4 py-2 rounded-md hover:bg-[#7B1FA2] transition-colors shadow-lg"
                    onClick={newAction}
                    disabled={loading}
                  >
                    Add Action
                  </button>
                </div>
              </div>
            )}
            <ul className="space-y-2">
              {retroActions.map((action, index) => (
                <li key={index} className="bg-[#121212] p-3 rounded-md flex items-center border border-[#2C2C2C]">
                  <div className="mr-2 text-[#9C27B0]">•</div>
                  <div>
                    <p className="text-[#E0E0E0]">{action.description}</p>
                    <p className="text-xs text-[#B0B0B0] mt-1">Assigned to: {action.user_name}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#1E1E1E] p-6 rounded-lg border border-[#2C2C2C] shadow-2xl">
            <p className="text-[#E0E0E0]">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetroBoard;
