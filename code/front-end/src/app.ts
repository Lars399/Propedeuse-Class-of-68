import { loadMvpData } from './data/loaders';
import { buildLayout } from './yard/buildLayout';
import { renderYard } from './render/renderYard';
import { renderPanel } from './ui/panel';
import {
  attachSvgClickHandling,
  computeFireHighlights,
  setSelectionForCar,
  setSelectionForTrack,
} from './ui/interactions';
import type { CarId, HazardVisibility, SelectionState, TrackId } from './types';
import { hazardLabel } from './risk/hazard';
import type { YardLayout } from './types';

function buildLegendHTML(): string {
  return `
    <div class="legend">
      <label class="legend-item">
        <input id="hazSafe" class="legend-checkbox" type="checkbox" checked style="--sw-fill: rgba(46, 204, 113, 0.25); --sw-stroke: #2ecc71;" />
        Safe
      </label>
      <label class="legend-item">
        <input id="hazCaution" class="legend-checkbox" type="checkbox" checked style="--sw-fill: rgba(241, 196, 15, 0.25); --sw-stroke: #f1c40f;" />
        Caution
      </label>
      <label class="legend-item">
        <input id="hazDanger" class="legend-checkbox" type="checkbox" checked style="--sw-fill: rgba(230, 126, 34, 0.28); --sw-stroke: #e67e22;" />
        Danger
      </label>
      <label class="legend-item">
        <input id="hazDangerous" class="legend-checkbox" type="checkbox" checked style="--sw-fill: rgba(231, 76, 60, 0.28); --sw-stroke: #e74c3c;" />
        Dangerous
      </label>
      <label class="legend-item">
        <input id="hazOnFire" class="legend-checkbox" type="checkbox" checked style="--sw-fill: rgba(255, 45, 45, 0.2); --sw-stroke: #ff2d2d;" />
        On fire
      </label>
    </div>
  `;
}

export function startApp(root: HTMLElement): void {
  root.innerHTML = `
    <div class="topbar">
      <h1>Tracks in the Dark - Danger Map</h1>
      <div class="spacer"></div>
      <button id="fireToggle" class="btn" aria-pressed="false" type="button">Fire mode: Off</button>
    </div>
    <div class="content">
      <div class="map-wrap">
        <div style="margin: 0 0 10px; display:flex; gap:12px; align-items:center; justify-content:space-between;">
          ${buildLegendHTML()}
        </div>
        <svg id="yardSvg" class="yard-svg" />
      </div>
      <aside id="panel" class="panel">
        <h2>Details</h2>
        <div class="kv"><strong>Tip</strong><span>Click a wagon (or track) to see details.</span></div>
      </aside>
    </div>
  `;

  const svg = root.querySelector('#yardSvg') as SVGSVGElement | null;
  const panel = root.querySelector('#panel') as HTMLElement | null;
  const fireToggle = root.querySelector('#fireToggle') as HTMLButtonElement | null;
  const hazSafe = root.querySelector('#hazSafe') as HTMLInputElement | null;
  const hazCaution = root.querySelector('#hazCaution') as HTMLInputElement | null;
  const hazDanger = root.querySelector('#hazDanger') as HTMLInputElement | null;
  const hazDangerous = root.querySelector('#hazDangerous') as HTMLInputElement | null;
  const hazOnFire = root.querySelector('#hazOnFire') as HTMLInputElement | null;

  if (!svg || !panel || !fireToggle || !hazSafe || !hazCaution || !hazDanger || !hazDangerous || !hazOnFire) {
    throw new Error('App DOM not initialized correctly');
  }

  let layout: YardLayout | null = null;
  let selection: SelectionState = { selectedCarId: null, selectedTrackId: null };
  let fireMode = false;
  let burningCarId: CarId | null = null;
  let hazardVisibility: HazardVisibility = {
    safe: true,
    caution: true,
    danger: true,
    dangerous: true,
    onFire: true,
  };

  const showLoading = (message: string) => {
    panel.innerHTML = `<h2>Loading</h2><div class="kv"><strong>Status</strong><span>${message}</span></div>`;
    svg.innerHTML = '';
  };

  showLoading('Loading yard data...');

  loadMvpData()
    .then((data) => {
      layout = buildLayout(data);
      updateUI();
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      panel.innerHTML = `<h2>Failed to load data</h2><div class="kv"><strong>Error</strong><span>${String(err)}</span></div>`;
    });

  const updateUI = (): void => {
    if (!layout) return;
    const fireHighlights = computeFireHighlights(layout, fireMode, burningCarId);
    renderYard(svg, layout, selection, fireHighlights, hazardVisibility);
    renderPanel(panel, layout, selection, fireMode, burningCarId);
  };

  attachSvgClickHandling({
    svg,
    onCarClick: (carId) => {
      selection = setSelectionForCar(selection, carId);
      if (fireMode) burningCarId = carId;
      updateUI();
    },
    onTrackClick: (trackId: TrackId) => {
      selection = setSelectionForTrack(selection, trackId);
      // In fire mode, we keep burningCarId unchanged.
      updateUI();
    },
  });

  fireToggle.addEventListener('click', () => {
    fireMode = fireMode ? false : true;
    if (!fireMode) burningCarId = null;

    fireToggle.setAttribute('aria-pressed', String(fireMode));
    fireToggle.textContent = `Fire mode: ${fireMode ? 'On' : 'Off'}`;

    // If fire is turned on without a burning wagon, keep selection but no highlights yet.
    updateUI();
  });

  const syncHazardVisibilityFromCheckboxes = (): void => {
    hazardVisibility = {
      safe: hazSafe.checked,
      caution: hazCaution.checked,
      danger: hazDanger.checked,
      dangerous: hazDangerous.checked,
      onFire: hazOnFire.checked,
    };
  };

  syncHazardVisibilityFromCheckboxes();

  for (const cb of [hazSafe, hazCaution, hazDanger, hazDangerous, hazOnFire]) {
    cb.addEventListener('change', () => {
      syncHazardVisibilityFromCheckboxes();
      updateUI();
    });
  }
}

