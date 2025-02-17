
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Chart } from "react-chartjs-2";

// Enregistrer les composants nécessaires pour Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend);

const PopulationAndCommentsChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/population_and_comments_by_country"
        );
        const data = response.data;
        const countries = data.map((item) => item.Country);
        const populations = data.map((item) => item.Population);
        const comments = data.map((item) => item.Sentiments);

        // Création des données pour le graphique
        setChartData({
          labels: countries,
          datasets: [
            {
              type: "bar", // Type: Histogramme
              label: "Population",
              data: populations,
              backgroundColor: "rgba(54, 162, 235, 0.6)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
              yAxisID: "y1", // Lier les barres à l'échelle principale
            },
            {
              type: "line", // Type: Courbe
              label: "Commentaires",
              data: comments,
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              yAxisID: "y2", // Lier la courbe à une échelle secondaire
            },
          ],
        });
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: {
            size: 14,
          },
        },
      },
     
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Pays",
          font: {
            size: 14,
          },
        },
      },
      y1: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Population",
          font: {
            size: 14,
          },
        },
      },
      y2: {
        beginAtZero: true, 
        title: {
          display: true,
          text: "Commentaires",
          font: {
            size: 14,
          },
        },
        position: "right", 
        grid: {
          drawOnChartArea: false, 
        },
      },
    },
  };

  return (
    <div style={{ width: "85%", margin: "50px auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
      Population et Commentaires par Pays
      </h2>
      {loading ? (
        <p style={{ textAlign: "center" }}>Chargement des données...</p>
      ) : (
        chartData && <Chart type="bar" data={chartData} options={options} />
      )}
    </div>
  );
};

export default PopulationAndCommentsChart;