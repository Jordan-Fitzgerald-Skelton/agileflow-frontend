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
    <div className="container mx-auto my-10" style={{ backgroundColor: '#121212', minHeight: '100vh' }}>
      {/*Switch between the information on both boards*/}
      <div className="flex border-b mb-6" style={{ borderColor: '#2C2C2C' }}>
        <button
          className={`py-3 px-6 font-medium transition-colors duration-200 ${
            activeTab === "refinement"
              ? "border-b-2"
              : "hover:opacity-80"
          }`}
          style={{
            color: activeTab === "refinement" ? '#03A9F4' : '#B0B0B0',
            borderBottomColor: activeTab === "refinement" ? '#03A9F4' : 'transparent'
          }}
          onClick={() => setActiveTab("refinement")}
        >
          Refinement Board
        </button>
        <button
          className={`py-3 px-6 font-medium transition-colors duration-200 ${
            activeTab === "retro"
              ? "border-b-2"
              : "hover:opacity-80"
          }`}
          style={{
            color: activeTab === "retro" ? '#03A9F4' : '#B0B0B0',
            borderBottomColor: activeTab === "retro" ? '#03A9F4' : 'transparent'
          }}
          onClick={() => setActiveTab("retro")}
        >
          Retro Board
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activeTab === "refinement" ? (
          <>
            <div className="shadow-md rounded-lg p-6 my-6" style={{ backgroundColor: '#1E1E1E' }}>
              <h3 className="text-xl font-semibold mb-4" style={{ color: '#E0E0E0' }}>
                What is the Refinement Board for?
              </h3>
              <p style={{ color: '#B0B0B0', lineHeight: '1.6' }}>
                The Refinement Board is designed to help teams with calculating the estimated time that they believe a ticket should take 
                to complete during each part of its development. An example of how a normal refinment meeting would take place: 
                <br />
                <br />
                A ticket is created 
                a new filter button for a list on a table. For this ticket an esitmate from the backend dev and QA teams would be needed.
                Each member of the dev team would provided an estimated time they believe this change should take to complete via a direct message to the team lead. 
                All of their estimates would be collected and an average calculated. Then the members of the QA team would provided an estimated time they 
                believe this ticket should take to test. Their estimates would be collected and an average calculated. The ticket would then be 
                assigned a estimated completion time based on adding both averaged estimates together. The tickets description of the 
                ticket is updated with the total average and the breakdown for both the dev team and the QA team. 
                <br />
                <br />
                My refinment board aims to allow for both the backend devs and QA memebers to submit their predictions simultaneously and automatically 
                calculate and present the predictions in a readable format.
                <br />
                <br />
                Below is an example of what a final output would look like
              </p>
              {/*Shows the final prediction chart*/}
              {showResults && predictions && predictions.length > 0 && (
                <div className="rounded-lg shadow-lg p-4 mt-6" style={{ backgroundColor: '#1E1E1E', border: `1px solid #2C2C2C` }}>
                  <h3 className="text-xl font-semibold mb-6 pb-2 flex items-center gap-2" style={{ color: '#E0E0E0', borderBottom: `1px solid #2C2C2C` }}>
                    Final Results
                  </h3>
                  {/*bar chart*/}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {[...predictions].sort((a, b) => b.final_prediction - a.final_prediction).map((result, index) => (
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
                    {/*table below*/}
                    <div className="overflow-x-auto">
                      <table className="min-w-full rounded-lg overflow-hidden" style={{ backgroundColor: '#1E1E1E' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#2C2C2C' }}>
                            <th className="px-4 py-2 text-left" style={{ color: '#E0E0E0' }}>Role</th>
                            <th className="px-4 py-2 text-left" style={{ color: '#E0E0E0' }}>Average Prediction</th>
                          </tr>
                        </thead>
                        <tbody>
                          {predictions.map((result, index) => (
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
          </>
        ) : (
          <>
            <div className="shadow-md rounded-lg p-6 my-6" style={{ backgroundColor: '#1E1E1E' }}>
              <h3 className="text-xl font-semibold mb-4" style={{ color: '#E0E0E0' }}>
                What is the Retro Board for?
              </h3>
              <p style={{ color: '#B0B0B0', lineHeight: '1.6' }}>
                The Retro Board is designed to help teams review the sprint that took place by providing feedback and create action to be completed
                to help make the next sprint more effective. An example of how a normal retrospective meeting would take place:
                <br />
                <br />
                Members of the team would leave comments under 3 different heading, "what went well", "what didn't go well" and "areas of improvement". 
                After discussing these topics a new item is created under a heading called "actions". These "actions" are a task that is assigned to the member 
                of the team to complete, that should help the team improve the processes for the next sprint. An example "action" would be to create a document to describe a the release process
                for a particular change that needs to be completed correctly in order for a smooth release to occur. The "actions" are typically 
                created as tickets manually by a team lead. Once created the team lead assignes a member of the team and they recieve a notifications 
                about the ticket. 
                <br />
                <br />
                My retro board aims to combine this functionality by allowing for users to provide feedback under each heading and to automatically 
                create the notifications for the "action" that needs to be completed to the assigned member of the team using dircet email notifications.
              </p>
              {/*shows the different boxes*/}
              <div className="mt-6 grid grid-cols-4 gap-2">
                <div className="p-3 rounded-lg text-center transition-transform duration-200 hover:scale-105" style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', border: `1px solid rgba(76, 175, 80, 0.3)` }}>
                  <BsCheck2Circle className="text-xl mx-auto mb-2" style={{ color: '#4CAF50' }} />
                  <span className="text-sm" style={{ color: '#4CAF50' }}>What went well</span>
                </div>
                <div className="p-3 rounded-lg text-center transition-transform duration-200 hover:scale-105" style={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', border: `1px solid rgba(244, 67, 54, 0.3)` }}>
                  <BsXCircle className="text-xl mx-auto mb-2" style={{ color: '#F44336' }} />
                  <span className="text-sm" style={{ color: '#F44336' }}>What didn't go well</span>
                </div>
                <div className="p-3 rounded-lg text-center transition-transform duration-200 hover:scale-105" style={{ backgroundColor: 'rgba(3, 169, 244, 0.1)', border: `1px solid rgba(3, 169, 244, 0.3)` }}>
                  <BsLightbulb className="text-xl mx-auto mb-2" style={{ color: '#03A9F4' }} />
                  <span className="text-sm" style={{ color: '#03A9F4' }}>Improvements</span>
                </div>
                <div className="p-3 rounded-lg text-center transition-transform duration-200 hover:scale-105" style={{ backgroundColor: 'rgba(156, 39, 176, 0.1)', border: `1px solid rgba(156, 39, 176, 0.3)` }}>
                  <BsBell className="text-xl mx-auto mb-2" style={{ color: '#9C27B0' }} />
                  <span className="text-sm" style={{ color: '#9C27B0' }}>Actions</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
