// GenderDistributionChart.js
import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { fetchData } from './services/fetchData.js';

const GenderDistributionChart = () => {
  const [genderData, setGenderData] = useState({ male: 0, female: 0 });

  useEffect(() => {
    const getData = async () => {
      const fetchedData = await fetchData();
      const maleCount = fetchedData.filter(item => item.gender === 'Homme').length;
      const femaleCount = fetchedData.filter(item => item.gender === 'Femme').length;
      setGenderData({ male: maleCount, female: femaleCount });
    };
    
    getData();
  }, []);

  const genderChartData = {
    labels: ["Male", "Female"],
    datasets: [
      {
        data: [genderData.male, genderData.female],
        backgroundColor: ["#36A2EB", "#FF6384"],
        hoverBackgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  return (
    <div style={{ width: "40%", margin: "50px auto" }}>
      <h2>Gender Distribution</h2>
      <Pie data={genderChartData} />
    </div>
  );
};

export default GenderDistributionChart;
