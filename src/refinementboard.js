import React, { useState } from 'react';

const RefinementBoard = () => {
  const roles = ['Developer', 'QA', 'UI', 'UX', 'Production', 'Architect'];

  const [role, setRole] = useState('');
  const [prediction, setPrediction] = useState('');
  const [predictionsList, setPredictionsList] = useState([]);
  const [isInRoom] = useState(true);
  const [error, setError] = useState('');

  // role selection
  const handleAssignRole = (selectedRole) => {
    setRole(selectedRole);
  };

  // prediction input
  const handlePredictionChange = (e) => {
    const value = e.target.value;
    setError(''); // Clear any previous errors
    if (value < 0) {
      setError('Prediction cannot be negative.');
    } else if (value > 1000) {
      setError('Prediction cannot exceed 1000 days.');
    } else {
      setPrediction(value); // Only set prediction if valid (not a negative number and less than 1000)
    }
  };

  // Handle prediction submission
  const handlePredictionSubmit = () => {
    if (prediction === '' || error) {
      setError('Please enter a valid prediction.');
      return;
    }
    setPredictionsList([...predictionsList, { role, prediction }]); // adds prediction to the list
    setPrediction(''); // clear the input field
    setError(''); // clear any error messages
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] p-4">
      /* Role Selection */
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

      /* Prediction Form */
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
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
          <button
            onClick={handlePredictionSubmit}
            className="mt-4 bg-[#FF4081] text-white px-4 py-2 rounded hover:bg-[#D81B60]"
            disabled={!!error || prediction === ''} // the buuton won't work if there is an error or no input is provided 
          >
            Submit Prediction
          </button>
        </div>
      )}

      /* List of predictions */
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
      )} /* end of prediction list*/
    </div> /* end of main div*/
  );
};

export default RefinementBoard;