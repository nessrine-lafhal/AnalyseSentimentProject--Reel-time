// SentimentDistributionChart.js
import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { fetchData } from './services/fetchData';

const SentimentDistributionChart = () => {
  const [sentimentData, setSentimentData] = useState({ positive: 0, negative: 0, neutral: 0 });

  useEffect(() => {
    const getData = async () => {
      const fetchedData = await fetchData();
      const positiveCount = fetchedData.filter(item => item.prediction === 'Positive').length;
      const negativeCount = fetchedData.filter(item => item.prediction === 'Negative').length;
      const neutralCount = fetchedData.filter(item => item.prediction === 'Neutral').length;
      setSentimentData({ positive: positiveCount, negative: negativeCount, neutral: neutralCount });
    };

    getData();
  }, []);

  const sentimentChartData = {
    labels: ["Positif", "Négatif", "Neutre"],
    datasets: [
      {
        data: [sentimentData.positive, sentimentData.negative, sentimentData.neutral],
        backgroundColor: ["#4CAF50", "#F44336", "#FFC107"],
      },
    ],
  };

  return (
<div style={{ width: "40%", margin: "50px auto" }}>      <h2>Répartition des Sentiments</h2>
      <Pie data={sentimentChartData} />
    </div>
  );
};

export default SentimentDistributionChart;
