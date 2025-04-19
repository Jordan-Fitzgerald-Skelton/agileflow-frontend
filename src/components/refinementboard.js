import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { FaClipboard, FaSignOutAlt, FaUser, FaCrown, FaChartBar, FaRedo, FaTrophy } from 'react-icons/fa';
import './refinementboard.css';

const RefinementBoard = () => {
  const {
    isConnected,
    roomId,
    inviteCode,
    userList,
    predictions,
    createAndJoinRefinementRoom,
    joinRefinementRoom,
    leaveRoom,
    submitPrediction,
    getPredictions,
    error,
    loading,
    subscribe
  } = useSocket();

  const [isAdmin, setIsAdmin] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [prediction, setPrediction] = useState('');

  useEffect(() => {
    if (userList && userList.length > 0) {
      setIsAdmin(userList[0].email === localStorage.getItem('userEmail'));
    }
  }, [userList]);

  useEffect(() => {
    if (!isConnected || !roomId) return;

    const unsubscribe = subscribe('prediction_submitted', (data) => {
      if (data.role === selectedRole) {
        setHasSubmitted(true);
      }
    });

    return () => unsubscribe();
  }, [isConnected, roomId, selectedRole, subscribe]);

  const handleCreateRoom = async () => {
    try {
      await createAndJoinRefinementRoom();
    } catch (err) {
      console.error('Create room failed:', err);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCode) return;
    try {
      await joinRefinementRoom(joinCode);
    } catch (err) {
      console.error('Join room failed:', err);
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    setHasSubmitted(false);
    setShowResults(false);
    setSelectedRole('');
  };

  const handleSubmitPrediction = async (e) => {
    e.preventDefault();
    if (!selectedRole || !prediction) return;
    try {
      await submitPrediction(selectedRole, parseInt(prediction));
      setHasSubmitted(true);
    } catch (err) {
      console.error('Submit failed:', err);
    }
  };

  const handleRevealResults = async () => {
    if (!isAdmin) return;
    try {
      const results = await getPredictions();
      if (results) setShowResults(true);
    } catch (err) {
      console.error('Reveal failed:', err);
    }
  };

  const handleResetSession = () => {
    setHasSubmitted(false);
    setShowResults(false);
    setSelectedRole('');
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const roles = ['UI', 'DEV', 'PRODUCT', 'ARCH', 'UX', 'QA'];

  {!isInRoom && (
    <div className="max-w-lg mx-auto bg-[#1C1C1C] rounded-lg shadow-lg p-6">
      <div className="space-y-6">
        {/* Create Room */}
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
  
        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400">OR</span>
          </div>
        </div>
  
        {/* Join Room */}
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
  
        {/* Error Message */}
        {(localError || error) && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-red-200">
            {localError || error}
          </div>
        )}
      </div>
    </div>
  )}
  
  return (
    <div className="refinement-board">
      {/* Header */}
      <div className="room-header">
        <div className="room-info">
          <h1>Refinement Board</h1>
          <div className="room-id">Room ID: {roomId}</div>
        </div>
        <div className="room-actions">
          <div className="invite-code">
            <span>Invite Code: <strong>{inviteCode}</strong></span>
            <button className="copy-button" onClick={copyInviteCode} title="Copy invite code">
              <FaClipboard />
              {copied && <span className="copied-tooltip">Copied!</span>}
            </button>
          </div>
          <button className="leave-button" onClick={handleLeaveRoom}>
            <FaSignOutAlt /> Leave Room
          </button>
        </div>
      </div>

      <div className="board-container">
        {/* Sidebar */}
        <div className="sidebar">
          <h2>Participants</h2>
          <div className="participants">
            {userList.map((user, index) => (
              <div key={index} className={`participant-card ${user.isAdmin ? 'admin' : ''}`}>
                <div className="participant-icon">
                  {user.isAdmin ? <FaCrown /> : <FaUser />}
                </div>
                <div className="participant-details">
                  <div className="participant-name">{user.name}</div>
                  {user.role && <div className="participant-role">{user.role}</div>}
                  <div className={`participant-status ${user.hasSubmitted ? 'submitted' : 'pending'}`}>
                    {user.hasSubmitted ? 'Submitted' : 'Pending'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="main-content">
          {isAdmin ? (
            <div className="admin-controls">
              <h2>Admin Controls</h2>
              <div className="submission-status">
                <h3>Submission Status</h3>
                <div className="status-bar">
                  <div
                    className="status-progress"
                    style={{
                      width: `${userList.length ? 
                        (userList.filter(u => !u.isAdmin && u.hasSubmitted).length / 
                        userList.filter(u => !u.isAdmin).length) * 100 : 0}%`
                    }}
                  />
                </div>
                <p>{userList.filter(u => !u.isAdmin && u.hasSubmitted).length} of {userList.filter(u => !u.isAdmin).length} participants have submitted</p>
              </div>
              <div className="role-distribution">
                <h3>Role Distribution</h3>
                <div className="role-chips">
                  {roles.map(role => {
                    const count = userList.filter(p => p.role === role).length;
                    return count > 0 ? (
                      <div key={role} className="role-chip">
                        <span className="role-name">{role}</span>
                        <span className="role-count">{count}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
              <div className="admin-actions">
                <button onClick={handleRevealResults} disabled={showResults}>
                  <FaChartBar /> {showResults ? 'Results Revealed' : 'Reveal Results'}
                </button>
                <button onClick={handleResetSession}><FaRedo /> Reset Session</button>
              </div>
              <p className="admin-note">As admin, you cannot submit predictions.</p>
            </div>
          ) : (
            !hasSubmitted && !showResults ? (
              <div className="prediction-input">
                <h2>Submit Your Prediction</h2>
                <form onSubmit={handleSubmitPrediction}>
                  <div className="role-selection">
                    <label>Select Your Role:</label>
                    <div className="role-buttons">
                      {roles.map(role => (
                        <button
                          key={role}
                          type="button"
                          className={`role-button ${selectedRole === role ? 'selected' : ''}`}
                          onClick={() => setSelectedRole(role)}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="prediction-field">
                    <label>Your Prediction:</label>
                    <input
                      type="number"
                      value={prediction}
                      onChange={(e) => setPrediction(e.target.value)}
                      disabled={!selectedRole}
                      min="1"
                      required
                    />
                  </div>
                  <button type="submit" disabled={!selectedRole || !prediction}>Submit</button>
                </form>
              </div>
            ) : (
              <div className="waiting-message">
                {!showResults ? "You've submitted your prediction. Waiting for the admin to reveal results..." :
                  "Results have been revealed!"}
              </div>
            )
          )}

          {showResults && predictions && predictions.length > 0 && (
            <div className="results-display">
              <h2>Final Results</h2>
              <div className="results-visualization">
                {[...predictions].sort((a, b) => b.final_prediction - a.final_prediction).map((result, index) => (
                  <div key={result.role} className="result-bar-container">
                    <div className="result-role">{result.role}</div>
                    <div className="result-bar-wrapper">
                      <div
                        className="result-bar"
                        style={{
                          width: `${Math.min(100, result.final_prediction * 10)}%`,
                          backgroundColor: index === 0 ? '#ffd700' : '#4caf50'
                        }}
                      />
                      <span className="result-value">{result.final_prediction}</span>
                    </div>
                    {index === 0 && <FaTrophy className="trophy-icon" />}
                  </div>
                ))}
              </div>
              <div className="results-table">
                <div className="table-header">
                  <div className="header-role">Role</div>
                  <div className="header-prediction">Average Prediction</div>
                </div>
                {predictions.map(result => (
                  <div key={result.role} className="table-row">
                    <div className="row-role">{result.role}</div>
                    <div className="row-prediction">{result.final_prediction}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RefinementBoard;
