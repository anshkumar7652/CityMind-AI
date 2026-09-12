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
    <div className="editorial-card" style={{ marginTop: '24px' }}>
      <div className="card-header">
        <div className="card-title" style={{ fontSize: '1.25rem' }}>Interactive Infrastructure Risk Simulator</div>
        <span style={{ background: 'var(--forest-100)', color: 'var(--forest-800)', fontSize: '0.72rem', fontWeight: '700', padding: '4px 10px', borderRadius: '999px' }}>
          NEURAL MATRIX
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: '1.5' }}>
        Simulate custom environmental stress factors (weather intensity, asset aging, and vehicle load) to predict future urban infrastructure risks before they occur.
      </p>

      {/* Simulator Inputs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '18px' }}>
        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
            Target Sector
          </label>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-cream-alt)', border: '1px solid var(--border-cream)', padding: '9px 10px', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-dark)' }}
          >
            {CITY_SECTORS.map(sec => (
              <option key={sec.id} value={sec.id}>{sec.name.split(' ')[0]} {sec.name.split(' ')[1]}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
            Weather Forecast
          </label>
          <select
            value={weatherCondition}
            onChange={(e) => setWeatherCondition(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-cream-alt)', border: '1px solid var(--border-cream)', padding: '9px 10px', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-dark)' }}
          >
            <option value="Heavy Monsoon (150mm)">🌧️ Heavy Monsoon (150mm)</option>
            <option value="Severe Heatwave (42°C)">☀️ Severe Heatwave (42°C)</option>
            <option value="Normal Moderate Weather">🌤️ Normal Weather</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
            Asset Age: <strong style={{ color: 'var(--forest-800)' }}>{assetAgeYears} Years</strong>
          </label>
          <input
            type="range"
            min={2}
            max={30}
            value={assetAgeYears}
            onChange={(e) => setAssetAgeYears(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--forest-800)', cursor: 'pointer', marginTop: '8px' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
            Traffic & Strain Load
          </label>
          <select
            value={trafficLoad}
            onChange={(e) => setTrafficLoad(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-cream-alt)', border: '1px solid var(--border-cream)', padding: '9px 10px', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-dark)' }}
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
        style={{ width: '100%', padding: '11px', fontSize: '0.86rem' }}
      >
        {isSimulating ? 'Running Neural Forecast Model...' : '🔮 Run Predictive Simulation Model'}
      </button>

      {/* Simulation Result Output Card */}
      {simulationResult && (
        <div style={{ marginTop: '20px', background: 'var(--bg-cream-alt)', border: '1px solid var(--border-cream)', borderLeft: `4px solid ${simulationResult.probability > 75 ? 'var(--crimson)' : 'var(--amber)'}`, borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-dark)', margin: 0 }}>
              Forecasted Issue: {simulationResult.issue}
            </h4>
            <span style={{ 
              background: simulationResult.probability > 75 ? '#FEE2E2' : '#FEF3C7', 
              color: simulationResult.probability > 75 ? 'var(--crimson)' : '#92400E', 
              fontWeight: '700', 
              fontSize: '0.78rem', 
              padding: '4px 10px', 
              borderRadius: '999px' 
            }}>
              {simulationResult.probability}% FAILURE PROBABILITY
            </span>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            📍 Location: <strong style={{ color: 'var(--text-dark)' }}>{simulationResult.sectorName}</strong> | ⏳ Time Window: <strong style={{ color: 'var(--text-dark)' }}>{simulationResult.timeframe}</strong>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-cream)', marginBottom: '14px', fontSize: '0.82rem' }}>
            <div>Est Cost: <strong style={{ color: 'var(--text-dark)' }}>{simulationResult.budget.cost}</strong></div>
            <div>Prevented Damage: <strong style={{ color: 'var(--forest-700)' }}>{simulationResult.budget.ROI}</strong></div>
            <div>CO₂ Offset: <strong style={{ color: 'var(--forest-700)' }}>{simulationResult.greenImpact.co2Saved}</strong></div>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--forest-800)', fontWeight: '600', marginBottom: '14px' }}>
            Directive: {simulationResult.recommendation}
          </p>

          <button
            onClick={handleScheduleSimulatedOrder}
            disabled={isScheduled}
            className="btn-primary"
            style={{ width: '100%', padding: '9px', fontSize: '0.82rem', background: isScheduled ? 'var(--forest-700)' : undefined }}
          >
            {isScheduled ? '✓ Preventative Maintenance Scheduled' : '⚡ Schedule Preventative Work Order Now'}
          </button>
        </div>
      )}
    </div>
  );
}
