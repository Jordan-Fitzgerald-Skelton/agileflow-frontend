import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, NavLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./auth/login";
import LogoutButton from "./auth/logout";
import Profile from "./auth/profile";
import RetroBoard from "./components/retroboard";
import RefinementBoard from "./components/refinementboard";

function App() {
  const { isAuthenticated, isLoading } = useAuth0();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (isLoading) return <div className="loading-screen">Loading authentication...</div>;

  return (
    <Router>
      {!isAuthenticated ? (
        <div className="auth-container">
          <LoginButton />
        </div>
      ) : (
        <div className="app-container">
          <header className="navbar">
            <div className="container">
              <h1 className="logo">AgileFlow</h1>
              <nav className="nav-links">
                <NavLink to="/" className="nav-link">Home</NavLink>
                <NavLink to="/retro-board" className="nav-link">Retro Board</NavLink>
                <NavLink to="/refinement-board" className="nav-link">Refinement Board</NavLink>
              </nav>
              <div className="user-controls">
                <Profile />
                <button className="theme-toggle" onClick={toggleTheme}>
                  {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
                </button>
                <LogoutButton />
              </div>
            </div>
          </header>

          <main className="content">
            <Routes>
              <Route path="/retro-board" element={<RetroBoard />} />
              <Route path="/refinement-board" element={<RefinementBoard />} />
            </Routes>
            <div className="bg-[#1C1C1C] shadow-md rounded-lg p-6 my-6">
              <h3 className="text-xl font-semibold mb-4 text-[#E0E0E0]">What is the Refinement Board for?</h3>
              <p className="text-[#E0E0E0]">
              The Refinement Board is designed to help teams with calculating the estimated time that they believe a ticket should take 
              to complete during each part of its development. e.g A ticket has been created that is related to changing a buttons color. 
              Each member of the dev team would provided an estimated time they believe this chnage should take to complete. All of their 
              estimates would be collected and an average generated. Then the members of the QA team would provided an estimated time they 
              believe this ticket should take to test. Their estimates would be collected and an avergae generated. The ticket would then be 
              assigned a estimated completion time based on adding both averaged estimates togther. This board aims to allow for this process
              to be completed simultaneously and automaticly calculate and present the predictions in a readable format.
              </p>
            </div>
            <div className="bg-[#1C1C1C] shadow-md rounded-lg p-6 my-6">
              <h3 className="text-xl font-semibold mb-4 text-[#E0E0E0]">What is the Retro Board for?</h3>
              <p className="text-[#E0E0E0]">
              The Retro Board is designed to help teams review the sprint that took place by providing feedback under 3 different heading.
              They are "what went well", "what didn't go well" and "areas of improvement". After discussing these topics a new item is created
              under a heading called "actions". These "actions" are a task that is assigned to the member of the team to complete, that should help
              the team improve the processes for the next sprint. An example "action" would be to create a document to describe a the release process
              for a particular change that needs to be completed correctly in order for a smooth release to occure. The "actions" are typcaly created 
              manually by a team lead and the assign an notify the assigned member of the team of the ticket. This board aims to combine this functionality 
              by allowing for users to provide feedback under each heading and to automatticly create the notifications for the "action" that needs to be completed
              to the assigned member of the team. 
              </p>
            </div>
          </main>
        </div>
      )}
    </Router>
  );
}

export default App;