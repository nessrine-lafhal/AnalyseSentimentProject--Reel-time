// AgeDistributionChart.js
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { fetchData } from './services/fetchData';

const AgeDistributionChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const fetchedData = await fetchData();
      setData(fetchedData);
    };

    getData();
  }, []);

  const ageData = {
    labels: ["18-25", "26-35", "36-45", "46+"],
    datasets: [
      {
        label: "Répartition par Âge",
        data: [
          data.filter(item => item.age >= 18 && item.age <= 25).length,
          data.filter(item => item.age >= 26 && item.age <= 35).length,
          data.filter(item => item.age >= 36 && item.age <= 45).length,
          data.filter(item => item.age > 45).length,
        ],
        backgroundColor: ["#FFCE56", "#36A2EB", "#FF6384", "#4BC0C0"],
      },
    ],
  };

  return (
    <div style={{ width: "60%", margin: "50px auto" }}>
      <h2>Répartition par Âge</h2>
      <Bar data={ageData} />
    </div>
  );
};

export default AgeDistributionChart;
