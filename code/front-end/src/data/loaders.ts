import type { CarJson, PointsJsonItem, StateJsonBase, YardJson } from '../types';

async function loadJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load ${url}: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export interface LoadedMvpData {
  yard: YardJson;
  points: PointsJsonItem[];
  cars: CarJson[];
  stateBasic: StateJsonBase;
  stateAdvanced: StateJsonBase;
}

export async function loadMvpData(): Promise<LoadedMvpData> {
  const [yard, points, cars, stateBasic, stateAdvanced] = await Promise.all([
    loadJson<YardJson>('/zeeland_yard.json'),
    loadJson<PointsJsonItem[]>('/zeeland_points.json'),
    loadJson<CarJson[]>('/cars.json'),
    loadJson<StateJsonBase>('/state.basic.json'),
    loadJson<StateJsonBase>('/state.advanced.json'),
  ]);

  return { yard, points, cars, stateBasic, stateAdvanced };
}

