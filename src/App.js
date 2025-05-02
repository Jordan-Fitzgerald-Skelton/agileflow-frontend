import React from "react";
import { BrowserRouter as Router, Route, Routes, NavLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./auth/login";
import LogoutButton from "./auth/logout";
import Profile from "./auth/profile";
import RetroBoard from "./components/retroboard";
import RefinementBoard from "./components/refinementboard";
import { InfoHome } from "./components/InfoHome";

function App() {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <div>Loading authentication...</div>;

  return (
    <Router>
      {!isAuthenticated ? (
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
          <LoginButton />
        </div>
      ) : (
        <div className="min-h-screen bg-[#121212]">
          <header className="bg-[#1C1C1C] text-[#E0E0E0] py-4">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-[#E0E0E0] text-2xl font-bold px-4 py-2 hover:text-3xl transition-all duration-300 rounded">AgileFlow</h1>
              <nav className="mt-4 flex space-x-6">
                <NavLink to="/" className="text-[#E0E0E0] text-lg px-4 py-2 hover:bg-[#1C1C1C] hover:text-xl transition-all duration-300 rounded">Home</NavLink>
                <NavLink to="/retro-board" className="text-[#E0E0E0] text-lg px-4 py-2 hover:bg-[#1C1C1C] hover:text-xl transition-all duration-300 rounded">Retro Board</NavLink>
                <NavLink to="/refinement-board" className="text-[#E0E0E0] text-lg px-4 py-2 hover:bg-[#1C1C1C] hover:text-xl transition-all duration-300 rounded">Refinement Board</NavLink>
              </nav>
              <div className="flex items-center space-x-4">
                <Profile />
                <LogoutButton />
              </div>
            </div>
          </header>

          <main className="container mx-auto my-10">
            <Routes>
              <Route path="/" element={<InfoHome />} />
              <Route path="/retro-board" element={<RetroBoard />} />
              <Route path="/refinement-board" element={<RefinementBoard />} />
            </Routes>
          </main>
        </div>
      )}
    </Router>
  );
}

export default App;
