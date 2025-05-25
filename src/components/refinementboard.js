import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { FaClipboard, FaUser, FaCrown, FaChartBar, FaRedo, FaExclamationTriangle } from "react-icons/fa";

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
    resetSession,
    revealResults,
    isConnected,
    subscribe
  } = useSocket();

  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [localError, setLocalError] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [prediction, setPrediction] = useState('');
  const [localPredictions, setLocalPredictions] = useState([]);
  const [validationError, setValidationError] = useState('');

  const roles = ['UI', 'DEV', 'PRODUCT', 'ARCH', 'UX', 'QA'];

  useEffect(() => {
    if (!isConnected || !roomId) return;
    const prediction = subscribe('prediction_submitted', (data) => {
      if (data.role === selectedRole) {
        setHasSubmitted(true);
      }
    });
    const reset = subscribe('session_reset', () => {
      setHasSubmitted(false);
      setShowResults(false); 
      setSelectedRole('');
      setPrediction('');
    });
    const results = subscribe('results_revealed', (revealedPredictions) => {
      setShowResults(true);
      setLocalPredictions(revealedPredictions);
    });
    return () => {
      prediction();
      reset();
      results();
    };
  }, [isConnected, roomId, selectedRole, subscribe]);

  const createRoom = async () => {
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

  const joinRoom = async () => {
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

  const copyInviteCode = () => {
    if (!contextInviteCode) return;
    navigator.clipboard.writeText(contextInviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  //cleanup when a user leaving
  const exitRoom = () => {
    leaveRoom();
    setIsInRoom(false);
    setIsAdmin(false);
    setInviteCodeInput('');
    setHasSubmitted(false);
    setShowResults(false);
    setSelectedRole('');
    setPrediction('');
  };

  const predictionSubmission = async (e) => {
    e.preventDefault();
    if (!selectedRole || !prediction) return;
    
    const predictionNum = parseInt(prediction);
    if (isNaN(predictionNum)) {
      setValidationError('Please enter a valid number');
      return;
    }
    
    if (predictionNum < 1) {
      setValidationError('Prediction cannot be negative or zero');
      return;
    }
    
    if (predictionNum > 100) {
      setValidationError('Prediction is too large (maximum is 100)');
      return;
    }
    
    try {
      await submitPrediction(selectedRole, predictionNum);
      setHasSubmitted(true);
      setValidationError('');
    } catch (err) {
      console.error('Submit failed:', err);
      setLocalError('Failed to submit prediction. Please try again.');
    }
  };

  const finalResults = async () => {
    try {
      const results = await getPredictions();
      if (results) {
        revealResults(results);
        setShowResults(true);
      }
    } catch (err) {
      console.error('Reveal failed:', err);
      setLocalError('Failed to show results. Please try again.');
    }
  };

  //This lets the admin reset the subssions that were submitted
  const handleResetSession = () => {
    if (isAdmin && resetSession()) {
      setHasSubmitted(false);
      setShowResults(false);
      setSelectedRole('');
      setPrediction('');
    }
  };

  return (
    <div className="min-h-screen p-4 relative" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#03A9F4' }}>Refinement Board</h1>
        {isInRoom && (
          <button
            onClick={exitRoom}
            className="px-4 py-2 rounded-md transition-colors hover:opacity-90"
            style={{ backgroundColor: '#F44336', color: '#E0E0E0' }}
          >
            Leave Room
          </button>
        )}
      </div>
      
      {!isInRoom ? (
        <div className="max-w-lg mx-auto rounded-lg shadow-lg p-6" style={{ backgroundColor: '#1E1E1E' }}>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#E0E0E0' }}>Create a new Refinement Room</h2>
              <button
                onClick={createRoom}
                className="w-full px-4 py-3 rounded-md transition-colors hover:opacity-90"
                style={{ backgroundColor: '#03A9F4', color: '#E0E0E0' }}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Room'}
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: '#2C2C2C' }}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2" style={{ backgroundColor: '#1E1E1E', color: '#B0B0B0' }}>OR</span>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#E0E0E0' }}>Join an existing Refinement Room</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter invite code"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value)}
                  className="w-full border rounded-md px-4 py-3 focus:ring-2 focus:border-transparent transition-colors"
                  style={{ 
                    backgroundColor: '#2C2C2C', 
                    borderColor: '#2C2C2C', 
                    color: '#E0E0E0',
                    '--tw-ring-color': '#03A9F4'
                  }}
                />
                <button
                  onClick={joinRoom}
                  className="w-full px-4 py-3 rounded-md transition-colors hover:opacity-90"
                  style={{ backgroundColor: '#4CAF50', color: '#E0E0E0' }}
                  disabled={loading}
                >
                  {loading ? 'Joining...' : 'Join Room'}
                </button>
              </div>
            </div>
            
            {(localError || error) && (
              <div className="mt-4 p-3 border rounded-md" style={{ 
                backgroundColor: 'rgba(244, 67, 54, 0.1)', 
                borderColor: 'rgba(244, 67, 54, 0.3)', 
                color: '#F44336' 
              }}>
                {localError || error}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="container mx-auto">
          <div className="mb-6 text-center">
            {isAdmin && (
              <p className="text-sm" style={{ color: '#B0B0B0' }}>
                Room ID: <span className="font-mono">{roomId}</span>
              </p>
            )}
            {contextInviteCode && isAdmin && (
              <div className="flex items-center justify-center gap-2 text-sm mt-1" style={{ color: '#B0B0B0' }}>
                <span>
                  Invite Code: <span className="font-mono font-bold" style={{ color: '#03A9F4' }}>{contextInviteCode}</span>
                </span>
                <button
                  onClick={copyInviteCode}
                  title="Copy Invite Code"
                  className="transition-colors hover:opacity-70"
                  style={{ color: '#03A9F4' }}
                >
                  <FaClipboard />
                </button>
                {copied && <span className="text-xs" style={{ color: '#4CAF50' }}>Copied!</span>}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/*User list*/}
            <div className="md:col-span-1">
              <div className="rounded-lg shadow-lg p-4 mb-6" style={{ backgroundColor: '#1E1E1E' }}>
                <h3 className="text-xl font-semibold mb-4 pb-2 flex items-center gap-2 border-b" style={{ 
                  color: '#E0E0E0', 
                  borderColor: '#2C2C2C' 
                }}>
                  <FaUser /> Users
                </h3>
                <ul className="space-y-2">
                  {(userList || []).map((user, index) => (
                    <li key={index} className="p-3 rounded-md flex items-center justify-between" style={{ backgroundColor: '#2C2C2C' }}>
                      <div className="flex items-center gap-2">
                        <span style={{ color: '#E0E0E0' }}>{user.name}</span>
                        {user.is_admin && <FaCrown style={{ color: '#FFC107' }} title="Admin" />}
                      </div>
                      {user.role && (
                        <span className="text-sm px-2 py-1 rounded" style={{ 
                          color: '#03A9F4', 
                          backgroundColor: 'rgba(3, 169, 244, 0.1)' 
                        }}>
                          {user.role}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/*Main Div*/}
            <div className="md:col-span-3">
              {isAdmin ? (
                <div className="rounded-lg shadow-lg p-4 mb-6" style={{ backgroundColor: '#1E1E1E' }}>
                  <h3 className="text-xl font-semibold mb-4 pb-2 border-b" style={{ 
                    color: '#9C27B0', 
                    borderColor: '#2C2C2C' 
                  }}>
                    Admin Controls
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium mb-2" style={{ color: '#03A9F4' }}>Submission Status</h4>
                      <div className="w-full rounded-full h-4 mb-2" style={{ backgroundColor: '#2C2C2C' }}>
                        <div
                          className="h-4 rounded-full transition-all duration-500"
                          style={{
                            backgroundColor: '#03A9F4',
                            width: `${
                              (userList.slice(1).filter(u => u.hasSubmitted).length /
                              Math.max(1, userList.slice(1).length)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-sm" style={{ color: '#B0B0B0' }}>
                        {userList.slice(1).filter(u => u.hasSubmitted).length} of {userList.slice(1).length} participants have submitted
                      </p>
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        onClick={finalResults}
                        disabled={showResults}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                          showResults ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                        }`}
                        style={{ 
                          backgroundColor: showResults ? '#2C2C2C' : '#03A9F4', 
                          color: '#E0E0E0' 
                        }}
                      >
                        <FaChartBar /> {showResults ? 'Results Revealed' : 'Show Results'}
                      </button>
                      <button
                        onClick={handleResetSession}
                        className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors hover:opacity-90"
                        style={{ backgroundColor: '#9C27B0', color: '#E0E0E0' }}
                      >
                        <FaRedo /> Reset Session
                      </button>
                    </div>
                    
                    <p className="text-sm italic" style={{ color: '#B0B0B0' }}>As admin, you cannot submit predictions.</p>
                  </div>
                </div>
              ) : (
                !hasSubmitted && !showResults ? (
                  <div className="rounded-lg shadow-lg p-4 mb-6" style={{ backgroundColor: '#1E1E1E' }}>
                    <h3 className="text-xl font-semibold mb-4 pb-2 border-b" style={{ 
                      color: '#4CAF50', 
                      borderColor: '#2C2C2C' 
                    }}>
                      Submit Your Prediction
                    </h3>
                    
                    <form onSubmit={predictionSubmission} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#E0E0E0' }}>Select Your Role:</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {roles.map(role => (
                            <button
                              key={role}
                              type="button"
                              className={`px-4 py-2 rounded-md border transition-colors ${
                                selectedRole === role 
                                  ? '' 
                                  : 'hover:opacity-80'
                              }`}
                              style={{
                                backgroundColor: selectedRole === role ? '#03A9F4' : '#2C2C2C',
                                borderColor: selectedRole === role ? '#03A9F4' : '#2C2C2C',
                                color: '#E0E0E0'
                              }}
                              onClick={() => setSelectedRole(role)}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#E0E0E0' }}>Your Prediction:</label>
                        <input
                          type="number"
                          value={prediction}
                          onChange={(e) => {
                            setPrediction(e.target.value);
                            setValidationError('');
                          }}
                          disabled={!selectedRole}
                          min="0"
                          max="100"
                          required
                          className="w-full border rounded-md px-4 py-3 focus:ring-2 focus:border-transparent transition-colors"
                          style={{ 
                            backgroundColor: '#2C2C2C', 
                            borderColor: '#2C2C2C', 
                            color: '#E0E0E0',
                            '--tw-ring-color': '#03A9F4'
                          }}
                        />
                        {validationError && (
                          <p className="mt-2 text-sm flex items-center gap-1" style={{ color: '#F44336' }}>
                            <FaExclamationTriangle />
                            {validationError}
                          </p>
                        )}
                      </div>
                      
                      <button 
                        type="submit" 
                        disabled={!selectedRole || !prediction}
                        className={`w-full px-4 py-3 rounded-md transition-colors ${
                          !selectedRole || !prediction
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:opacity-90'
                        }`}
                        style={{ 
                          backgroundColor: !selectedRole || !prediction ? '#2C2C2C' : '#4CAF50', 
                          color: '#E0E0E0' 
                        }}
                      >
                        Submit Prediction
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="rounded-lg shadow-lg p-6 mb-6 text-center" style={{ backgroundColor: '#1E1E1E' }}>
                    <h3 className="text-xl font-semibold mb-4" style={{ color: '#03A9F4' }}>
                      {!showResults ? "You've submitted your prediction" : "Results"}
                    </h3>
                    <p style={{ color: '#B0B0B0' }}>
                      {!showResults ? "Waiting for the admin to show the results..." : "Check out the final results below!"}
                    </p>
                  </div>
                )
              )}

              {showResults && localPredictions && localPredictions.length > 0 && (
                <div className="rounded-lg shadow-lg p-4" style={{ backgroundColor: '#1E1E1E' }}>
                  <h3 className="text-xl font-semibold mb-6 pb-2 flex items-center gap-2 border-b" style={{ 
                    color: '#E0E0E0', 
                    borderColor: '#2C2C2C' 
                  }}>
                    Final Results
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {[...localPredictions].sort((a, b) => b.final_prediction - a.final_prediction).map((result, index) => (
                        <div key={result.role} className="flex items-center space-x-2">
                          <div className="w-20 text-right font-medium" style={{ color: '#E0E0E0' }}>{result.role}</div>
                          <div className="flex-1 rounded-full h-6 relative" style={{ backgroundColor: '#2C2C2C' }}>
                            <div
                              className="h-6 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${Math.min(100, (result.final_prediction / 10) * 100)}%`,
                                backgroundColor: index === 0 ? '#FFC107' : '#03A9F4'
                              }}
                            ></div>
                            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-bold" style={{ color: '#E0E0E0' }}>
                              {result.final_prediction}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full rounded-lg overflow-hidden" style={{ backgroundColor: '#1E1E1E' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#2C2C2C' }}>
                            <th className="px-4 py-2 text-left" style={{ color: '#E0E0E0' }}>Role</th>
                            <th className="px-4 py-2 text-left" style={{ color: '#E0E0E0' }}>Average Prediction</th>
                          </tr>
                        </thead>
                        <tbody>
                          {localPredictions.map((result, index) => (
                            <tr key={result.role} style={{ backgroundColor: index % 2 === 0 ? '#1E1E1E' : '#121212' }}>
                              <td className="px-4 py-3 border-b" style={{ borderColor: '#2C2C2C', color: '#E0E0E0' }}>{result.role}</td>
                              <td className="px-4 py-3 border-b font-medium" style={{ borderColor: '#2C2C2C', color: '#E0E0E0' }}>
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
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#1E1E1E' }}>
            <p style={{ color: '#E0E0E0' }}>Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefinementBoard;
