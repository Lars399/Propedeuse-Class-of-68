import React from 'react';
import { Map, Marker, Popup } from 'react-leaflet';

const FireHazardUI = ({ hazards }) => {
  return (
    <Map center={[51.505, -0.09]} zoom={13} style={{ height: '100vh', width: '100%' }}>
      {hazards.map((hazard, index) => (
        <Marker key={index} position={hazard.position}>
          <Popup>
            <div>
              <h2>Fire Hazard</h2>
              <p>{hazard.description}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </Map>
  );
};

export default FireHazardUI;
