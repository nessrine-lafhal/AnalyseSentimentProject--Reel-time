// TweetsOverTimeChart.js
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { fetchData } from './services/fetchData';

const TweetsOverTimeChart = () => {
  const [tweetCount, setTweetCount] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const fetchedData = await fetchData();
      const tweetsPerMinute = fetchedData.map(item => item.timestamp);
      setTweetCount(tweetsPerMinute);
    };

    getData();
  }, []);

  const lineChartData = {
    labels: tweetCount.map((_, index) => index + 1),
    datasets: [
      {
        label: "Number of Tweets",
        data: tweetCount.map((_, index) => index + 1),
        fill: false,
        borderColor: "#3498db", 
        tension: 0.1,
      },
    ],
  };

  return (
    <div style={{ width: "60%", margin: "50px auto" }}>
      <h2>Tweets Over Time</h2>
      <Line data={lineChartData} />
    </div>
  );
};

export default TweetsOverTimeChart;
