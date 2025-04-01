import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const BettingInterface = () => {
  const [markets, setMarkets] = useState([]);
  const [selectedRace, setSelectedRace] = useState(null);
  const [betAmount, setBetAmount] = useState(10);
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [betType, setBetType] = useState('win');
  const [bets, setBets] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    // Fetch available races
    const fetchRaces = async () => {
      try {
        const response = await axios.get('/api/races');
        setMarkets(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch races:', err);
        setError('Failed to load available races');
        setLoading(false);
      }
    };

    fetchRaces();

    // Setup WebSocket connection for real-time odds updates
    // Use relative URL to leverage the proxy configuration
    wsRef.current = new WebSocket(`ws://${window.location.hostname}:3000`);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setStatus('Connected to betting service');
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);

        if (data.type === 'odds_update') {
          // Update odds in the UI
          setMarkets(prevMarkets => {
            return prevMarkets.map(race => {
              if (race.id === data.raceId) {
                return {
                  ...race,
                  horses: race.horses.map(horse => {
                    if (horse.id === data.horseId) {
                      return { ...horse, odds: data.odds };
                    }
                    return horse;
                  })
                };
              }
              return race;
            });
          });
        } else if (data.type === 'bet_result') {
          // Handle bet result
          setStatus(`Bet ${data.success ? 'placed successfully' : 'failed'}: ${data.message}`);
          if (data.success) {
            setBets(prevBets => [...prevBets, {
              id: data.betId,
              raceId: selectedRace?.id,
              raceName: selectedRace?.name,
              horseId: selectedHorse?.id,
              horseName: selectedHorse?.name,
              amount: betAmount,
              type: betType,
              timestamp: new Date().toISOString(),
              status: 'Pending'
            }]);
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStatus('Connection error with betting service');
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setStatus('Disconnected from betting service');
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [selectedRace, selectedHorse, betAmount, betType]);

  // Subscribe to updates for a specific race
  const subscribeToRace = (raceId) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        marketId: raceId
      }));
    }
  };

  // Select a race to bet on
  const handleRaceSelect = (race) => {
    setSelectedRace(race);
    setSelectedHorse(null);
    subscribeToRace(race.id);
  };

  // Place a bet
  const placeBet = () => {
    if (!selectedRace || !selectedHorse || !betAmount) {
      setStatus('Please select a race, horse, and bet amount');
      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'place_bet',
        raceId: selectedRace.id,
        horseId: selectedHorse.id,
        amount: betAmount,
        betType: betType
      }));
      setStatus('Placing bet...');
    } else {
      setStatus('Not connected to betting service');
    }
  };

  if (loading) {
    return <div className="betting-interface">Loading available races...</div>;
  }

  if (error) {
    return <div className="betting-interface">Error: {error}</div>;
  }

  return (
    <div className="betting-interface">
      <h2>Betting Interface</h2>
      <p className="status-message">{status}</p>

      <div className="betting-container">
        <div className="races-list">
          <h3>Available Races</h3>
          {markets.length === 0 ? (
            <p>No races available</p>
          ) : (
            <ul>
              {markets.map(race => (
                <li 
                  key={race.id} 
                  className={selectedRace?.id === race.id ? 'selected' : ''}
                  onClick={() => handleRaceSelect(race)}
                >
                  {race.name} - {race.track} ({new Date(race.startTime).toLocaleTimeString()})
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedRace && (
          <div className="betting-panel">
            <h3>Betting on: {selectedRace.name}</h3>
            <p>Track: {selectedRace.track}</p>
            <p>Time: {new Date(selectedRace.startTime).toLocaleString()}</p>

            <div className="horses-list">
              <h4>Select Horse</h4>
              <table>
                <thead>
                  <tr>
                    <th>Number</th>
                    <th>Horse</th>
                    <th>Odds</th>
                    <th>Jockey</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRace.horses.map(horse => (
                    <tr 
                      key={horse.id}
                      className={selectedHorse?.id === horse.id ? 'selected' : ''}
                      onClick={() => setSelectedHorse(horse)}
                    >
                      <td>{horse.number}</td>
                      <td>{horse.name}</td>
                      <td>{horse.odds}</td>
                      <td>{horse.jockey}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bet-form">
              <h4>Place Bet</h4>
              <div className="form-group">
                <label htmlFor="betType">Bet Type:</label>
                <select 
                  id="betType" 
                  value={betType} 
                  onChange={(e) => setBetType(e.target.value)}
                >
                  <option value="win">Win</option>
                  <option value="place">Place</option>
                  <option value="each-way">Each-way</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="betAmount">Amount ($):</label>
                <input 
                  type="number" 
                  id="betAmount"
                  min="1"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                />
              </div>

              {selectedHorse && (
                <div className="bet-summary">
                  <p>Betting ${betAmount} {betType} on {selectedHorse.name}</p>
                  <p>Potential return: ${(betAmount * selectedHorse.odds).toFixed(2)}</p>
                </div>
              )}

              <button
                className="place-bet-button"
                disabled={!selectedHorse}
                onClick={placeBet}
              >
                Place Bet
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bet-history">
        <h3>Bet History</h3>
        {bets.length === 0 ? (
          <p>No bets placed yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Race</th>
                <th>Horse</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bets.map(bet => (
                <tr key={bet.id}>
                  <td>{bet.id}</td>
                  <td>{bet.raceName}</td>
                  <td>{bet.horseName}</td>
                  <td>{bet.type}</td>
                  <td>${bet.amount}</td>
                  <td>{new Date(bet.timestamp).toLocaleTimeString()}</td>
                  <td>{bet.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BettingInterface;