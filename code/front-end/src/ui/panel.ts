import type { CarId, HazardLevel, SelectionState, TrackId, YardLayout } from '../types';
import { hazardLabel } from '../risk/hazard';

export function renderPanel(
  panel: HTMLElement,
  layout: YardLayout,
  selection: SelectionState,
  fireMode: boolean,
  burningCarId: CarId | null,
): void {
  const { selectedCarId, selectedTrackId } = selection;

  if (!selectedCarId && !selectedTrackId) {
    panel.innerHTML = `
      <h2>Details</h2>
      <div class="kv"><strong>Tip</strong><span>Click a wagon (or track) to see details.</span></div>
      <div class="cars-list" style="margin-top:12px;">
        <strong style="color:#e6eefc;">Fire mode:</strong>
        <span>${fireMode ? 'On' : 'Off'}.</span>
      </div>
    `;
    return;
  }

  if (selectedCarId) {
    const placement = layout.carPlacements[selectedCarId];
    const car = layout.carById[selectedCarId];
    if (!placement || !car) return;

    const trackId = placement.trackId;
    const hazard = placement.hazardLevel;

    const nearbyCarIds = getNearbyCarIdsForCar(layout, selectedCarId);
    const nearbyList = nearbyCarIds
      .map((id) => {
        const p = layout.carPlacements[id];
        const lvl = p ? p.hazardLevel : 0;
        return `${id} (${hazardLabel(lvl)})`;
      })
      .slice(0, 8);

    const isBurning = burningCarId === selectedCarId;

    panel.innerHTML = `
      <h2>${isBurning ? 'On Fire Wagon' : 'Wagon Details'}</h2>
      <div class="kv"><strong>Car ID</strong><span>${selectedCarId}</span></div>
      <div class="kv"><strong>Cargo</strong><span>${car.content ?? 'Unknown / N/A'}</span></div>
      <div class="kv"><strong>Hazard Level</strong><span>${hazardLabel(hazard)} (${hazard})</span></div>
      <div class="kv"><strong>Track</strong><span>${trackId}</span></div>
      <div class="kv"><strong>Position</strong><span>${Math.round(placement.x)}, ${Math.round(
      placement.y,
    )}</span></div>

      <div class="cars-list">
        <strong style="color:#e6eefc;">Nearby wagons</strong>
        <ul>${nearbyList.length ? nearbyList.map((x) => `<li>${x}</li>`).join('') : '<li>None found</li>'}</ul>
      </div>
    `;
    return;
  }

  if (selectedTrackId) {
    const track = layout.tracks[selectedTrackId];
    const carIds = track?.carIds ?? [];
    const dangerousCount = carIds.filter(
      (id) => layout.carPlacements[id]?.hazardLevel >= 2,
    ).length;

    const carsList = carIds
      .map((id) => {
        const p = layout.carPlacements[id];
        const lvl = p ? p.hazardLevel : 0;
        return `<li>${id} - ${hazardLabel(lvl)}</li>`;
      })
      .join('');

    panel.innerHTML = `
      <h2>Track Details</h2>
      <div class="kv"><strong>Track ID</strong><span>${selectedTrackId}</span></div>
      <div class="kv"><strong>Type</strong><span>${track.type}</span></div>
      <div class="kv"><strong>Occupied</strong><span>${track.occupied ? 'Yes' : 'No'}</span></div>
      <div class="kv"><strong>Dangerous wagons</strong><span>${dangerousCount}</span></div>

      <div class="cars-list">
        <strong style="color:#e6eefc;">Wagons</strong>
        <ul>${carIds.length ? carsList : '<li>No cars currently on this track</li>'}</ul>
      </div>
    `;
    return;
  }
}

function getNearbyCarIdsForCar(layout: YardLayout, carId: CarId): CarId[] {
  const placement = layout.carPlacements[carId];
  if (!placement) return [];
  const baseTrackId = placement.trackId;

  const nearbyTrackIds = new Set<TrackId>([baseTrackId, ...layout.trackNeighbors[baseTrackId]]);
  const res: CarId[] = [];
  for (const trackId of nearbyTrackIds) {
    const track = layout.tracks[trackId];
    if (!track) continue;
    for (const id of track.carIds) {
      if (!res.includes(id)) res.push(id);
    }
  }
  return res.filter((id) => id !== carId);
}

