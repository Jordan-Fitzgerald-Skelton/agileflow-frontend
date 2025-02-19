import React, { useState } from "react";

const roles = ["Backend Dev", "UI", "UX", "QA", "Product"];

const RefinementBoard = () => {
  const [role, setRole] = useState("");
  const [prediction, setPrediction] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [average, setAverage] = useState(null);

  const handleSubmit = () => {
    const numPrediction = parseFloat(prediction);
    if (isNaN(numPrediction) || numPrediction <= 0 || numPrediction > 1000) {
      alert("Enter a valid number (1 - 1000)");
      return;
    }

    setPredictions([...predictions, numPrediction]);
    setPrediction("");
  };

  const calculateAverage = () => {
    if (predictions.length === 0) {
      setAverage("No predictions made.");
      return;
    }
    const avg = predictions.reduce((a, b) => a + b, 0) / predictions.length;
    setAverage(avg.toFixed(2));
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Refinement Board</h2>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      >
        <option value="">Select Role</option>
        {roles.map((r, index) => (
          <option key={index} value={r}>
            {r}
          </option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Enter prediction (days)"
        value={prediction}
        onChange={(e) => setPrediction(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />
      <button onClick={handleSubmit} className="bg-blue-500 text-white p-2 rounded w-full">
        Submit Prediction
      </button>

      {predictions.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Predictions: {predictions.join(", ")}</h3>
          <button onClick={calculateAverage} className="bg-green-500 text-white p-2 rounded mt-2">
            Show Results
          </button>
          {average && <p className="mt-2">Average Prediction: {average} days</p>}
        </div>
      )}
    </div>
  );
};

export default RefinementBoard;
