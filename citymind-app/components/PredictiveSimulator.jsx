'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import { CITY_SECTORS } from '@/lib/data';

export default function PredictiveSimulator({ onScheduleWorkOrder }) {
  const [selectedSector, setSelectedSector] = useState('sec-62');
  const [weatherCondition, setWeatherCondition] = useState('Heavy Monsoon (150mm)');
  const [assetAgeYears, setAssetAgeYears] = useState(14);
  const [trafficLoad, setTrafficLoad] = useState('Heavy Truck & EV Fleet');
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [isScheduled, setIsScheduled] = useState(false);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setIsScheduled(false);

    try {
      const res = await fetch('/api/city-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate_future_problem',
          sectorId: selectedSector,
          weatherCondition: weatherCondition,
          assetAgeYears: assetAgeYears,
          trafficLoad: trafficLoad
        })
      });
      const data = await res.json();
      if (data?.simulation) {
        setSimulationResult(data.simulation);
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleScheduleSimulatedOrder = () => {
    if (!simulationResult) return;
    setIsScheduled(true);
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    if (onScheduleWorkOrder) {
      onScheduleWorkOrder({
        id: simulationResult.id,
        sector: simulationResult.sectorName,
        issue: simulationResult.issue,
        probability: simulationResult.probability,
        timeframe: simulationResult.timeframe,
        cost: simulationResult.budget.cost,
        co2: simulationResult.greenImpact.co2Saved
      });
    }
  };

  return (
    <div className="glass-card" style={{ marginTop: '24px' }}>
      <div className="card-header">
        <div className="card-title">🔬 Interactive "What-If" AI Future Problem Simulator</div>
        <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '700', padding: '4px 10px', borderRadius: '6px' }}>
          NEURAL PREDICTIVE MATRIX
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Simulate custom environmental stress factors (weather intensity, asset aging, and vehicle load) to predict future urban infrastructure risks before they occur.
      </p>

      {/* Simulator Inputs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '16px' }}>
        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
            Target Sector
          </label>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            style={{ width: '100%', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-main)' }}
          >
            {CITY_SECTORS.map(sec => (
              <option key={sec.id} value={sec.id}>{sec.name.split(' ')[0]} {sec.name.split(' ')[1]}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
            Weather Forecast
          </label>
          <select
            value={weatherCondition}
            onChange={(e) => setWeatherCondition(e.target.value)}
            style={{ width: '100%', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-main)' }}
          >
            <option value="Heavy Monsoon (150mm)">🌧️ Heavy Monsoon (150mm)</option>
            <option value="Severe Heatwave (42°C)">☀️ Severe Heatwave (42°C)</option>
            <option value="Normal Moderate Weather">🌤️ Normal Weather</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
            Asset Age: <strong>{assetAgeYears} Years</strong>
          </label>
          <input
            type="range"
            min={2}
            max={30}
            value={assetAgeYears}
            onChange={(e) => setAssetAgeYears(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer', marginTop: '6px' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
            Traffic & Strain Load
          </label>
          <select
            value={trafficLoad}
            onChange={(e) => setTrafficLoad(e.target.value)}
            style={{ width: '100%', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-main)' }}
          >
            <option value="Heavy Truck & EV Fleet">🚛 Heavy Truck & EV Fleet</option>
            <option value="Peak Commuter Traffic">🚗 Peak Commuter Traffic</option>
            <option value="Low Commercial Volume">🚲 Low Commercial Volume</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleRunSimulation}
        disabled={isSimulating}
        className="btn-primary"
        style={{ width: '100%', padding: '10px', fontSize: '0.88rem' }}
      >
        {isSimulating ? '🔮 Running AI Neural Simulation...' : '🔮 Run AI Predictive Future Simulation'}
      </button>

      {/* Simulation Result Output Card */}
      {simulationResult && (
        <div style={{ marginTop: '18px', background: 'var(--bg-subtle)', border: '1px solid var(--panel-border)', borderLeft: `5px solid ${simulationResult.probability > 75 ? 'var(--crimson)' : 'var(--amber)'}`, borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>
              🚨 AI Predicted Problem: {simulationResult.issue}
            </h4>
            <span style={{ background: simulationResult.probability > 75 ? 'var(--crimson-light)' : 'var(--amber-light)', color: simulationResult.probability > 75 ? 'var(--crimson)' : 'var(--amber)', fontWeight: '800', fontSize: '0.82rem', padding: '4px 10px', borderRadius: '6px' }}>
              {simulationResult.probability}% FAILURE PROBABILITY
            </span>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            📍 Location: <strong>{simulationResult.sectorName}</strong> | ⏳ Time Window: <strong>{simulationResult.timeframe}</strong>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: 'var(--panel-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--panel-border)', marginBottom: '12px', fontSize: '0.8rem' }}>
            <div>💰 Fix Cost: <strong>{simulationResult.budget.cost}</strong></div>
            <div>🛡️ Saved: <strong>{simulationResult.budget.ROI}</strong></div>
            <div>🌱 Green Impact: <strong>{simulationResult.greenImpact.co2Saved}</strong></div>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--emerald)', fontWeight: '600', marginBottom: '12px' }}>
            🤖 AI Directive: {simulationResult.recommendation}
          </p>

          <button
            onClick={handleScheduleSimulatedOrder}
            disabled={isScheduled}
            className="btn-primary"
            style={{ width: '100%', padding: '8px', fontSize: '0.82rem', background: isScheduled ? '#10b981' : undefined }}
          >
            {isScheduled ? '✓ Proactive Maintenance Scheduled to Prevent Failure' : '⚡ Schedule Preventative Maintenance Work Order Now'}
          </button>
        </div>
      )}
    </div>
  );
}
