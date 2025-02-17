import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import './CountryMap.css';

const CountryMap = () => {
  const [countryData, setCountryData] = useState({});
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/tweet_counts_by_country")
      .then((response) => {
        setCountryData(response.data);
      })
      .catch((error) =>
        console.error("Erreur lors de la récupération des données : ", error)
      );

    fetch("http://localhost:5000/countries_geojson")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des données GeoJSON");
        }
        return response.json();
      })
      .then((data) => {
        if (data.type === "FeatureCollection" && Array.isArray(data.features)) {
          setGeoData(data);
        } else {
          throw new Error("Objet GeoJSON invalide");
        }
      })
      .catch((error) =>
        console.error("Erreur lors du chargement des données GeoJSON : ", error)
      );
  }, []);

  const style = (feature) => {
    const countryName = feature.properties.name;
    const tweetCount = countryData[countryName] || 0;

    let fillColor = "gray";

    if (tweetCount > 120) {
      fillColor = "green";
    } else if (tweetCount > 100) {
      fillColor = "blue";
    } else if (tweetCount > 0) {
      fillColor = "red";
    }

    return {
      fillColor: fillColor,
      weight: 1,
      opacity: 1,
      color: "black",
      dashArray: "3",
      fillOpacity: 0.7,
    };
  };

  const onEachCountry = (feature, layer) => {
    const countryName = feature.properties.name;
    const tweetCount = countryData[countryName] || 0;

    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 3,
          color: "yellow",
          dashArray: "",
          fillOpacity: 0.9,
        });

        layer.bindTooltip(
          `<strong>${countryName}</strong><br>Nombre de tweets: ${tweetCount}`,
          {
            permanent: false,
            direction: "top",
          }
        ).openTooltip();
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle(style(feature)); 
        layer.closeTooltip();
      },
      click: (e) => {
        const layer = e.target;

        const popupContent = `<strong>${countryName}</strong><br>Nombre de tweets: ${tweetCount}`;
        layer.bindPopup(popupContent, { closeButton: true }).openPopup();
      },
    });
  };

  const Legend = () => {
    const map = useMap();
    useEffect(() => {
      const legend = L.control({ position: "topright" }); // Update position to topright

      legend.onAdd = function () {
        const div = L.DomUtil.create("div", "info legend");
        const tweetRanges = [
          { range: ">120", color: "green" },
          { range: " 100-120", color: "blue" },
          { range: " 0-120", color: "red" },
          { range: " 0", color: "gray" },
        ];

        let legendHTML = "<strong>Nombre de tweets</strong><br>";
        tweetRanges.forEach((range) => {
          legendHTML += `<i style="background:${range.color}; width: 20px; height: 20px; display: inline-block;"></i> ${range.range}<br>`;
        });

        div.innerHTML = legendHTML;
        return div;
      };

      legend.addTo(map);

      return () => {
        map.removeControl(legend);
      };
    }, [map]);

    return null;
  };

  return (
    <div style={{ width: "100%", margin: "auto", height: "400px" }}>
      <h2>Nombre de tweets par pays</h2>
      <br />
      <br />
      {geoData ? (
        <MapContainer
          center={[20, 0]}
          zoom={1.5}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          scrollWheelZoom={false}
        >
          <GeoJSON
            data={geoData}
            style={style}
            onEachFeature={onEachCountry}
          />
          <Legend />
        </MapContainer>
      ) : (
        <p>Chargement des données de la carte...</p>
      )}
    </div>
  );
};

export default CountryMap;
