import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom"; 

import AppSideBarNav from './Components/SideBarNav';
import Live from './Components/Live'; 
import Dashboard from './Components/Dashboard'; 

const App = () => {
  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <AppSideBarNav />

        {/* Contenu principal */}
        <div className="content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/realtime-dash" element={<Live />} />
            <Route path="/" element={<Dashboard />} /> {/* Par défaut, Dashboard */}
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
