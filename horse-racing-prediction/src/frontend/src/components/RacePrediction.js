import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RacePrediction = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await axios.get('/api/predictions');
        setPredictions(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch predictions');
        setLoading(false);
        console.error(err);
      }
    };

    fetchPredictions();

    // Set up SSE for real-time updates
    const eventSource = new EventSource('/api/events');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'prediction_update') {
        setPredictions(prevPredictions => {
          // Update the prediction for the specific race
          const updatedPredictions = [...prevPredictions];
          const index = updatedPredictions.findIndex(p => p.raceId === data.raceId);
          
          if (index !== -1) {
            updatedPredictions[index] = data.prediction;
          } else {
            updatedPredictions.push(data.prediction);
          }
          
          return updatedPredictions;
        });
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (loading) {
    return <div>Loading predictions...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="race-predictions">
      <h2>Race Predictions</h2>
      {predictions.length === 0 ? (
        <p>No predictions available</p>
      ) : (
        predictions.map(prediction => (
          <div key={prediction.raceId} className="prediction-card">
            <h3>{prediction.raceName}</h3>
            <p>Track: {prediction.trackName}</p>
            <p>Race Time: {new Date(prediction.raceTime).toLocaleString()}</p>
            <p>Confidence: {(prediction.confidence * 100).toFixed(1)}%</p>
            <h4>Predictions:</h4>
            <table className="predictions-table">
              <thead>
                <tr>
                  <th>Horse</th>
                  <th>Probability</th>
                  <th>Odds</th>
                </tr>
              </thead>
              <tbody>
                {prediction.predictions.map(horse => (
                  <tr key={horse.horseId}>
                    <td>{horse.horseName}</td>
                    <td>{(horse.probability * 100).toFixed(1)}%</td>
                    <td>{horse.odds.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default RacePrediction;
