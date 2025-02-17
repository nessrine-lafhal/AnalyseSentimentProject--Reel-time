import React, { useEffect, useState } from "react";
import "./LivePage.css";  
//import { fetchData } from './services/fetchData';

const LivePage = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://localhost:5000/get_data")
        .then((response) => response.json())
        .then((data) => {
          console.log(data); // Log the fetched data to the console
          setData(data);
        })
        .catch((error) => console.error("Error fetching data:", error));
    }, 2000); // Adjust interval as necessary
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div>
      <h1>Live Data</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Tweet</th>
            <th>Timestamp</th>
            <th>Prediction</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.age}</td>
              <td>{item.gender}</td>
              {/* Clean the tweet to remove extra information */}
              <td>{item.tweet}</td>
              <td>{item.timestamp}</td>
              {/* Display the prediction */}
              <td>{item.prediction}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LivePage;
