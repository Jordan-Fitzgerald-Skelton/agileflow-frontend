import React, { useState } from 'react';

const RefinementBoard = () => {
  const roles = ['Developer', 'QA', 'UI', 'UX', 'Production', 'Architect'];

  const [role, setRole] = useState('');
  const [prediction, setPrediction] = useState('');
  const [predictionsList, setPredictionsList] = useState([]);
  const [isInRoom] = useState(true);
  const [error, setError] = useState(''); // State to hold validation error messages

  // Handle role selection
  const handleAssignRole = (selectedRole) => {
    setRole(selectedRole);
  };

  // Handle prediction input change with validation
  const handlePredictionChange = (e) => {
    const value = e.target.value;
    setError(''); // Clear any previous errors
    if (value < 0) {
      setError('Prediction cannot be negative.');
    } else if (value > 1000) {
      setError('Prediction cannot exceed 1000 days.');
    } else {
      setPrediction(value); // Only set prediction if valid
    }
  };

  // Handle prediction submission
  const handlePredictionSubmit = () => {
    if (prediction === '' || error) {
      setError('Please enter a valid prediction.'); // Ensure valid input before submission
      return;
    }
    setPredictionsList([...predictionsList, { role, prediction }]); // Add prediction to the list
    setPrediction(''); // Clear the prediction input
    setError(''); // Clear any error messages
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] p-4">
      {/* Role Selection */}
      {!role && isInRoom && (
        <div className="bg-[#1C1C1C] shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-[#03A9F4]">Select Your Role</h2>
          <select
            value={role}
            onChange={(e) => handleAssignRole(e.target.value)}
            className="border border-[#03A9F4] rounded w-full px-2 py-1 mt-2 text-[#E0E0E0] bg-[#121212]"
          >
            <option value="">Select a role...</option>
            {roles.map((roleOption) => (
              <option key={roleOption} value={roleOption}>
                {roleOption}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Prediction Form */}
      {role && isInRoom && (
        <div className="bg-[#1C1C1C] shadow-md rounded-lg p-6 max-w-md mx-auto mt-10">
          <h2 className="text-2xl font-semibold mb-4 text-[#FF4081]">Make Your Prediction</h2>
          <div>
            <label className="block text-lg font-semibold text-[#E0E0E0]">Your Prediction (in days)</label>
            <input
              type="number"
              value={prediction}
              onChange={handlePredictionChange}
              className="border border-[#FF4081] rounded w-full px-2 py-1 mt-2 text-[#E0E0E0] bg-[#121212]"
              placeholder="Enter your predicted time"
            />
            {/* Error Message */}
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
          <button
            onClick={handlePredictionSubmit}
            className="mt-4 bg-[#FF4081] text-white px-4 py-2 rounded hover:bg-[#D81B60]"
            disabled={!!error || prediction === ''} // Disable button if there’s an error or no input
          >
            Submit Prediction
          </button>
        </div>
      )}

      {/* List of predictions */}
      {predictionsList.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4 text-[#03A9F4]">Submitted Predictions:</h3>
          <ul>
            {predictionsList.map((item, index) => (
              <li key={index} className="text-[#E0E0E0] mb-2">
                {item.role} predicted {item.prediction} days
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RefinementBoard;