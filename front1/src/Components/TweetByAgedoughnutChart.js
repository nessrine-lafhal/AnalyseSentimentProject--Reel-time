import React, { useEffect, useState } from "react";
import axios from "axios";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

// Enregistrer les composants nécessaires
ChartJS.register(ArcElement, Title, Tooltip, Legend);

const AgeGroupDoughnutChart = () => {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    // Récupérer les données depuis le backend Flask
    axios.get("http://localhost:5000/tweets_by_age")
      .then(response => {
        const data = response.data;
        // Extraire les labels (groupes d'âge) et les counts (nombre de tweets)
        const labels = Object.keys(data);
        const counts = Object.values(data);
        
        setChartData({
          labels: labels,
          datasets: [
            {
              label: "Nombre de Tweets par groupe d'âge",
              data: counts,
              backgroundColor: [
                'rgba(75, 192, 192, 0.2)',
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 99, 132, 0.2)'
              ],
              borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 99, 132, 1)'
              ],
              borderWidth: 1
            }
          ]
        });
      })
      .catch(error => console.error("Erreur lors de la récupération des données :", error));
  }, []);

  return (
    <div style={{ width: "50%", margin: "50px auto" }}>
      <h2>Nombre de Tweets par groupe d'âge</h2>
      {Object.keys(chartData).length > 0 ? (
        <Doughnut
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

export default AgeGroupDoughnutChart;
