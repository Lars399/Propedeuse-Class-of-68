import type {
  CarId,
  CarJson,
  HazardLevel,
  PointsJsonItem,
  Position,
  TrackId,
  YardConnectorJson,
  YardJson,
  StateJsonBase,
  YardLayout,
  ConnectorId,
  CarPlacement,
} from '../types';
import { hazardLevelForCar } from '../risk/hazard';
import type { LoadedMvpData } from '../data/loaders';

function normalizeVec(dx: number, dy: number): { ux: number; uy: number; len: number } {
  const len = Math.hypot(dx, dy);
  if (len === 0) return { ux: 0, uy: 0, len: 0 };
  return { ux: dx / len, uy: dy / len, len };
}

function angleDeg(dx: number, dy: number): number {
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

function getVirtualConnectorPosition(from: Position, to: Position, missing: 'from' | 'to'): Position {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const { ux, uy, len } = normalizeVec(dx, dy);

  // If the segment is degenerate, fall back to a fixed offset.
  const ox = len === 0 ? 40 : ux * 40;
  const oy = len === 0 ? 0 : uy * 40;

  return missing === 'from'
    ? { x: from.x - ox, y: from.y - oy }
    : { x: to.x + ox, y: to.y + oy };
}

function findFirst<T>(arr: T[] | undefined | null): T | undefined {
  if (!arr || arr.length === 0) return undefined;
  return arr[0];
}

export function buildLayout(data: LoadedMvpData): YardLayout {
  const { yard, points, cars, stateAdvanced } = data;

  const pointsById: Record<ConnectorId, PointsJsonItem> = {};
  for (const p of points) pointsById[p.id] = p;

  const connectors: YardLayout['connectors'] = {};

  // Real connectors come from `yard.json` + positions from `points.json`.
  for (const c of yard.connectors) {
    const pos = pointsById[c.id] ?? { id: c.id, x: 0, y: 0 };
    connectors[c.id] = {
      id: c.id,
      position: { x: pos.x, y: pos.y },
      incomingTracks: c.incoming_tracks,
      outgoingTracks: c.outgoing_tracks,
    };
  }

  const carById: YardLayout['carById'] = {};
  for (const car of cars) carById[car.id] = car;

  const occupancyByTrack: Record<TrackId, CarId[]> = {};
  for (const t of stateAdvanced.tracks) occupancyByTrack[t.id] = t.cars;

  // Helper to infer endpoints for each track from connectors adjacency.
  function inferTrackEndpoints(trackId: TrackId): { from: ConnectorId; to: ConnectorId } {
    const fromCandidates = yard.connectors
      .filter((c: YardConnectorJson) => c.outgoing_tracks.includes(trackId))
      .map((c) => c.id);
    const toCandidates = yard.connectors
      .filter((c: YardConnectorJson) => c.incoming_tracks.includes(trackId))
      .map((c) => c.id);

    const from = findFirst(fromCandidates);
    const to = findFirst(toCandidates);

    if (from && to) return { from, to };

    // For a hackathon MVP: create virtual endpoints when missing.
    if (!from && to) {
      const toPos = connectors[to]?.position ?? { x: 0, y: 0 };
      const virtualId = `__entry_${trackId}`;
      connectors[virtualId] = {
        id: virtualId,
        // Place the entry node slightly to the left of the first real connector.
        // This keeps the SVG bounds reasonable for the hackathon MVP.
        position: { x: toPos.x - 40, y: toPos.y },
        incomingTracks: [],
        outgoingTracks: [trackId],
      };
      return { from: virtualId, to };
    }

    if (from && !to) {
      const fromPos = connectors[from]?.position ?? { x: 0, y: 0 };
      const virtualId = `__exit_${trackId}`;
      connectors[virtualId] = {
        id: virtualId,
        // Place the exit node slightly to the right of the last real connector.
        position: { x: fromPos.x + 40, y: fromPos.y },
        incomingTracks: [trackId],
        outgoingTracks: [],
      };
      return { from, to: virtualId };
    }

    // If everything is missing (shouldn't happen with provided data) fall back.
    const virtualFrom = `__entry_${trackId}`;
    const virtualTo = `__exit_${trackId}`;
    connectors[virtualFrom] = {
      id: virtualFrom,
      position: { x: 50, y: 50 },
      incomingTracks: [],
      outgoingTracks: [trackId],
    };
    connectors[virtualTo] = {
      id: virtualTo,
      position: { x: 250, y: 50 },
      incomingTracks: [trackId],
      outgoingTracks: [],
    };
    return { from: virtualFrom, to: virtualTo };
  }

  const tracks: YardLayout['tracks'] = {};
  const carPlacements: YardLayout['carPlacements'] = {} as Record<CarId, CarPlacement>;

  // Build render geometry for each track, and then compute car positions along it.
  for (const t of yard.tracks) {
    const { from, to } = inferTrackEndpoints(t.id);

    const fromPos = connectors[from].position;
    const toPos = connectors[to].position;

    const { ux, uy, len } = normalizeVec(toPos.x - fromPos.x, toPos.y - fromPos.y);
    const angle = angleDeg(toPos.x - fromPos.x, toPos.y - fromPos.y);
    const px = -uy; // perpendicular unit
    const py = ux;

    const padding = 14;
    const usableLen = Math.max(0, len - padding * 2);

    const start: Position = { x: fromPos.x + ux * padding, y: fromPos.y + uy * padding };
    const end: Position = { x: toPos.x - ux * padding, y: toPos.y - uy * padding };

    const carIds = occupancyByTrack[t.id] ?? [];

    tracks[t.id] = {
      id: t.id,
      from,
      to,
      type: t.type,
      occupied: carIds.length > 0,
      carIds,
      start,
      end,
    };

    if (carIds.length === 0) continue;

    for (let i = 0; i < carIds.length; i++) {
      const carId = carIds[i];
      const carMeta = carById[carId];
      const hazardLevel: HazardLevel = carMeta ? hazardLevelForCar(carMeta) : 0;

      // Evenly distribute cars along the segment.
      const spacing = usableLen / (carIds.length + 1);
      const along = spacing * (i + 1);
      const baseX = start.x + ux * along;
      const baseY = start.y + uy * along;

      // Spread a little perpendicular so multiple cars remain visible/clickable.
      const sideways = (i - (carIds.length - 1) / 2) * 8;
      const x = baseX + px * sideways;
      const y = baseY + py * sideways;

      carPlacements[carId] = {
        carId,
        trackId: t.id,
        x,
        y,
        rotationDeg: angle,
        hazardLevel,
      };
    }
  }

  // Track adjacency for simple "nearby" mode.
  const trackNeighbors: YardLayout['trackNeighbors'] = {} as Record<TrackId, TrackId[]>;
  const trackIds = Object.keys(tracks) as TrackId[];

  for (const id of trackIds) {
    const t = tracks[id];
    const connectorsUsed = new Set<ConnectorId>([t.from, t.to]);
    const neighbors: TrackId[] = [];

    for (const otherId of trackIds) {
      if (otherId === id) continue;
      const other = tracks[otherId];
      const otherConnectorsUsed = new Set<ConnectorId>([other.from, other.to]);
      let shares = false;
      for (const c of otherConnectorsUsed) {
        if (connectorsUsed.has(c)) {
          shares = true;
          break;
        }
      }
      if (shares) neighbors.push(otherId);
    }

    trackNeighbors[id] = neighbors;
  }

  return {
    name: yard.name,
    connectors,
    tracks,
    carById,
    carPlacements,
    trackNeighbors,
  };
}

