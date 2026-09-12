'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CITY_SECTORS, PREDICTIVE_HAZARDS } from '@/lib/data';

export default function DigitalTwinMap({ selectedSectorId, onSectorSelect, userReports = [], onApproveDispatch, isSimulationMode }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const sectorsGroupRef = useRef(null);
  const hazardsGroupRef = useRef(null);
  const reportsGroupRef = useRef(null);
  const heatmapGroupRef = useRef(null);

  // Map layer toggle states
  const [showSectors, setShowSectors] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Sync simulation mode with Heatmap state if requested
  useEffect(() => {
    if (isSimulationMode) {
      setShowHeatmap(true);
    }
  }, [isSimulationMode]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize Leaflet map instance
    const map = L.map(mapRef.current, {
      center: [28.5800, 77.3300],
      zoom: 12,
      zoomControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CityMind AI 2.0 | Digital Twin Engine',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    sectorsGroupRef.current = L.layerGroup().addTo(map);
    heatmapGroupRef.current = L.layerGroup().addTo(map);
    hazardsGroupRef.current = L.layerGroup().addTo(map);
    reportsGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    renderMapLayers();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Re-render markers when layer toggles or userReports update
  useEffect(() => {
    renderMapLayers();
  }, [showSectors, showHazards, showReports, showHeatmap, userReports, isSimulationMode]);

  // Fly to sector when selectedSectorId changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const sec = CITY_SECTORS.find(s => s.id === selectedSectorId);
    if (sec) {
      mapInstanceRef.current.flyTo(sec.coordinates, 13, { duration: 1.2 });
    }
  }, [selectedSectorId]);

  function renderMapLayers() {
    if (!mapInstanceRef.current) return;

    // 1. Render Sector Polygon Layer
    if (sectorsGroupRef.current) {
      sectorsGroupRef.current.clearLayers();
      if (showSectors) {
        CITY_SECTORS.forEach(sec => {
          let status = sec.status;
          let healthScore = sec.healthScore;

          // Simulation Mode overrides Sector 18
          if (isSimulationMode && sec.id === 'sec-18') {
            status = 'high-risk';
            healthScore = 20;
          }

          const color = status === 'healthy' ? '#10b981' : status === 'moderate' ? '#f59e0b' : '#ef4444';

          if (sec.polygonCoords) {
            const polygon = L.polygon(sec.polygonCoords, {
              color: color,
              weight: 2,
              fillColor: color,
              fillOpacity: 0.15,
            }).addTo(sectorsGroupRef.current);

            polygon.bindTooltip(`<b>${sec.name}</b><br/>Health Score: ${healthScore}/100`, {
              permanent: false,
              direction: 'top'
            });

            polygon.on('click', () => {
              if (onSectorSelect) onSectorSelect(sec.id);
            });
          }
        });
      }
    }

    // 2. Render Heatmap Layer
    if (heatmapGroupRef.current) {
      heatmapGroupRef.current.clearLayers();
      if (showHeatmap) {
        PREDICTIVE_HAZARDS.forEach(haz => {
          let latLng = [28.6280, 77.3649];
          if (haz.id === 'pred-102') latLng = [28.5708, 77.3261];
          if (haz.id === 'pred-103') latLng = [28.5912, 77.3190];

          let probability = haz.probability;
          if (isSimulationMode && haz.id === 'pred-102') {
            probability = 98; // Max probability for storm mode
          }

          // Red gradient circle
          L.circle(latLng, {
            color: 'transparent',
            fillColor: '#dc2626',
            fillOpacity: probability / 100 * 0.8, // Dynamic opacity based on probability
            radius: probability * 35 // Larger radius for higher probability
          }).addTo(heatmapGroupRef.current);
        });
      }
    }

    // 3. Render Predictive Hazards Layer
    if (hazardsGroupRef.current) {
      hazardsGroupRef.current.clearLayers();
      if (showHazards) {
        PREDICTIVE_HAZARDS.forEach(haz => {
          let latLng = [28.6280, 77.3649];
          if (haz.id === 'pred-102') latLng = [28.5708, 77.3261];
          if (haz.id === 'pred-103') latLng = [28.5912, 77.3190];

          let probability = haz.probability;
          if (isSimulationMode && haz.id === 'pred-102') {
            probability = 98; 
          }

          const hazardIcon = L.divIcon({
            className: 'custom-hazard-pin',
            html: `<div class="pulse-marker red-pulse"><div class="inner-dot"></div></div>`,
            iconSize: [24, 24]
          });

          const marker = L.marker(latLng, { icon: hazardIcon }).addTo(hazardsGroupRef.current);

          marker.bindPopup(`
            <div style="font-family: sans-serif; padding: 4px; max-width: 220px;">
              <span style="background: #fee2e2; color: #dc2626; font-weight: 700; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px;">
                PREDICTED RISK (${probability}%)
              </span>
              <h4 style="font-size: 0.88rem; font-weight: 700; margin: 6px 0 2px 0;">${haz.issue}</h4>
              <p style="font-size: 0.75rem; color: #64748b; margin-bottom: 6px;">${haz.sector}</p>
              <div style="font-size: 0.75rem; background: #f1f5fe; padding: 6px; border-radius: 6px;">
                Cost: <strong>${haz.budget.cost}</strong> | Window: <strong>${haz.timeframe}</strong>
              </div>
            </div>
          `);
        });
      }
    }

    // 4. Render Live Citizen Reports Layer
    if (reportsGroupRef.current) {
      reportsGroupRef.current.clearLayers();
      if (showReports && userReports.length > 0) {
        userReports.forEach(rep => {
          let coords = [28.6280 + (Math.random() - 0.5) * 0.02, 77.3649 + (Math.random() - 0.5) * 0.02];
          if (rep.location && rep.location.includes('28.')) {
            const match = rep.location.match(/\(([^)]+)\)/);
            if (match) {
              const parts = match[1].split(',');
              if (parts.length === 2) {
                coords = [parseFloat(parts[0]), parseFloat(parts[1])];
              }
            }
          }

          const reportIcon = L.divIcon({
            className: 'custom-report-pin',
            html: `<div style="background: #6366f1; color: #fff; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 2px solid #fff;">📸</div>`,
            iconSize: [22, 22]
          });

          const marker = L.marker(coords, { icon: reportIcon }).addTo(reportsGroupRef.current);
          marker.bindPopup(`
            <div style="font-family: sans-serif; padding: 4px; max-width: 210px;">
              <span style="background: #ede9fe; color: #6366f1; font-weight: 700; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px;">
                ${rep.id} - ${rep.status}
              </span>
              <h4 style="font-size: 0.85rem; font-weight: 700; margin: 6px 0 2px 0;">${rep.category}</h4>
              <p style="font-size: 0.74rem; color: #64748b; margin-bottom: 4px;">Reporter: ${rep.user}</p>
              <div style="font-size: 0.72rem; color: #059669; font-weight: 600;">Verified Priority: ${rep.priorityScore}/100</div>
            </div>
          `);
        });
      }
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Layer Toggle Floating Overlay Controls */}
      <div style={{
        position: 'absolute',
        top: '14px',
        right: '14px',
        zIndex: 400,
        background: '#FFFFFF',
        border: '1px solid var(--border-cream)',
        padding: '8px 16px',
        borderRadius: '999px',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        gap: '14px',
        fontSize: '0.78rem',
        fontWeight: '600'
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: 'var(--forest-800)' }}>
          <input type="checkbox" checked={showSectors} onChange={(e) => setShowSectors(e.target.checked)} />
          🟢 Sectors
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: 'var(--crimson)' }}>
          <input type="checkbox" checked={showHazards} onChange={(e) => setShowHazards(e.target.checked)} />
          📍 Risk Pins
        </label>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#B91C1C' }}>
          <input type="checkbox" checked={showHeatmap} onChange={(e) => setShowHeatmap(e.target.checked)} />
          🔥 Heatmap
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: 'var(--sage-500)' }}>
          <input type="checkbox" checked={showReports} onChange={(e) => setShowReports(e.target.checked)} />
          📸 Citizen Reports
        </label>
      </div>

      <div ref={mapRef} id="digital-twin-map" />
    </div>
  );
}
