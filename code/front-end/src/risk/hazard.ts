import type { CarJson, HazardLevel } from '../types';

export function hazardLevelForCar(car: CarJson): HazardLevel {
  const content = (car.content ?? '').toLowerCase();
  const type = (car.type ?? '').toLowerCase();

  // Simple, explainable hackathon heuristics.
  if (content.includes('lithium')) return 3;
  if (content.includes('ethanol')) return 2;
  if (content.includes('hydrogen')) return 3;
  if (content.includes('gas')) return 2;
  if (content.includes('battery')) return 3;
  if (content.includes('nissan-ev') || content.includes('ev')) return 1;

  // Use ADR numeric thresholds as a fallback if present.
  const adr = car.adr ? Number.parseFloat(car.adr) : NaN;
  if (!Number.isNaN(adr)) {
    if (adr >= 45) return 3;
    if (adr >= 20) return 2;
    if (adr >= 10) return 1;
    return 0;
  }

  // Engines are generally non-hazardous in the hackathon MVP.
  if (type.includes('engine')) return 0;

  return 0;
}

export function hazardLabel(level: HazardLevel): string {
  switch (level) {
    case 0:
      return 'Safe';
    case 1:
      return 'Caution';
    case 2:
      return 'Danger';
    case 3:
      return 'Dangerous';
    default:
      return 'Unknown';
  }
}

export function hazardSwatch(level: HazardLevel): { stroke: string; fill: string } {
  switch (level) {
    case 0:
      return { stroke: '#2ecc71', fill: 'rgba(46, 204, 113, 0.25)' };
    case 1:
      return { stroke: '#f1c40f', fill: 'rgba(241, 196, 15, 0.25)' };
    case 2:
      return { stroke: '#e67e22', fill: 'rgba(230, 126, 34, 0.28)' };
    case 3:
      return { stroke: '#e74c3c', fill: 'rgba(231, 76, 60, 0.28)' };
    default:
      return { stroke: '#ffffff', fill: 'rgba(255, 255, 255, 0.1)' };
  }
}

