// src/services/fetchData.js
export const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/get_data');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      return []; // Retourne un tableau vide en cas d'erreur
    }
  };
  