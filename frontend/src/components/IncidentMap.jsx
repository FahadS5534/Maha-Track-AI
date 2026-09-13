import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, AlertCircle, Shield, Clock } from 'lucide-react';

// Custom Leaflet marker icons using colored SVG data URLs
const createCustomMarkerIcon = (priority, status) => {
  let color = '#2D6A4F'; // Emerald (Low priority / resolved)
  if (status === 'resolved') {
    color = '#10B981';
  } else if (priority >= 75) {
    color = '#B91C1C'; // Red (High priority)
  } else if (priority >= 45) {
    color = '#D97706'; // Amber (Medium priority)
  }

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 24 30">
      <path fill="${color}" stroke="#FFFFFF" stroke-width="1.5" d="M12 0C5.37 0 0 5.37 0 12c0 9 12 18 12 18s12-9 12-18C24 5.37 18.63 0 12 0z"/>
      <circle cx="12" cy="10" r="4" fill="#FFFFFF"/>
    </svg>
  `;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: svgString,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -32]
  });
};

function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
}

export default function IncidentMap({ complaints, selectedComplaint, onSelectComplaint }) {
  // Center near Prayagraj Sangam Mahakumbh area
  const defaultCenter = [25.4350, 81.8850];

  return (
    <div className="w-full h-[420px] rounded-2xl overflow-hidden border border-brand-border shadow-xs relative bg-white">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {selectedComplaint && selectedComplaint.lat && selectedComplaint.lng && (
          <ChangeMapView center={[selectedComplaint.lat, selectedComplaint.lng]} />
        )}

        {complaints && complaints.map(c => {
          if (!c.lat || !c.lng) return null;
          const icon = createCustomMarkerIcon(c.priority_score, c.status);
          return (
            <Marker
              key={c.id}
              position={[c.lat, c.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectComplaint && onSelectComplaint(c)
              }}
            >
              <Popup>
                <div className="p-1 max-w-xs space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-brand-border pb-1.5">
                    <span className="font-bold text-brand-dark uppercase tracking-wider text-[10px] bg-brand-muted px-1.5 py-0.5 rounded">
                      {c.zone}
                    </span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      c.priority_score >= 75 ? 'bg-red-100 text-red-800' :
                      c.priority_score >= 45 ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      Priority: {c.priority_score}
                    </span>
                  </div>

                  <p className="font-semibold text-brand-dark line-clamp-2">"{c.raw_text}"</p>

                  <div className="flex justify-between text-[11px] text-brand-stone">
                    <span>Dept: <strong>{c.department}</strong></span>
                    <span className="capitalize font-bold text-brand-dark">{c.status}</span>
                  </div>

                  {onSelectComplaint && (
                    <button
                      onClick={() => onSelectComplaint(c)}
                      className="w-full mt-1 bg-brand-dark hover:bg-black text-white text-[11px] font-bold py-1 px-2 rounded-lg transition-all"
                    >
                      View in Queue
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend overlay */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-brand-border shadow-xs text-[11px] space-y-1">
        <div className="font-bold text-brand-dark mb-1">Incident Priority Legend</div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-700 inline-block"></span>
          <span className="text-brand-stone">High Priority (75+)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span>
          <span className="text-brand-stone">Medium Priority (45-74)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
          <span className="text-brand-stone">Standard / Resolved (&lt;45)</span>
        </div>
      </div>
    </div>
  );
}
