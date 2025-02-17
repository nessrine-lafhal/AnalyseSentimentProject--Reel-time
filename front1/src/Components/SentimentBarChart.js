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

const SentimentBarChart = () => {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    // Récupérer les données depuis le backend Flask
    axios.get("http://localhost:5000/sentiments")
      .then(response => {
        const data = response.data;
        setChartData({
          labels: ["Neutre", "Positif", "Négatif"],
          datasets: [
            {
              label: "Nombre de sentiments",
              data: [data.neutre, data.positif, data.negatif],
              backgroundColor: ["gray", "green", "red"]
            }
          ]
        });
      })
      .catch(error => console.error("Erreur lors de la récupération des données :", error));
  }, []);

  return (
    <div style={{ width: "60%", margin: "50px auto" }}>
      <h2>Analyse des sentiments</h2>
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

export default SentimentBarChart;
