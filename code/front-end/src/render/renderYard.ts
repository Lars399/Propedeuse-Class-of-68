import type {
  CarId,
  HazardLevel,
  TrackId,
  YardLayout,
  FireHighlights,
  SelectionState,
  HazardVisibility,
} from '../types';
import { hazardSwatch, hazardLabel } from '../risk/hazard';

function createSvgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
): SVGElementTagNameMap[K] {
  return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

function colorForCar(
  carHazard: HazardLevel,
  fire: FireHighlights,
  carId: CarId,
): { stroke: string; fill: string; glow: boolean } {
  if (fire.burningCarId === carId) {
    return { stroke: '#ff2d2d', fill: 'rgba(255, 45, 45, 0.65)', glow: true };
  }
  if (fire.possiblyDangerousCarIds.has(carId)) {
    // Make hazardous nearby cargo stand out.
    const sw = hazardSwatch(2);
    return { stroke: sw.stroke, fill: sw.fill, glow: false };
  }
  if (fire.nearbyCarIds.has(carId)) {
    const sw = hazardSwatch(carHazard);
    return { stroke: sw.stroke, fill: sw.fill, glow: false };
  }

  const sw = hazardSwatch(carHazard);
  return { stroke: sw.stroke, fill: sw.fill, glow: false };
}

function categoryForHazardLevel(level: HazardLevel): 'safe' | 'caution' | 'danger' | 'dangerous' {
  if (level === 0) return 'safe';
  if (level === 1) return 'caution';
  if (level === 2) return 'danger';
  return 'dangerous';
}

function isCarVisible(
  layout: YardLayout,
  carId: CarId,
  fire: FireHighlights,
  hazardVisibility: HazardVisibility,
): boolean {
  const placement = layout.carPlacements[carId];
  if (!placement) return false;

  const burning = fire.burningCarId === carId;
  if (burning) return hazardVisibility.onFire;

  const cat = categoryForHazardLevel(placement.hazardLevel);
  if (cat === 'safe') return hazardVisibility.safe;
  if (cat === 'caution') return hazardVisibility.caution;
  if (cat === 'danger') return hazardVisibility.danger;
  return hazardVisibility.dangerous;
}

function anyVisibleDangerousOnTrack(
  layout: YardLayout,
  trackId: TrackId,
  fire: FireHighlights,
  hazardVisibility: HazardVisibility,
): boolean {
  const t = layout.tracks[trackId];
  if (!t?.carIds?.length) return false;

  return t.carIds.some((carId) => {
    const placement = layout.carPlacements[carId];
    if (!placement) return false;
    if (!isCarVisible(layout, carId, fire, hazardVisibility)) return false;
    return placement.hazardLevel >= 2;
  });
}

export function renderYard(
  svg: SVGSVGElement,
  layout: YardLayout,
  selection: SelectionState,
  fireHighlights: FireHighlights,
  hazardVisibility: HazardVisibility,
  movingCarIds: Set<CarId> = new Set(),
): void {
  // Clear previous content.
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  // Layout scaling: fit to connector bounding box.
  const xs = Object.values(layout.connectors).map((c) => c.position.x);
  const ys = Object.values(layout.connectors).map((c) => c.position.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const margin = 80;

  const width = Math.max(1, maxX - minX + margin * 2);
  const height = Math.max(1, maxY - minY + margin * 2);
  svg.setAttribute('viewBox', `${minX - margin} ${minY - margin} ${width} ${height}`);

  // Background grid-ish.
  const bg = createSvgEl('rect');
  bg.setAttribute('x', `${minX - margin}`);
  bg.setAttribute('y', `${minY - margin}`);
  bg.setAttribute('width', `${width}`);
  bg.setAttribute('height', `${height}`);
  bg.setAttribute('fill', '#070b16');
  svg.appendChild(bg);

  // Track lines (clickable).
  const trackLayer = createSvgEl('g');
  for (const trackId of Object.keys(layout.tracks) as TrackId[]) {
    const track = layout.tracks[trackId];
    const danger = anyVisibleDangerousOnTrack(layout, trackId, fireHighlights, hazardVisibility);

    const line = createSvgEl('line');
    line.setAttribute('x1', String(track.start.x));
    line.setAttribute('y1', String(track.start.y));
    line.setAttribute('x2', String(track.end.x));
    line.setAttribute('y2', String(track.end.y));

    const occupied = track.occupied;
    const isHighlighted = fireHighlights.nearbyTrackIds.has(trackId);
    const isSelected = selection.selectedTrackId === trackId;

    let stroke = occupied ? '#dbe7ff' : 'rgba(160, 180, 220, 0.35)';
    let width = occupied ? 5 : 3;
    let opacity = 1;

    if (danger) stroke = '#e67e22';
    if (isHighlighted && danger) stroke = '#ff8a00';
    if (fireHighlights.burningCarId && fireHighlights.nearbyTrackIds.has(trackId) && danger)
      stroke = '#ff3d00';
    if (isSelected) stroke = '#7dd3fc';
    if (!occupied) opacity = 0.9;
    if (isSelected) width = 7;

    line.setAttribute('stroke', stroke);
    line.setAttribute('stroke-width', String(width));
    line.setAttribute('opacity', String(opacity));
    line.style.cursor = 'pointer';
    line.style.pointerEvents = 'stroke';

    line.dataset.trackId = trackId;

    trackLayer.appendChild(line);
  }
  svg.appendChild(trackLayer);

  // Connectors (switch nodes).
  const connectorLayer = createSvgEl('g');
  for (const connectorId of Object.keys(layout.connectors)) {
    const connector = layout.connectors[connectorId];

    const c = createSvgEl('circle');
    c.setAttribute('cx', String(connector.position.x));
    c.setAttribute('cy', String(connector.position.y));
    c.setAttribute('r', '7');
    c.setAttribute('fill', '#ffb020');
    c.setAttribute('opacity', '0.85');
    connectorLayer.appendChild(c);
  }
  svg.appendChild(connectorLayer);

  // Cars (wagons).
  const carLayer = createSvgEl('g');

  // Draw cars grouped by hazard so higher-risk items appear above.
  const allCarIds = Object.keys(layout.carById) as CarId[];
  const occupiedCarIds = allCarIds.filter((carId) => layout.carPlacements[carId]);
  occupiedCarIds.sort((a, b) => {
    const ha = layout.carPlacements[a]?.hazardLevel ?? 0;
    const hb = layout.carPlacements[b]?.hazardLevel ?? 0;
    return ha - hb;
  });

  for (const carId of occupiedCarIds) {
    const placement = layout.carPlacements[carId];
    if (!placement) continue;

    if (!isCarVisible(layout, carId, fireHighlights, hazardVisibility)) continue;

    const { stroke, fill, glow } = colorForCar(
      placement.hazardLevel,
      fireHighlights,
      carId,
    );

    const isSelected = selection.selectedCarId === carId;

    const group = createSvgEl('g');
    group.dataset.carId = carId;
    group.style.cursor = 'pointer';

    // Optional glow ring for burning cars.
    if (glow) {
      const ring = createSvgEl('circle');
      ring.setAttribute('cx', '0');
      ring.setAttribute('cy', '0');
      ring.setAttribute('r', '20');
      ring.setAttribute('fill', 'rgba(255,45,45,0.08)');
      ring.setAttribute('stroke', 'rgba(255,45,45,0.55)');
      ring.setAttribute('stroke-width', '2');
      group.appendChild(ring);
    }

    // Optional glow ring for moving cars.
    if (movingCarIds.has(carId)) {
      const moveRing = createSvgEl('circle');
      moveRing.setAttribute('cx', '0');
      moveRing.setAttribute('cy', '0');
      moveRing.setAttribute('r', '18');
      moveRing.setAttribute('fill', 'rgba(125,211,252,0.1)');
      moveRing.setAttribute('stroke', '#7dd3fc');
      moveRing.setAttribute('stroke-width', '2');
      moveRing.setAttribute('stroke-dasharray', '4 4');
      group.appendChild(moveRing);
    }

    const w = 30;
    const h = 16;
    const rect = createSvgEl('rect');
    rect.setAttribute('x', String(-w / 2));
    rect.setAttribute('y', String(-h / 2));
    rect.setAttribute('width', String(w));
    rect.setAttribute('height', String(h));
    rect.setAttribute('rx', '4');
    rect.setAttribute('fill', fill);
    rect.setAttribute('stroke', isSelected ? '#7dd3fc' : stroke);
    rect.setAttribute('stroke-width', isSelected ? '3' : '2');

    // Wagon label (short id).
    const label = createSvgEl('text');
    label.setAttribute('x', '0');
    label.setAttribute('y', '4');
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-size', '10');
    label.setAttribute('fill', 'rgba(230,240,255,0.95)');
    label.textContent = carId;

    // A tooltip using <title>.
    const title = createSvgEl('title');
    title.textContent = `${carId} (${hazardLabel(placement.hazardLevel)})`;
    group.appendChild(title);

    // Position + rotation for the wagon.
    group.setAttribute(
      'transform',
      `translate(${placement.x} ${placement.y}) rotate(${placement.rotationDeg})`,
    );
    group.appendChild(rect);
    group.appendChild(label);
    carLayer.appendChild(group);
  }

  svg.appendChild(carLayer);
}

