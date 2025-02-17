import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

// Enregistrer les composants nécessaires
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SentimentByTimeChart = () => {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    // Récupérer les données depuis le backend Flask
    axios.get("http://localhost:5000/sentiments_by_time")
      .then(response => {
        const data = response.data;
        const periods = Object.keys(data);  // Récupérer les périodes : night, morning, noon
        const sentimentTotals = Object.values(data);  // Récupérer les totaux des sentiments

        setChartData({
          labels: periods,  // Utiliser les périodes comme labels
          datasets: [
            {
              label: "Somme des sentiments par période de la journée",
              data: sentimentTotals,
              backgroundColor: ["#00008B", "#32CD32", "#FF6347"],  
            }
          ]
        });
      })
      .catch(error => console.error("Erreur lors de la récupération des données :", error));
  }, []);

  return (
    <div style={{ width: "60%", margin: "50px auto" }}>
      <h2>Somme des sentiments par période de la journée</h2>
      {Object.keys(chartData).length > 0 ? (
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { display: true, position: "top" }
            }
          }}
        />
      ) : (
        <p>Chargement des données...</p>
      )}
    </div>
  );
};

export default SentimentByTimeChart;
