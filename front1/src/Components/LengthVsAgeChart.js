// LengthVsAgeChart.js
import React, { useEffect, useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import { fetchData } from './services/fetchData';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register chart elements and configurations
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);



const LengthVsAgeChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const fetchedData = await fetchData();
      setData(fetchedData);
    };

    getData();
  }, []);

  const scatterChartData = {
    datasets: [
      {
        label: "Longueur du Tweet vs Âge",
        data: data.map(item => ({
          x: item.age,
          y: item.tweet.length,
        })),
        backgroundColor: "#742774",
      },
    ],
  };

  return (
    <div style={{ width: "60%", margin: "50px auto" }}>
      <h2>Âge vs Longueur du Tweet</h2>
      <Scatter data={scatterChartData} />
    </div>
  );
};

export default LengthVsAgeChart;
