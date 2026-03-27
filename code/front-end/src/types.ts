export type ConnectorId = string;
export type TrackId = string;
export type CarId = string;

export type HazardLevel = 0 | 1 | 2 | 3; // 0 safe .. 3 dangerous

export interface Position {
  x: number;
  y: number;
}

// --- Raw JSON shapes (from /data/*.json) ---

export interface YardSensor {
  id: string;
  type: string;
}

export interface YardTrackJson {
  id: TrackId;
  incoming_axle_counter: string;
  outgoing_axle_counter: string;
  type: string;
  camera: string | null;
}

export interface YardConnectorJson {
  id: ConnectorId;
  incoming_tracks: TrackId[];
  outgoing_tracks: TrackId[];
  sensor: string | null;
  type: string;
}

export interface YardJson {
  name: string;
  sensors: YardSensor[];
  tracks: YardTrackJson[];
  connectors: YardConnectorJson[];
}

export interface PointsJsonItem {
  id: ConnectorId;
  x: number;
  y: number;
}

export interface CarJson {
  id: CarId;
  type: string;
  content: string | null;
  adr: string | null;
}

export interface StateTrackJson {
  id: TrackId;
  axles: number;
  cars: CarId[];
}

export interface StateJsonBase {
  yard: string;
  tracks: StateTrackJson[];
  switches: Array<{ id: string; state: string }>;
}

// --- Render/build model ---

export interface ConnectorNode {
  id: ConnectorId;
  position: Position;
  incomingTracks: TrackId[];
  outgoingTracks: TrackId[];
}

export interface TrackRender {
  id: TrackId;
  from: ConnectorId;
  to: ConnectorId;
  type: string;
  occupied: boolean;
  carIds: CarId[];

  start: Position;
  end: Position;
}

export interface CarPlacement {
  carId: CarId;
  trackId: TrackId;
  x: number;
  y: number;
  rotationDeg: number;
  hazardLevel: HazardLevel; // computed later, kept here for convenience
}

export interface FireHighlights {
  burningCarId: CarId | null;
  nearbyCarIds: Set<CarId>;
  possiblyDangerousCarIds: Set<CarId>;
  nearbyTrackIds: Set<TrackId>;
}

export interface SelectionState {
  selectedCarId: CarId | null;
  selectedTrackId: TrackId | null;
}

export interface HazardVisibility {
  safe: boolean;
  caution: boolean;
  danger: boolean;
  dangerous: boolean;
  onFire: boolean;
}

export interface MovingCar {
  carId: CarId;
  currentTrackId: TrackId;
  progress: number; // 0.0 to 1.0 along the track
  direction: 1 | -1; // 1 = start to end, -1 = end to start
  speed: number; // units of progress per second
  paused?: boolean; // hier toegevoegd
}

export interface YardLayout {
  name: string;
  connectors: Record<ConnectorId, ConnectorNode>;
  tracks: Record<TrackId, TrackRender>;
  carById: Record<CarId, CarJson>;
  // Computed positions for occupied cars.
  carPlacements: Record<CarId, CarPlacement>;
  // Simple adjacency between tracks for "nearby" logic.
  trackNeighbors: Record<TrackId, TrackId[]>;
}

