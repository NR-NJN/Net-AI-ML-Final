import React, { useState, useEffect } from 'react';
import NetworkGraph from './components/NetworkGraph';
import MetricsPanel from './components/MetricsPanel';
import { getNetworkState, resetSimulation, optimizeNetwork } from './api';
import { Play, RotateCcw, Activity } from 'lucide-react';
import './App.css';

function App() {
  const [networkData, setNetworkData] = useState(null);
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [optimizationStep, setOptimizationStep] = useState(0);


  useEffect(() => {
    fetchState();
  }, []);

  const fetchState = async () => {
    try {
      const data = await getNetworkState();
      setNetworkData(data);
    } catch (error) {
      console.error("Failed to fetch network state:", error);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const response = await resetSimulation();
      setNetworkData(response.state);
      setMetricsHistory([]);
      setOptimizationStep(0);
    } catch (error) {
      console.error("Failed to reset:", error);
    }
    setLoading(false);
  };

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const result = await optimizeNetwork(5);
      setNetworkData(result.final_state);


      setMetricsHistory(prev => [
        ...prev,
        { step: optimizationStep, cost: result.initial_cost },
        { step: optimizationStep + result.steps_taken, cost: result.final_cost }
      ]);
      setOptimizationStep(prev => prev + result.steps_taken);

    } catch (error) {
      console.error("Failed to optimize:", error);
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1><Activity className="inline-icon" /> Data Center Optimizer</h1>
        <div className="controls">
          <button onClick={handleReset} disabled={loading} className="btn btn-secondary">
            <RotateCcw size={16} /> Reset
          </button>
          <button onClick={handleOptimize} disabled={loading} className="btn btn-primary">
            <Play size={16} /> Optimize (AI)
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="viz-container">
          {networkData ? (
            <NetworkGraph data={networkData} width={800} height={500} />
          ) : (
            <div className="loading">Loading Network Topology...</div>
          )}
        </div>

        <div className="metrics-container">
          <MetricsPanel history={metricsHistory} />
        </div>
      </main>
    </div>
  );
}

export default App;
