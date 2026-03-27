import type { CarId, TrackId, YardLayout, MovingCar, CarPlacement } from '../types';

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function createMovingCars(layout: YardLayout, count: number = 3): Record<CarId, MovingCar> {
  const moving: Record<CarId, MovingCar> = {};
  const cars = Object.keys(layout.carPlacements) as CarId[];
  
  if (cars.length === 0) return moving;

  // Pick up to `count` random cars that are currently placed.
  const shuffled = [...cars].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  for (const carId of selected) {
    const placement = layout.carPlacements[carId];
    if (placement) {
      moving[carId] = {
        carId,
        currentTrackId: placement.trackId,
        progress: 0.5, // Start roughly in the middle for simplicity
        direction: Math.random() > 0.5 ? 1 : -1,
        speed: 0.2 + Math.random() * 0.2, // Base speed + some variance
      };
    }
  }

  return moving;
}

export function tickMovingCars(
  layout: YardLayout,
  movingCars: Record<CarId, MovingCar>,
  dt: number
): void {
  for (const carId in movingCars) {
    const car = movingCars[carId];
    const track = layout.tracks[car.currentTrackId];
    if (!track) continue; // Track vanished?

    car.progress += car.direction * car.speed * dt;

    // Check if we reached the end or the beginning of the track
    if (car.progress >= 1.0) {
      // Reached 'to' connector
      transitionToNextTrack(layout, car, track.to, track.id);
    } else if (car.progress <= 0.0) {
      // Reached 'from' connector
      transitionToNextTrack(layout, car, track.from, track.id);
    }
  }
}

function transitionToNextTrack(
  layout: YardLayout,
  car: MovingCar,
  connectorId: string,
  fromTrackId: TrackId
): void {
  const connector = layout.connectors[connectorId];
  if (!connector) {
    // Reverse direction if connector not found
    car.direction *= -1;
    car.progress = car.progress >= 1.0 ? 1.0 : 0.0;
    return;
  }

  const possibleTracks = [
    ...connector.incomingTracks,
    ...connector.outgoingTracks,
  ].filter((t) => t !== fromTrackId);

  // If no other tracks, bounce back
  if (possibleTracks.length === 0) {
    car.direction *= -1;
    car.progress = car.progress >= 1.0 ? 1.0 : 0.0;
    return;
  }

  // Pick a random next track
  const nextTrackId = getRandomItem(possibleTracks);
  const nextTrack = layout.tracks[nextTrackId];
  if (!nextTrack) {
    car.direction *= -1;
    car.progress = car.progress >= 1.0 ? 1.0 : 0.0;
    return;
  }

  // Set new state
  car.currentTrackId = nextTrackId;

  // Determine progress and direction on the new track based on how we enter it
  // If we came from connectorId and the new track's 'from' is connectorId:
  // we start at progress 0 and move forward (direction 1).
  if (nextTrack.from === connectorId) {
    car.progress = 0;
    car.direction = 1;
  } else {
    // We enter from the 'to' connector
    car.progress = 1;
    car.direction = -1;
  }
}

export function applyAnimationToPlacements(
  layout: YardLayout,
  movingCars: Record<CarId, MovingCar>
): Record<CarId, CarPlacement> {
  // Create a copy so we do not mutate the base layout
  const newPlacements = { ...layout.carPlacements };

  for (const carId in movingCars) {
    const car = movingCars[carId];
    const track = layout.tracks[car.currentTrackId];
    const basePlacement = layout.carPlacements[carId];

    if (!track || !basePlacement) continue;

    const dx = track.end.x - track.start.x;
    const dy = track.end.y - track.start.y;
    
    // Calculate new position
    const x = track.start.x + dx * car.progress;
    const y = track.start.y + dy * car.progress;
    
    // Angle in degrees
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    newPlacements[carId] = {
      ...basePlacement,
      trackId: car.currentTrackId,
      x,
      y,
      rotationDeg: angle,
    };
  }

  return newPlacements;
}
