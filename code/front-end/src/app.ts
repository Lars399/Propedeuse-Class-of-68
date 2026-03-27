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
import type { LoadedMvpData } from './data/loaders';

function buildLegendHTML(): string {
  return `
    <div class="legend">
      <label class="legend-item">
        <input id="hazSafe" class="legend-checkbox" type="checkbox" checked />
        Safe
      </label>
      <label class="legend-item">
        <input id="hazCaution" class="legend-checkbox" type="checkbox" checked />
        Caution
      </label>
      <label class="legend-item">
        <input id="hazDanger" class="legend-checkbox" type="checkbox" checked />
        Danger
      </label>
      <label class="legend-item">
        <input id="hazDangerous" class="legend-checkbox" type="checkbox" checked />
        Dangerous
      </label>
      <label class="legend-item">
        <input id="hazOnFire" class="legend-checkbox" type="checkbox" checked />
        On fire
      </label>
    </div>
  `;
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function startApp(root: HTMLElement): void {
  root.innerHTML = `
    <div class="topbar">
      <h1>Tracks in the Dark - Danger Map</h1>
      <div class="spacer"></div>
      <button id="randomizeBtn" class="btn" type="button">🎲 Randomize</button>
      <button id="fireToggle" class="btn" aria-pressed="false" type="button">Fire mode: Off</button>
    </div>
    <div class="content">
      <div class="map-wrap">
        <div style="margin: 0 0 10px;">
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

  if (Math.random() < 0.05) {
    const img = document.createElement('img');
    img.src = 'https://i.imgur.com/4M7IWwP.png';
    img.style.position = 'absolute';
    img.style.top = '20px';
    img.style.right = '20px';
    img.style.width = '120px';
    img.style.zIndex = '999';
    root.appendChild(img);
  }

  const svg = root.querySelector('#yardSvg') as SVGSVGElement | null;
  const panel = root.querySelector('#panel') as HTMLElement | null;
  const fireToggle = root.querySelector('#fireToggle') as HTMLButtonElement | null;
  const randomizeBtn = root.querySelector('#randomizeBtn') as HTMLButtonElement | null;

  const hazSafe = root.querySelector('#hazSafe') as HTMLInputElement | null;
  const hazCaution = root.querySelector('#hazCaution') as HTMLInputElement | null;
  const hazDanger = root.querySelector('#hazDanger') as HTMLInputElement | null;
  const hazDangerous = root.querySelector('#hazDangerous') as HTMLInputElement | null;
  const hazOnFire = root.querySelector('#hazOnFire') as HTMLInputElement | null;

  if (!svg || !panel || !fireToggle || !randomizeBtn || !hazSafe || !hazCaution || !hazDanger || !hazDangerous || !hazOnFire) {
    throw new Error('App DOM not initialized correctly');
  }

  let dataRef: LoadedMvpData | null = null;
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

  const updateUI = (): void => {
    if (!layout) return;
    const fireHighlights = computeFireHighlights(layout, fireMode, burningCarId);
    renderYard(svg, layout, selection, fireHighlights, hazardVisibility);
    renderPanel(panel, layout, selection, fireMode, burningCarId);
  };

  const getPlacedCarIds = (): CarId[] => {
    if (!layout) return [];
    return Object.keys(layout.carPlacements) as CarId[];
  };

  const randomizeCarsInData = (): void => {
    if (!dataRef) return;

    const trainTypes = ['tankcar', 'engine', 'flatbed', 'boxcar', 'open-top hopper', 'autotrack'];
    const contents = [
      null,
      'ethanol',
      'lithium-ion batteries',
      'gasoline',
      'chemicals',
      'rice',
      'nissan-ev hz-livery',
      'hydrogen',
    ];
    const adrValues = [null, null, null, '8.0000', '12.5000', '23.7719', '30.9400', '49.9310'];

    for (const car of dataRef.cars) {
      car.type = getRandomItem(trainTypes);
      car.content = getRandomItem(contents);
      car.adr = car.content ? getRandomItem(adrValues) : null;

      if (car.type === 'engine') {
        car.content = null;
        car.adr = null;
      }
    }
  };

  const rebuildLayoutFromData = (): void => {
    if (!dataRef) return;
    layout = buildLayout(dataRef);
  };

  const randomizeYard = (): void => {
    if (!dataRef) return;

    randomizeCarsInData();
    rebuildLayoutFromData();

    const placedCarIds = getPlacedCarIds();

    if (placedCarIds.length > 0 && Math.random() < 0.5) {
      burningCarId = getRandomItem(placedCarIds);
      fireMode = true;
    } else {
      burningCarId = null;
      fireMode = false;
    }

    fireToggle.setAttribute('aria-pressed', String(fireMode));
    fireToggle.textContent = `Fire mode: ${fireMode ? 'On' : 'Off'}`;

    selection = { selectedCarId: null, selectedTrackId: null };
    updateUI();
  };

  showLoading('Loading yard data...');

  loadMvpData()
    .then((data) => {
      dataRef = data;
      rebuildLayoutFromData();
      updateUI();
    })
    .catch((err) => {
      console.error(err);
      panel.innerHTML = `<h2>Failed to load data</h2><div class="kv"><strong>Error</strong><span>${String(err)}</span></div>`;
    });

  attachSvgClickHandling({
    svg,
    onCarClick: (carId) => {
      selection = setSelectionForCar(selection, carId);
      if (fireMode) burningCarId = carId;
      updateUI();
    },
    onTrackClick: (trackId: TrackId) => {
      selection = setSelectionForTrack(selection, trackId);
      updateUI();
    },
  });

  randomizeBtn.addEventListener('click', () => {
    randomizeYard();
  });

  fireToggle.addEventListener('click', () => {
    fireMode = !fireMode;

    if (fireMode) {
      const placedCarIds = getPlacedCarIds();

      if (!burningCarId && placedCarIds.length > 0) {
        burningCarId = getRandomItem(placedCarIds);
      }
    } else {
      burningCarId = null;
    }

    fireToggle.setAttribute('aria-pressed', String(fireMode));
    fireToggle.textContent = `Fire mode: ${fireMode ? 'On' : 'Off'}`;
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