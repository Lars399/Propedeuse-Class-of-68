(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();async function e(e){let t=await fetch(e);if(!t.ok)throw Error(`Failed to load ${e}: ${t.status} ${t.statusText}`);return await t.json()}async function t(){let[t,n,r,i,a]=await Promise.all([e(`/yard.json`),e(`/points.json`),e(`/cars.json`),e(`/state.basic.json`),e(`/state.advanced.json`)]);return{yard:t,points:n,cars:r,stateBasic:i,stateAdvanced:a}}function n(e){let t=(e.content??``).toLowerCase(),n=(e.type??``).toLowerCase();if(t.includes(`lithium`))return 3;if(t.includes(`ethanol`))return 2;if(t.includes(`hydrogen`))return 3;if(t.includes(`gas`))return 2;if(t.includes(`battery`))return 3;if(t.includes(`nissan-ev`)||t.includes(`ev`))return 1;let r=e.adr?Number.parseFloat(e.adr):NaN;return Number.isNaN(r)?(n.includes(`engine`),0):r>=45?3:r>=20?2:r>=10?1:0}function r(e){switch(e){case 0:return`Safe`;case 1:return`Caution`;case 2:return`Danger`;case 3:return`Dangerous`;default:return`Unknown`}}function i(e){switch(e){case 0:return{stroke:`#2ecc71`,fill:`rgba(46, 204, 113, 0.25)`};case 1:return{stroke:`#f1c40f`,fill:`rgba(241, 196, 15, 0.25)`};case 2:return{stroke:`#e67e22`,fill:`rgba(230, 126, 34, 0.28)`};case 3:return{stroke:`#e74c3c`,fill:`rgba(231, 76, 60, 0.28)`};default:return{stroke:`#ffffff`,fill:`rgba(255, 255, 255, 0.1)`}}}function a(e,t){let n=Math.hypot(e,t);return n===0?{ux:0,uy:0,len:0}:{ux:e/n,uy:t/n,len:n}}function o(e,t){return Math.atan2(t,e)*180/Math.PI}function s(e){if(!(!e||e.length===0))return e[0]}function c(e){let{yard:t,points:r,cars:i,stateAdvanced:c}=e,l={};for(let e of r)l[e.id]=e;let u={};for(let e of t.connectors){let t=l[e.id]??{id:e.id,x:0,y:0};u[e.id]={id:e.id,position:{x:t.x,y:t.y},incomingTracks:e.incoming_tracks,outgoingTracks:e.outgoing_tracks}}let d={};for(let e of i)d[e.id]=e;let f={};for(let e of c.tracks)f[e.id]=e.cars;function p(e){let n=t.connectors.filter(t=>t.outgoing_tracks.includes(e)).map(e=>e.id),r=t.connectors.filter(t=>t.incoming_tracks.includes(e)).map(e=>e.id),i=s(n),a=s(r);if(i&&a)return{from:i,to:a};if(!i&&a){let t=u[a]?.position??{x:0,y:0},n=`__entry_${e}`;return u[n]={id:n,position:{x:t.x-40,y:t.y},incomingTracks:[],outgoingTracks:[e]},{from:n,to:a}}if(i&&!a){let t=u[i]?.position??{x:0,y:0},n=`__exit_${e}`;return u[n]={id:n,position:{x:t.x+40,y:t.y},incomingTracks:[e],outgoingTracks:[]},{from:i,to:n}}let o=`__entry_${e}`,c=`__exit_${e}`;return u[o]={id:o,position:{x:50,y:50},incomingTracks:[],outgoingTracks:[e]},u[c]={id:c,position:{x:250,y:50},incomingTracks:[e],outgoingTracks:[]},{from:o,to:c}}let m={},h={};for(let e of t.tracks){let{from:t,to:r}=p(e.id),i=u[t].position,s=u[r].position,{ux:c,uy:l,len:g}=a(s.x-i.x,s.y-i.y),_=o(s.x-i.x,s.y-i.y),v=-l,y=c,b=Math.max(0,g-28),x={x:i.x+c*14,y:i.y+l*14},S={x:s.x-c*14,y:s.y-l*14},C=f[e.id]??[];if(m[e.id]={id:e.id,from:t,to:r,type:e.type,occupied:C.length>0,carIds:C,start:x,end:S},C.length!==0)for(let t=0;t<C.length;t++){let r=C[t],i=d[r],a=i?n(i):0,o=b/(C.length+1)*(t+1),s=x.x+c*o,u=x.y+l*o,f=(t-(C.length-1)/2)*8,p=s+v*f,m=u+y*f;h[r]={carId:r,trackId:e.id,x:p,y:m,rotationDeg:_,hazardLevel:a}}}let g={},_=Object.keys(m);for(let e of _){let t=m[e],n=new Set([t.from,t.to]),r=[];for(let t of _){if(t===e)continue;let i=m[t],a=new Set([i.from,i.to]),o=!1;for(let e of a)if(n.has(e)){o=!0;break}o&&r.push(t)}g[e]=r}return{name:t.name,connectors:u,tracks:m,carById:d,carPlacements:h,trackNeighbors:g}}function l(e){return document.createElementNS(`http://www.w3.org/2000/svg`,e)}function u(e,t,n){if(t.burningCarId===n)return{stroke:`#ff2d2d`,fill:`rgba(255, 45, 45, 0.65)`,glow:!0};if(t.possiblyDangerousCarIds.has(n)){let e=i(2);return{stroke:e.stroke,fill:e.fill,glow:!1}}if(t.nearbyCarIds.has(n)){let t=i(e);return{stroke:t.stroke,fill:t.fill,glow:!1}}let r=i(e);return{stroke:r.stroke,fill:r.fill,glow:!1}}function d(e){return e===0?`safe`:e===1?`caution`:e===2?`danger`:`dangerous`}function f(e,t,n,r){let i=e.carPlacements[t];if(!i)return!1;if(n.burningCarId===t)return r.onFire;let a=d(i.hazardLevel);return a===`safe`?r.safe:a===`caution`?r.caution:a===`danger`?r.danger:r.dangerous}function p(e,t,n,r){let i=e.tracks[t];return i?.carIds?.length?i.carIds.some(t=>{let i=e.carPlacements[t];return!i||!f(e,t,n,r)?!1:i.hazardLevel>=2}):!1}function m(e,t,n,i,a){for(;e.firstChild;)e.removeChild(e.firstChild);let o=Object.values(t.connectors).map(e=>e.position.x),s=Object.values(t.connectors).map(e=>e.position.y),c=Math.min(...o),d=Math.max(...o),m=Math.min(...s),h=Math.max(...s),g=Math.max(1,d-c+160),_=Math.max(1,h-m+160);e.setAttribute(`viewBox`,`${c-80} ${m-80} ${g} ${_}`);let v=l(`rect`);v.setAttribute(`x`,`${c-80}`),v.setAttribute(`y`,`${m-80}`),v.setAttribute(`width`,`${g}`),v.setAttribute(`height`,`${_}`),v.setAttribute(`fill`,`#070b16`),e.appendChild(v);let y=l(`g`);for(let e of Object.keys(t.tracks)){let r=t.tracks[e],o=p(t,e,i,a),s=l(`line`);s.setAttribute(`x1`,String(r.start.x)),s.setAttribute(`y1`,String(r.start.y)),s.setAttribute(`x2`,String(r.end.x)),s.setAttribute(`y2`,String(r.end.y));let c=r.occupied,u=i.nearbyTrackIds.has(e),d=n.selectedTrackId===e,f=c?`#dbe7ff`:`rgba(160, 180, 220, 0.35)`,m=c?5:3,h=1;o&&(f=`#e67e22`),u&&o&&(f=`#ff8a00`),i.burningCarId&&i.nearbyTrackIds.has(e)&&o&&(f=`#ff3d00`),d&&(f=`#7dd3fc`),c||(h=.9),d&&(m=7),s.setAttribute(`stroke`,f),s.setAttribute(`stroke-width`,String(m)),s.setAttribute(`opacity`,String(h)),s.style.cursor=`pointer`,s.style.pointerEvents=`stroke`,s.dataset.trackId=e,y.appendChild(s)}e.appendChild(y);let b=l(`g`);for(let e of Object.keys(t.connectors)){let n=t.connectors[e],r=l(`circle`);r.setAttribute(`cx`,String(n.position.x)),r.setAttribute(`cy`,String(n.position.y)),r.setAttribute(`r`,`7`),r.setAttribute(`fill`,`#ffb020`),r.setAttribute(`opacity`,`0.85`),b.appendChild(r)}e.appendChild(b);let x=l(`g`),S=Object.keys(t.carById).filter(e=>t.carPlacements[e]);S.sort((e,n)=>(t.carPlacements[e]?.hazardLevel??0)-(t.carPlacements[n]?.hazardLevel??0));for(let e of S){let o=t.carPlacements[e];if(!o||!f(t,e,i,a))continue;let{stroke:s,fill:c,glow:d}=u(o.hazardLevel,i,e),p=n.selectedCarId===e,m=l(`g`);if(m.dataset.carId=e,m.style.cursor=`pointer`,d){let e=l(`circle`);e.setAttribute(`cx`,String(o.x)),e.setAttribute(`cy`,String(o.y)),e.setAttribute(`r`,`20`),e.setAttribute(`fill`,`rgba(255,45,45,0.08)`),e.setAttribute(`stroke`,`rgba(255,45,45,0.55)`),e.setAttribute(`stroke-width`,`2`),m.appendChild(e)}let h=l(`rect`);h.setAttribute(`x`,`-15`),h.setAttribute(`y`,`-8`),h.setAttribute(`width`,`30`),h.setAttribute(`height`,`16`),h.setAttribute(`rx`,`4`),h.setAttribute(`fill`,c),h.setAttribute(`stroke`,p?`#7dd3fc`:s),h.setAttribute(`stroke-width`,p?`3`:`2`);let g=l(`text`);g.setAttribute(`x`,`0`),g.setAttribute(`y`,`4`),g.setAttribute(`text-anchor`,`middle`),g.setAttribute(`font-size`,`10`),g.setAttribute(`fill`,`rgba(230,240,255,0.95)`),g.textContent=e;let _=l(`title`);_.textContent=`${e} (${r(o.hazardLevel)})`,m.appendChild(_),m.setAttribute(`transform`,`translate(${o.x} ${o.y}) rotate(${o.rotationDeg})`),m.appendChild(h),m.appendChild(g),x.appendChild(m)}e.appendChild(x)}function h(e,t,n,i,a){let{selectedCarId:o,selectedTrackId:s}=n;if(!o&&!s){e.innerHTML=`
      <h2>Details</h2>
      <div class="kv"><strong>Tip</strong><span>Click a wagon (or track) to see details.</span></div>
      <div class="cars-list" style="margin-top:12px;">
        <strong style="color:#e6eefc;">Fire mode:</strong>
        <span>${i?`On`:`Off`}.</span>
      </div>
    `;return}if(o){let n=t.carPlacements[o],i=t.carById[o];if(!n||!i)return;let s=n.trackId,c=n.hazardLevel,l=g(t,o).map(e=>{let n=t.carPlacements[e];return`${e} (${r(n?n.hazardLevel:0)})`}).slice(0,8);e.innerHTML=`
      <h2>${a===o?`On Fire Wagon`:`Wagon Details`}</h2>
      <div class="kv"><strong>Car ID</strong><span>${o}</span></div>
      <div class="kv"><strong>Cargo</strong><span>${i.content??`Unknown / N/A`}</span></div>
      <div class="kv"><strong>Hazard Level</strong><span>${r(c)} (${c})</span></div>
      <div class="kv"><strong>Track</strong><span>${s}</span></div>
      <div class="kv"><strong>Position</strong><span>${Math.round(n.x)}, ${Math.round(n.y)}</span></div>

      <div class="cars-list">
        <strong style="color:#e6eefc;">Nearby wagons</strong>
        <ul>${l.length?l.map(e=>`<li>${e}</li>`).join(``):`<li>None found</li>`}</ul>
      </div>
    `;return}if(s){let n=t.tracks[s],i=n?.carIds??[],a=i.filter(e=>t.carPlacements[e]?.hazardLevel>=2).length,o=i.map(e=>{let n=t.carPlacements[e];return`<li>${e} - ${r(n?n.hazardLevel:0)}</li>`}).join(``);e.innerHTML=`
      <h2>Track Details</h2>
      <div class="kv"><strong>Track ID</strong><span>${s}</span></div>
      <div class="kv"><strong>Type</strong><span>${n.type}</span></div>
      <div class="kv"><strong>Occupied</strong><span>${n.occupied?`Yes`:`No`}</span></div>
      <div class="kv"><strong>Dangerous wagons</strong><span>${a}</span></div>

      <div class="cars-list">
        <strong style="color:#e6eefc;">Wagons</strong>
        <ul>${i.length?o:`<li>No cars currently on this track</li>`}</ul>
      </div>
    `;return}}function g(e,t){let n=e.carPlacements[t];if(!n)return[];let r=n.trackId,i=new Set([r,...e.trackNeighbors[r]]),a=[];for(let t of i){let n=e.tracks[t];if(n)for(let e of n.carIds)a.includes(e)||a.push(e)}return a.filter(e=>e!==t)}function _(e,t,n){if(!t||!n)return{burningCarId:null,nearbyCarIds:new Set,possiblyDangerousCarIds:new Set,nearbyTrackIds:new Set};let r=e.carPlacements[n];if(!r)return{burningCarId:null,nearbyCarIds:new Set,possiblyDangerousCarIds:new Set,nearbyTrackIds:new Set};let i=r.trackId,a=new Set([i,...e.trackNeighbors[i]]),o=new Set;for(let t of a){let n=e.tracks[t];for(let e of n.carIds)o.add(e)}let s=new Set;for(let t of o)t!==n&&(e.carPlacements[t]?.hazardLevel??0)>=2&&s.add(t);return{burningCarId:n,nearbyCarIds:o,possiblyDangerousCarIds:s,nearbyTrackIds:a}}function v(e){let{svg:t,onCarClick:n,onTrackClick:r}=e;t.addEventListener(`click`,e=>{let t=e.target;if(!t)return;let i=t.closest(`g[data-car-id]`);if(i){let e=i.getAttribute(`data-car-id`);e&&n(e);return}let a=t.closest(`line[data-track-id]`);if(a){let e=a.getAttribute(`data-track-id`);e&&r(e);return}})}function y(e,t){return{...e,selectedCarId:t,selectedTrackId:null}}function b(e,t){return{...e,selectedCarId:null,selectedTrackId:t}}function x(){return`
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
  `}function S(e){e.innerHTML=`
    <div class="topbar">
      <h1>Tracks in the Dark - Danger Map</h1>
      <div class="spacer"></div>
      <button id="fireToggle" class="btn" aria-pressed="false" type="button">Fire mode: Off</button>
    </div>
    <div class="content">
      <div class="map-wrap">
        <div style="margin: 0 0 10px; display:flex; gap:12px; align-items:center; justify-content:space-between;">
          ${x()}
        </div>
        <svg id="yardSvg" class="yard-svg" />
      </div>
      <aside id="panel" class="panel">
        <h2>Details</h2>
        <div class="kv"><strong>Tip</strong><span>Click a wagon (or track) to see details.</span></div>
      </aside>
    </div>
  `;let n=e.querySelector(`#yardSvg`),r=e.querySelector(`#panel`),i=e.querySelector(`#fireToggle`),a=e.querySelector(`#hazSafe`),o=e.querySelector(`#hazCaution`),s=e.querySelector(`#hazDanger`),l=e.querySelector(`#hazDangerous`),u=e.querySelector(`#hazOnFire`);if(!n||!r||!i||!a||!o||!s||!l||!u)throw Error(`App DOM not initialized correctly`);let d=null,f={selectedCarId:null,selectedTrackId:null},p=!1,g=null,S={safe:!0,caution:!0,danger:!0,dangerous:!0,onFire:!0};(e=>{r.innerHTML=`<h2>Loading</h2><div class="kv"><strong>Status</strong><span>${e}</span></div>`,n.innerHTML=``})(`Loading yard data...`),t().then(e=>{d=c(e),C()}).catch(e=>{console.error(e),r.innerHTML=`<h2>Failed to load data</h2><div class="kv"><strong>Error</strong><span>${String(e)}</span></div>`});let C=()=>{if(!d)return;let e=_(d,p,g);m(n,d,f,e,S),h(r,d,f,p,g)};v({svg:n,onCarClick:e=>{f=y(f,e),p&&(g=e),C()},onTrackClick:e=>{f=b(f,e),C()}}),i.addEventListener(`click`,()=>{p=!p,p||(g=null),i.setAttribute(`aria-pressed`,String(p)),i.textContent=`Fire mode: ${p?`On`:`Off`}`,C()});let w=()=>{S={safe:a.checked,caution:o.checked,danger:s.checked,dangerous:l.checked,onFire:u.checked}};w();for(let e of[a,o,s,l,u])e.addEventListener(`change`,()=>{w(),C()})}var C=document.getElementById(`app`);if(!C)throw Error(`Missing #app root element`);S(C);