import React, { useState } from 'react';

const RetroBoard = () => {
  const [goWellComments, setGoWellComments] = useState([]);
  const [didntGoWellComments, setDidntGoWellComments] = useState([]);
  const [areasForImprovementComments, setAreasForImprovementComments] = useState([]);
  const [actionsComments, setActionsComments] = useState([]);

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

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] p-4">
      /* Creates a grid layout for each section*/
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

        /* What did go well*/
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
                // Clear input after adding
                document.getElementById('goWellComment').value = '';
              }
            }}
          >
            Add
          </button>
          /*creates a list and inserts every new comment and an item in the list*/
          <ul className="mt-4">
            {goWellComments.map((comment, index) => (
              <li key={index} className="text-[#E0E0E0] mb-1">{comment}</li>
            ))}
          </ul>
        </div>

        /*What didn't go well*/
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
                // Clear input after adding
                document.getElementById('didntGoWellComment').value = '';
              }
            }}
          >
            Add
          </button>
          /*creates a list and inserts every new comment and an item in the list*/
          <ul className="mt-4">
            {didntGoWellComments.map((comment, index) => (
              <li key={index} className="text-[#E0E0E0] mb-1">{comment}</li>
            ))}
          </ul>
        </div>

        /*Areas for improvement*/
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
                // Clear input after adding
                document.getElementById('areasForImprovementComment').value = '';
              }
            }}
          >
            Add
          </button>
          /*creates a list and inserts every new comment and an item in the list*/
          <ul className="mt-4">
            {areasForImprovementComments.map((comment, index) => (
              <li key={index} className="text-[#E0E0E0] mb-1">{comment}</li>
            ))}
          </ul>
        </div>

        /*Actions*/
        <div className="bg-[#1C1C1C] shadow-md rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2 text-[#9C27B0]">Actions</h3>
          <input
            type="text"
            placeholder="Add comment"
            className="border border-[#9C27B0] rounded w-full px-2 py-1 mt-2 text-[#E0E0E0] bg-[#121212]"
            id="actionsComment"
          />
          <button
            className="mt-2 bg-[#9C27B0] text-white px-4 py-1 rounded hover:bg-[#7B1FA2]"
            onClick={() => {
              const comment = document.getElementById('actionsComment').value;
              if (comment) {
                handleAddComment('actions', comment);
                // Clear input after adding
                document.getElementById('actionsComment').value = '';
              }
            }}
          >
            Add
          </button>
          /*creates a list and inserts every new comment and an item in the list*/
          <ul className="mt-4">
            {actionsComments.map((comment, index) => (
              <li key={index} className="text-[#E0E0E0] mb-1">{comment}</li>
            ))}
          </ul>
        </div>
      </div> /*grid end*/
    </div> /* main div end*/
  );
};

export default RetroBoard;