// src/components/Dashboard.js
import React from 'react';
import SentimentBarChart from './SentimentBarChart'; 
import './Dashboard.css';
import SentimentByTimeChart from './SentimentByTimeChart'
import TweetByAgedoughnutChart from './TweetByAgedoughnutChart'
import CountryMap from './CountryMap'
import PopulationAndCommentsChart from './PopulationAndCommentsChart';
import TweetsBySentimentAndTimeChart from './TweetsBySentimentAndTimeChart';
const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="charts">
        <SentimentBarChart />
        <SentimentByTimeChart/>
        <TweetByAgedoughnutChart/>
        <TweetsBySentimentAndTimeChart/>

        
        
      </div>
      
      <PopulationAndCommentsChart/>
      <CountryMap/>
    </div>
  );
};
export default Dashboard;
