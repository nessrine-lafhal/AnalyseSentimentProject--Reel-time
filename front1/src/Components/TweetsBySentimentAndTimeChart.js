import React, { useEffect, useState, useRef } from "react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TweetsBySentimentAndTimeChart = () => {
  const [chartData, setChartData] = useState({});
  const chartCanvasRef = useRef(null);  // Reference for the canvas

  useEffect(() => {
    // Check if the canvas is available
    if (chartCanvasRef.current) {
      const existingChart = ChartJS.getChart(chartCanvasRef.current);
      if (existingChart) {
        existingChart.destroy();
      }
    }

    // Fetch tweet data
    axios.get("http://localhost:5000/tweets_by_sentiment_and_time")
      .then(response => {
        const data = response.data;
        const sentiments = Object.keys(data);
        const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

        const datasets = sentiments.map(sentiment => {
          let backgroundColor, borderColor;

          // Assign colors based on sentiment
          if (sentiment === "0") {
            backgroundColor = 'rgba(0, 123, 255, 0.8)';  // Sentiment 0 color
            borderColor = 'rgba(0, 123, 255, 1)';
          } else if (sentiment === "1") {
            backgroundColor = 'rgba(255, 99, 132, 0.8)';  // Sentiment 1 color
            borderColor = 'rgba(255, 99, 132, 1)';
          } else if (sentiment === "2") {
            backgroundColor = 'rgba(75, 192, 192, 0.8)';  // Sentiment 2 color
            borderColor = 'rgba(75, 192, 192, 1)';
          } else {
            backgroundColor = 'rgba(255, 159, 64, 0.8)';  // Default color
            borderColor = 'rgba(255, 159, 64, 1)';
          }

          return {
            label: `Sentiment: ${sentiment}`,
            data: data[sentiment],
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            borderWidth: 2
          };
        });

        setChartData({
          labels: hours,
          datasets: datasets
        });
      })
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  return (
    <div style={{ width: "75%", margin: "40px auto" }}>
      <h2 style={{ textAlign: "center", color: "#333", marginBottom: "50px" }}>
        Tweets par Sentiment<br /> et Temps
      </h2>
      {Object.keys(chartData).length > 0 ? (
        <Bar
          ref={chartCanvasRef}  // Use the ref for the chart
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: true,
                position: "top",
                labels: {
                  font: {
                    size: 14,
                    family: "'Arial', sans-serif",
                  },
                  boxWidth: 40
                }
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    return `${context.dataset.label}: ${context.raw}`;
                  }
                },
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                titleFont: { size: 16 },
                bodyFont: { size: 14 }
              }
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Heure du Tweet",
                  font: { size: 16 },
                  color: "#555"
                },
                grid: {
                  display: true,
                  color: 'rgba(0, 0, 0, 0.1)'
                }
              },
              y: {
                title: {
                  display: true,
                  text: "Nombre de Tweets",
                  font: { size: 16 },
                  color: "#555"
                },
                beginAtZero: true,
                stacked: true,
                grid: {
                  display: true,
                  color: 'rgba(0, 0, 0, 0.1)'
                }
              }
            }
          }}
        />
      ) : (
        <p style={{ textAlign: "center", fontSize: "1.2em", color: "#888" }}>Chargement des données...</p>
      )}
    </div>
  );
  
};

export default TweetsBySentimentAndTimeChart;
