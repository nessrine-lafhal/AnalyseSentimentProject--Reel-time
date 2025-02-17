// src/components/Sidebar.js

import React from 'react';
import { Link } from 'react-router-dom';
import './SideBarNav.css'; 

const AppSideBarNav = () => {
  return (
    <div className="sidebar">
      {/* Titre principal */}
      <h1 className="sidebar-title">Analyse des Sentiments</h1>
      {/* Menu */}
      <ul className="sidebar-menu">
        <li>
          <Link to="/dashboard">Tableau de Bord Statique</Link>
        </li>
        <li>
          <Link to="/realtime-dash">Tableau de Bord Temps Réel</Link>
        </li>
      </ul>
    </div>
  );
};

export default AppSideBarNav;
