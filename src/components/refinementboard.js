import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { FaClipboard, FaUser, FaCrown, FaChartBar, FaRedo, FaTrophy } from 'react-icons/fa';

const RefinementBoard = () => {
  const {
    createAndJoinRefinementRoom,
    joinRefinementRoom,
    submitPrediction,
    getPredictions,
    roomId,
    inviteCode: contextInviteCode,
    error,
    loading,
    leaveRoom,
    userList,
    predictions,
    isConnected,
    subscribe
  } = useSocket();

  // Local state for room management
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [localError, setLocalError] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [copied, setCopied] = useState(false);

  // Refinement specific state
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [prediction, setPrediction] = useState('');

  // Roles available for selection
  const roles = ['UI', 'DEV', 'PRODUCT', 'ARCH', 'UX', 'QA'];

  // Check if user is admin when userList changes
  useEffect(() => {
    if (userList && userList.length > 0) {
      const currentUser = userList.find(user => user.email === localStorage.getItem('userEmail'));
      setIsAdmin(currentUser && currentUser.is_admin);
    }
  }, [userList]);

  // Subscribe to prediction submissions
  useEffect(() => {
    if (!isConnected || !roomId) return;

    const unsubscribe = subscribe('prediction_submitted', (data) => {
      if (data.role === selectedRole) {
        setHasSubmitted(true);
      }
    });

    return () => unsubscribe();
  }, [isConnected, roomId, selectedRole, subscribe]);

  // Handle room creation
  const handleCreateRoom = async () => {
    try {
      setLocalError('');
      const result = await createAndJoinRefinementRoom();
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
      const result = await joinRefinementRoom(inviteCodeInput);
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

  const handleCopyInviteCode = () => {
    if (!contextInviteCode) return;
    navigator.clipboard.writeText(contextInviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Room cleanup when leaving
  const handleLeaveRoom = () => {
    leaveRoom();
    setIsInRoom(false);
    setIsAdmin(false);
    setInviteCodeInput('');
    setHasSubmitted(false);
    setShowResults(false);
    setSelectedRole('');
    setPrediction('');
  };

  // Handle prediction submission
  const handleSubmitPrediction = async (e) => {
    e.preventDefault();
    if (!selectedRole || !prediction) return;
    
    try {
      await submitPrediction(selectedRole, parseInt(prediction));
      setHasSubmitted(true);
    } catch (err) {
      console.error('Submit failed:', err);
      setLocalError('Failed to submit prediction. Please try again.');
    }
  };

  // Handle revealing results (admin only)
  const handleRevealResults = async () => {
    if (!isAdmin) return;
    
    try {
      const results = await getPredictions();
      if (results) setShowResults(true);
    } catch (err) {
      console.error('Reveal failed:', err);
      setLocalError('Failed to reveal results. Please try again.');
    }
  };

  // Reset session (admin only)
  const handleResetSession = () => {
    setHasSubmitted(false);
    setShowResults(false);
    setSelectedRole('');
    setPrediction('');
  };

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200 p-4 relative">
      {/* Header and Leave Room Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-400">Refinement Board</h1>
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
        <div className="max-w-lg mx-auto bg-[#1C1C1C] rounded-lg shadow-lg p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Create a new Refinement Room</h2>
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
                <span className="px-2 bg-[#1C1C1C] text-gray-400">OR</span>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Join an existing Refinement Room</h2>
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
            {contextInviteCode && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-1">
                <span>
                  Invite Code: <span className="font-mono font-bold text-blue-400">{contextInviteCode}</span>
                </span>
                <button
                  onClick={handleCopyInviteCode}
                  title="Copy Invite Code"
                  className="text-blue-300 hover:text-blue-500 transition-colors"
                >
                  <FaClipboard />
                </button>
                {copied && <span className="text-green-400 text-xs">Copied!</span>}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Users list */}
            <div className="md:col-span-1">
              <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
              <h3 className="text-xl font-semibold mb-4 text-[#E0E0E0] border-b border-gray-700 pb-2 flex items-center gap-2">
                <FaUser /> Users
              </h3>
                <ul className="space-y-2">
                  {(userList || []).map((user, index) => (
                    <li key={index} className="bg-gray-700 p-3 rounded-md flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-white">{user.name}</span>
                        {user.is_admin && <FaCrown className="text-[#E0E0E0]" title="Admin" />}
                      </div>
                      {user.role && <span className="text-blue-300 text-sm bg-blue-900/30 px-2 py-1 rounded">{user.role}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Main content */}
            <div className="md:col-span-3">
              {isAdmin ? (
                <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
                  <h3 className="text-xl font-semibold mb-4 text-purple-400 border-b border-gray-700 pb-2">Admin Controls</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium mb-2 text-blue-300">Submission Status</h4>
                      <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                        <div 
                          className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                          style={{
                            width: `${userList && userList.length && userList.filter(u => !u.is_admin).length > 0 ? 
                              (userList.filter(u => u.hasSubmitted).length / userList.filter(u => !u.is_admin).length) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-300">
                        {userList && userList.filter(u => u.hasSubmitted).length} of {userList && userList.filter(u => !u.is_admin).length} participants have submitted
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium mb-2 text-blue-300">Role Distribution</h4>
                      <div className="flex flex-wrap gap-2">
                        {roles.map(role => {
                          const count = userList && userList.filter(p => p.role === role).length;
                          return count > 0 ? (
                            <div key={role} className="bg-gray-700 px-3 py-1 rounded-md flex items-center gap-2">
                              <span>{role}</span>
                              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{count}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        onClick={handleRevealResults}
                        disabled={showResults}
                        className={`flex items-center gap-2 ${showResults ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-md transition-colors`}
                      >
                        <FaChartBar /> {showResults ? 'Results Revealed' : 'Reveal Results'}
                      </button>
                      <button
                        onClick={handleResetSession}
                        className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                      >
                        <FaRedo /> Reset Session
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-400 italic">As admin, you cannot submit predictions.</p>
                  </div>
                </div>
              ) : (
                !hasSubmitted && !showResults ? (
                  <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
                    <h3 className="text-xl font-semibold mb-4 text-green-400 border-b border-gray-700 pb-2">Submit Your Prediction</h3>
                    
                    <form onSubmit={handleSubmitPrediction} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Select Your Role:</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {roles.map(role => (
                            <button
                              key={role}
                              type="button"
                              className={`px-4 py-2 rounded-md border ${
                                selectedRole === role 
                                  ? 'bg-blue-600 border-blue-400 text-white' 
                                  : 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200'
                              } transition-colors`}
                              onClick={() => setSelectedRole(role)}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Your Prediction:</label>
                        <input
                          type="number"
                          value={prediction}
                          onChange={(e) => setPrediction(e.target.value)}
                          disabled={!selectedRole}
                          min="1"
                          required
                          className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <button 
                        type="submit" 
                        disabled={!selectedRole || !prediction}
                        className={`w-full ${
                          !selectedRole || !prediction
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                        } text-white px-4 py-3 rounded-md transition-colors`}
                      >
                        Submit Prediction
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 text-center">
                    <h3 className="text-xl font-semibold mb-4 text-blue-400">
                      {!showResults ? "You've submitted your prediction" : "Results Revealed"}
                    </h3>
                    <p className="text-gray-300">
                      {!showResults ? "Waiting for the admin to reveal results..." : "Check out the final results below!"}
                    </p>
                  </div>
                )
              )}

              {/* Results display (visible to everyone when revealed) */}
              {showResults && predictions && predictions.length > 0 && (
                <div className="bg-gray-800 rounded-lg shadow-lg p-4">
                  <h3 className="text-xl font-semibold mb-6 text-yellow-400 border-b border-gray-700 pb-2 flex items-center gap-2">
                    <FaTrophy /> Final Results
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Bar chart visualization */}
                    <div className="space-y-4">
                      {[...predictions].sort((a, b) => b.final_prediction - a.final_prediction).map((result, index) => (
                        <div key={result.role} className="flex items-center space-x-2">
                          <div className="w-20 text-right font-medium">{result.role}</div>
                          <div className="flex-1 bg-gray-700 rounded-full h-6 relative">
                            <div
                              className={`h-6 rounded-full transition-all duration-500 ${index === 0 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                              style={{ width: `${Math.min(100, (result.final_prediction / 10) * 100)}%` }}
                            ></div>
                            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-bold">
                              {result.final_prediction}
                            </span>
                          </div>
                          {index === 0 && <FaTrophy className="text-yellow-400 text-xl" />}
                        </div>
                      ))}
                    </div>
                    
                    {/* Table view */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-gray-600">
                            <th className="px-4 py-2 text-left text-gray-200">Role</th>
                            <th className="px-4 py-2 text-left text-gray-200">Average Prediction</th>
                          </tr>
                        </thead>
                        <tbody>
                          {predictions.map((result, index) => (
                            <tr key={result.role} className={index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-750'}>
                              <td className="px-4 py-3 border-b border-gray-600">{result.role}</td>
                              <td className="px-4 py-3 border-b border-gray-600 font-medium">
                                {result.final_prediction}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
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

export default RefinementBoard;
