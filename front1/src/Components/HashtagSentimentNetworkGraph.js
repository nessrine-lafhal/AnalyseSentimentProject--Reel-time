
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ForceGraph3D } from "react-force-graph";  

const HashtagSentimentNetworkGraph = () => {
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    // Appel à l'API Flask pour récupérer les données de la relation entre hashtags et sentiments
    axios.get("http://localhost:5000/hashtags_sentiment_network")
      .then(response => {
        setGraphData(response.data);
      })
      .catch(error => console.error("Erreur lors de la récupération des données :", error));
  }, []);

  return (
    <div style={{ width: "80%", height: "600px", margin: "50px auto" }}>
      <h2>Réseau des Hashtags et Sentiments</h2>
      {graphData ? (
        <ForceGraph3D
          graphData={graphData}
          nodeAutoColorBy="group"  // Utilisation d'une propriété pour les groupes de noeuds (par exemple, hashtags ou sentiments)
          nodeLabel="id"  // Affiche l'ID du noeud (ici, le hashtag ou le sentiment)
          linkDirectionalParticles="value"  // Propriétés des liens
          linkDirectionalParticleSpeed={0.01}
          width={1000} height={700}
        />
      ) : (
        <p>Chargement des données...</p>
      )}
    </div>
  );
};

export default HashtagSentimentNetworkGraph;