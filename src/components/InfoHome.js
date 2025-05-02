import React, { useState } from "react";
import { BsCheck2Circle, BsXCircle, BsLightbulb, BsBell } from "react-icons/bs";

export function InfoHome() {
  const [activeTab, setActiveTab] = useState("refinement");
  const [showResults] = useState(true);
  
  const predictions = [
    { role: "Developer", final_prediction: 3.5 },
    { role: "QA", final_prediction: 1.5 },
    { role: "Total", final_prediction: 5.0 }
  ];

  return (
    <div className="container mx-auto my-10">
      {/*Switch between the information on both boards*/}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          className={`py-3 px-6 font-medium ${
            activeTab === "refinement"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-gray-200"
          }`}
          onClick={() => setActiveTab("refinement")}
        >
          Refinement Board
        </button>
        <button
          className={`py-3 px-6 font-medium ${
            activeTab === "retro"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-gray-200"
          }`}
          onClick={() => setActiveTab("retro")}
        >
          Retro Board
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activeTab === "refinement" ? (
          <>
            <div className="bg-[#1C1C1C] shadow-md rounded-lg p-6 my-6">
              <h3 className="text-xl font-semibold mb-4 text-[#E0E0E0]">
                What is the Refinement Board for?
              </h3>
              <p className="text-[#E0E0E0]">
                The Refinement Board is designed to help teams with calculating the estimated time that they believe a ticket should take 
                to complete during each part of its development. e.g A ticket is created a new filter button for a list on a table. 
                Each member of the dev team would provided an estimated time they believe this change should take to complete. All of their 
                estimates would be collected and an average generated. Then the members of the QA team would provided an estimated time they 
                believe this ticket should take to test. Their estimates would be collected and an average generated. The ticket would then be 
                assigned a estimated completion time based on adding both averaged estimates together. The tickets description of the 
                ticket is updated with the total average and the breakdown for both the dev team and the QA team. My refinment board aims 
                to allow for this processto be completed simultaneously and automatically calculate and present the predictions in a readable format.
                <br>
                </br>
                Below is an example of what a final output would look like
              </p>
              {/*Shows the final prediction chart*/}
              {showResults && predictions && predictions.length > 0 && (
                <div className="bg-gray-800 rounded-lg shadow-lg p-4 mt-6">
                  <h3 className="text-xl font-semibold mb-6 text-white border-b border-gray-700 pb-2 flex items-center gap-2">
                    Final Results
                  </h3>
                  {/*bar chart*/}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {[...predictions].sort((a, b) => b.final_prediction - a.final_prediction).map((result, index) => (
                        <div key={result.role} className="flex items-center space-x-2">
                          <div className="w-20 text-right font-medium text-white">{result.role}</div>
                          <div className="flex-1 bg-gray-700 rounded-full h-6 relative">
                            <div
                              className={`h-6 rounded-full transition-all duration-500 ${index === 0 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                              style={{ width: `${Math.min(100, (result.final_prediction / 10) * 100)}%` }}
                            ></div>
                            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-bold text-white">
                              {result.final_prediction}
                            </span>
                          </div>
                          {index === 0 }
                        </div>
                      ))}
                    </div>
                    {/*table below*/}
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-gray-600">
                            <th className="px-4 py-2 text-left text-white">Role</th>
                            <th className="px-4 py-2 text-left text-white">Average Prediction</th>
                          </tr>
                        </thead>
                        <tbody>
                          {predictions.map((result, index) => (
                            <tr key={result.role} className={index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-750'}>
                              <td className="px-4 py-3 border-b border-gray-600 text-white">{result.role}</td>
                              <td className="px-4 py-3 border-b border-gray-600 font-medium text-white">
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
          </>
        ) : (
          <>
            <div className="bg-[#1C1C1C] shadow-md rounded-lg p-6 my-6">
              <h3 className="text-xl font-semibold mb-4 text-[#E0E0E0]">
                What is the Retro Board for?
              </h3>
              <p className="text-[#E0E0E0]">
                The Retro Board is designed to help teams review the sprint that took place by providing feedback under 3 different heading.
                They are "what went well", "what didn't go well" and "areas of improvement". After discussing these topics a new item is created
                under a heading called "actions". These "actions" are a task that is assigned to the member of the team to complete, that should help
                the team improve the processes for the next sprint. An example "action" would be to create a document to describe a the release process
                for a particular change that needs to be completed correctly in order for a smooth release to occur. The "actions" are typically created 
                manually by a team lead and a member of the team assigned. Once assigned they recieve a notifications abou the ticket. My retro board aims to combine 
                this functionality by allowing for users to provide feedback under each heading and to automatically create the notifications for the "action" 
                that needs to be completed to the assigned member of the team.
              </p>
              {/*shows the different boxes*/}
              <div className="mt-6 grid grid-cols-4 gap-2">
                <div className="bg-green-900 bg-opacity-30 p-3 rounded-lg text-center">
                  <BsCheck2Circle className="text-green-400 text-xl mx-auto mb-2" />
                  <span className="text-green-400 text-sm">What went well</span>
                </div>
                <div className="bg-red-900 bg-opacity-30 p-3 rounded-lg text-center">
                  <BsXCircle className="text-red-400 text-xl mx-auto mb-2" />
                  <span className="text-red-400 text-sm">What didn't go well</span>
                </div>
                <div className="bg-blue-900 bg-opacity-30 p-3 rounded-lg text-center">
                  <BsLightbulb className="text-blue-400 text-xl mx-auto mb-2" />
                  <span className="text-blue-400 text-sm">Improvements</span>
                </div>
                <div className="bg-purple-900 bg-opacity-30 p-3 rounded-lg text-center">
                  <BsBell className="text-purple-400 text-xl mx-auto mb-2" />
                  <span className="text-purple-400 text-sm">Actions</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
