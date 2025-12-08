import React, { useState, useEffect } from 'react';
import NetworkGraph from './components/NetworkGraph';
import MetricsPanel from './components/MetricsPanel';
import { getNetworkState, resetSimulation, optimizeNetwork, triggerBurst, forceChain } from './api';
import { Play, Pause, RotateCcw, Activity, Zap } from 'lucide-react';
import './App.css';

function App() {
  const [networkData, setNetworkData] = useState(null);
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [optimizationStep, setOptimizationStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchState();
  }, []);


  useEffect(() => {
    let timer;
    if (isPlaying && !loading) {
      timer = setTimeout(() => {
        handleOptimize();
      }, 800);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, loading]);

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
        {
          step: optimizationStep + result.steps_taken,
          cost: result.final_cost,
          energy_cost: result.metrics ? result.metrics.energy_cost : 0,
          active_servers: result.metrics ? result.metrics.active_servers : 0,
          active_chains: result.final_state.active_chains
        }
      ]);
      setOptimizationStep(prev => prev + result.steps_taken);

    } catch (error) {
      console.error("Failed to optimize:", error);
    }
    setLoading(false);
  };

  const handleForceChain = async () => {
    setLoading(true);
    try {
      const result = await forceChain();
      setNetworkData(result.state);
    } catch (error) {
      console.error("Failed to force chain:", error);
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="flex items-center gap-4">
          <h1>Data Center Optimizer</h1>
          {networkData && (
            <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-mono">
              Step: {networkData.step}
            </span>
          )}
        </div>
        <div className="controls">
          <button onClick={handleReset} disabled={loading} className="btn btn-secondary" title="Reset Simulation">
            Reset
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn btn-secondary"
            title={isPlaying ? "Pause Simulation" : "Auto-Run Simulation"}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button onClick={handleOptimize} disabled={loading || isPlaying} className="btn btn-secondary" title="Step Forward">
            Step +5
          </button>

          <button onClick={handleForceChain} disabled={loading} className="btn btn-danger" style={{ backgroundColor: '#ef4444', color: 'white' }} title="Force Traffic Spike">
            Force Spike
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="viz-container">
          {networkData ? (
            <NetworkGraph data={networkData} width={1200} height={800} />
          ) : (
            <div className="loading">Loading Network Topology...</div>
          )}
        </div>

        <div className="metrics-container">
          <MetricsPanel history={metricsHistory} />
        </div>
      </main>
    </div >
  );
}

export default App;
