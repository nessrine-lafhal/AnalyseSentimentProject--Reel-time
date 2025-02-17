import React from 'react';
import './Live.css'; 
import LengthVsAgeChart from './LengthVsAgeChart';
import AgeDistributionChart from './AgeDistributionChart';
import SentimentDistributionChart from './SentimentDistributionChart';
import TweetsOverTimeChart from './TweetsOverTimeChart';
import GenderDistributionChart from './GenderDistributionChart';
import LivePage from './LivePage';

const Live = () => {
  return (
    <div className="dashboard-container">
      <div className="charts">
        <LengthVsAgeChart />
        <AgeDistributionChart />
        <SentimentDistributionChart />
        <TweetsOverTimeChart />
        <GenderDistributionChart />
      </div>
      <LivePage />
    </div>
  );
};

export default Live;
