import type { CarId, FireHighlights, TrackId, YardLayout } from '../types';
import type { SelectionState } from '../types';

export function computeFireHighlights(
  layout: YardLayout,
  fireMode: boolean,
  burningCarId: CarId | null,
): FireHighlights {
  if (!fireMode || !burningCarId) {
    return {
      burningCarId: null,
      nearbyCarIds: new Set<CarId>(),
      possiblyDangerousCarIds: new Set<CarId>(),
      nearbyTrackIds: new Set<TrackId>(),
    };
  }

  const burningPlacement = layout.carPlacements[burningCarId];
  if (!burningPlacement) {
    return {
      burningCarId: null,
      nearbyCarIds: new Set<CarId>(),
      possiblyDangerousCarIds: new Set<CarId>(),
      nearbyTrackIds: new Set<TrackId>(),
    };
  }

  const burningTrackId = burningPlacement.trackId;
  const nearbyTrackIds = new Set<TrackId>([burningTrackId, ...layout.trackNeighbors[burningTrackId]]);

  const nearbyCarIds = new Set<CarId>();
  for (const trackId of nearbyTrackIds) {
    const t = layout.tracks[trackId];
    for (const id of t.carIds) nearbyCarIds.add(id);
  }

  const possiblyDangerousCarIds = new Set<CarId>();
  for (const id of nearbyCarIds) {
    if (id === burningCarId) continue;
    const hazardLevel = layout.carPlacements[id]?.hazardLevel ?? 0;
    if (hazardLevel >= 2) possiblyDangerousCarIds.add(id);
  }

  return {
    burningCarId,
    nearbyCarIds,
    possiblyDangerousCarIds,
    nearbyTrackIds,
  };
}

export function attachSvgClickHandling(opts: {
  svg: SVGSVGElement;
  onCarClick: (carId: CarId) => void;
  onTrackClick: (trackId: TrackId) => void;
}): void {
  const { svg, onCarClick, onTrackClick } = opts;

  svg.addEventListener('click', (ev) => {
    const target = ev.target as Element | null;
    if (!target) return;

    const carEl = target.closest('g[data-car-id]') as SVGGElement | null;
    if (carEl) {
      const carId = carEl.getAttribute('data-car-id');
      if (carId) onCarClick(carId);
      return;
    }

    const trackEl = target.closest('line[data-track-id]') as SVGLineElement | null;
    if (trackEl) {
      const trackId = trackEl.getAttribute('data-track-id');
      if (trackId) onTrackClick(trackId);
      return;
    }
  });
}

export function setSelectionForCar(selection: SelectionState, carId: CarId): SelectionState {
  return { ...selection, selectedCarId: carId, selectedTrackId: null };
}

export function setSelectionForTrack(selection: SelectionState, trackId: TrackId): SelectionState {
  return { ...selection, selectedCarId: null, selectedTrackId: trackId };
}

