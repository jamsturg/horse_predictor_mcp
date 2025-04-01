import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RacePrediction from './components/RacePrediction';
import BettingInterface from './components/BettingInterface';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Horse Racing Prediction Engine</h1>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/predictions">Predictions</Link>
              </li>
              <li>
                <Link to="/chat">Chat</Link>
              </li>
              <li>
                <Link to="/betting">Betting</Link>
              </li>
            </ul>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/predictions" element={<RacePrediction />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/betting" element={<BettingInterface />} />
          </Routes>
        </main>
        <footer>
          <p>&copy; 2023 Horse Racing Prediction Engine</p>
        </footer>
      </div>
    </Router>
  );
}


function Home() {
  return (
    <div className="home">
      <h2>Welcome to the Horse Racing Prediction Engine</h2>
      <p>
        This application uses advanced analytics and machine learning to predict
        horse racing outcomes with high accuracy.
      </p>
      <div className="features">
        <div className="feature">
          <h3>Real-time Updates</h3>
          <p>Get real-time updates on race predictions and odds changes.</p>
        </div>
        <div className="feature">
          <h3>Historical Analysis</h3>
          <p>Access historical race data and performance analytics.</p>
        </div>
        <div className="feature">
          <h3>Interactive Chat</h3>
          <p>Ask questions and get insights through our AI-powered chat interface.</p>
        </div>
        <div className="feature">
          <h3>Direct Betting</h3>
          <p>Place bets directly through our TAB API integration for a seamless experience.</p>
        </div>
      </div>
    </div>
  );
}

function Chat() {
  return (
    <div className="chat">
      <h2>Chat Interface</h2>
      <p>
        This feature connects to the MCP Chat server for interactive queries about
        horse racing predictions and betting information.
      </p>
      <div className="chat-container">
        <p>Chat interface is loading...</p>
        <p>
          <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer">
            Open MCP Chat in a new window
          </a>
        </p>
      </div>
    </div>
  );
}

export default App;
