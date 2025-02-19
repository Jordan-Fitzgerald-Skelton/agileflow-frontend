import React, { useState } from "react";

const sections = [
  { id: "wentWell", title: "What went well" },
  { id: "didntGoWell", title: "What didn't go well" },
  { id: "improvements", title: "Areas of improvement" },
  { id: "actions", title: "Actions" },
];

export default function RetroBoard() {
  const [comments, setComments] = useState({
    wentWell: [],
    didntGoWell: [],
    improvements: [],
    actions: [],
  });
  const [input, setInput] = useState({
    wentWell: "",
    didntGoWell: "",
    improvements: "",
    actions: "",
  });

  const handleAddComment = (section) => {
    if (!input[section].trim()) return;
    setComments({
      ...comments,
      [section]: [...comments[section], input[section]],
    });
    setInput({ ...input, [section]: "" });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Retrospective Board</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {sections.map((section) => (
          <div key={section.id} className="bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
            <div className="space-y-2">
              {comments[section.id].map((comment, index) => (
                <p key={index} className="bg-gray-200 p-2 rounded-lg">{comment}</p>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={input[section.id]}
                onChange={(e) =>
                  setInput({ ...input, [section.id]: e.target.value })
                }
                className="flex-1 p-2 border rounded-lg"
                placeholder="Add a comment..."
              />
              <button
                onClick={() => handleAddComment(section.id)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}