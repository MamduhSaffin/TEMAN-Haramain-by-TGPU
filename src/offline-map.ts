import * as maplibregl from 'maplibre-gl';
import type { Map as MapLibreMap, Marker } from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import { onTemanUiRefresh } from './ui-refresh';
import 'maplibre-gl/dist/maplibre-gl.css';

type Locale = 'ms' | 'en' | 'ar';
type City = 'makkah' | 'madinah';
type Point = { lat: number; lng: number; accuracy?: number; timestamp?: number; label?: string };
type Profile = {
  pilgrimName?: string;
  preferredName?: string;
  hotelMakkah?: string;
  hotelMadinah?: string;
  groupCode?: string;
  busNumber?: string;
};

type PackConfig = {
  label: string;
  arabic: string;
  path: string;
  approxSize: string;
  center: [number, number];
  bounds: [[number, number], [number, number]];
};

const PACK_CACHE = 'teman-map-packs-v1';
const PACKS: Record<City, PackConfig> = {
  makkah: {
    label: 'Makkah',
    arabic: 'مكة المكرمة',
    path: '/maps/makkah.pmtiles',
    approxSize: '±2.4 MB',
    center: [39.8262, 21.4225],
    bounds: [[39.7600, 21.3600], [39.9000, 21.4900]],
  },
  madinah: {
    label: 'Madinah',
    arabic: 'المدينة المنورة',
    path: '/maps/madinah.pmtiles',
    approxSize: '±2.2 MB',
    center: [39.6111, 24.4672],
    bounds: [[39.5400, 24.4000], [39.6800, 24.5300]],
  },
};

const COPY = {
  ms: {
    trigger: '🗺️ PETA OFFLINE', eyebrow: 'PETA HARAMAIN', title: 'Peta jalan tanpa internet', intro: 'Muat turun Makkah atau Madinah sekali. Selepas itu jalan, lokasi anda, hotel dan tempat kumpulan boleh dilihat semasa offline.',
    online: 'Online', offline: 'Offline', packReady: 'PETA OFFLINE SIAP ✓', packMissing: 'BELUM DISIMPAN OFFLINE', packMissingOffline: 'TIADA PEK OFFLINE', download: 'MUAT TURUN PETA', downloading: 'MEMUAT TURUN', remove: 'BUANG PEK', locate: 'DI MANA SAYA?', locating: 'MENCARI GPS…',
    saveHotel: 'SIMPAN INI SEBAGAI HOTEL', saveGroup: 'SIMPAN INI SEBAGAI TEMPAT KUMPULAN', hotel: 'HOTEL', group: 'KUMPULAN', me: 'ANDA', focusHotel: 'BALIK KE HOTEL', focusGroup: 'CARI KUMPULAN', noHotel: 'Lokasi hotel belum disimpan.', noGroup: 'Tempat kumpulan belum disimpan.', needGps: 'Tekan “DI MANA SAYA?” dahulu.', savedHotel: 'Lokasi hotel disimpan pada telefon.', savedGroup: 'Tempat kumpulan disimpan pada telefon.',
    downloadFirst: 'Sambungkan internet untuk memuat turun pek bandar dahulu.', unsupportedCache: 'Pelayar ini tidak menyokong simpanan peta offline.', gpsUnsupported: 'GPS tidak tersedia pada peranti ini.', gpsError: 'GPS tidak dapat digunakan. Cuba lagi di kawasan terbuka.', mapError: 'Peta tidak dapat dimuatkan.',
    readyHint: 'Boleh digunakan dalam Airplane Mode.', downloadHint: 'Muat turun sekali sahaja', current: 'Lokasi anda', accuracy: 'ketepatan', distance: 'Jarak lurus', safety: 'Peta ini membantu orientasi, bukan navigasi turn-by-turn. Jika keliru, berhenti di tempat selamat dan hubungi mutawwif atau petugas.', close: 'Tutup', storage: 'Simpanan',
  },
  en: {
    trigger: '🗺️ OFFLINE MAP', eyebrow: 'HARAMAIN MAP', title: 'Street map without internet', intro: 'Download Makkah or Madinah once. Roads, your position, hotel and meeting point can then be viewed offline.',
    online: 'Online', offline: 'Offline', packReady: 'OFFLINE MAP READY ✓', packMissing: 'NOT SAVED OFFLINE', packMissingOffline: 'NO OFFLINE PACK', download: 'DOWNLOAD MAP', downloading: 'DOWNLOADING', remove: 'REMOVE PACK', locate: 'WHERE AM I?', locating: 'FINDING GPS…',
    saveHotel: 'SAVE THIS AS HOTEL', saveGroup: 'SAVE THIS AS MEETING POINT', hotel: 'HOTEL', group: 'GROUP', me: 'YOU', focusHotel: 'BACK TO HOTEL', focusGroup: 'FIND GROUP', noHotel: 'Hotel location has not been saved.', noGroup: 'Meeting point has not been saved.', needGps: 'Tap “WHERE AM I?” first.', savedHotel: 'Hotel location saved on this phone.', savedGroup: 'Meeting point saved on this phone.',
    downloadFirst: 'Connect to the internet first to download this city pack.', unsupportedCache: 'This browser does not support offline map storage.', gpsUnsupported: 'GPS is not available on this device.', gpsError: 'GPS could not be used. Try again in a more open area.', mapError: 'The map could not be loaded.',
    readyHint: 'Works in Airplane Mode.', downloadHint: 'One-time download', current: 'Your location', accuracy: 'accuracy', distance: 'Straight-line distance', safety: 'This map is for orientation, not turn-by-turn navigation. If unsure, stop somewhere safe and contact your mutawwif or an official.', close: 'Close', storage: 'Storage',
  },
  ar: {
    trigger: '🗺️ خريطة دون إنترنت', eyebrow: 'خريطة الحرمين', title: 'خريطة الشوارع دون إنترنت', intro: 'نزّل خريطة مكة أو المدينة مرة واحدة، ثم استخدم الطرق وموقعك والفندق ونقطة التجمع دون إنترنت.',
    online: 'متصل', offline: 'دون إنترنت', packReady: 'الخريطة جاهزة دون إنترنت ✓', packMissing: 'لم تُحفظ دون إنترنت', packMissingOffline: 'لا توجد خريطة محفوظة', download: 'تنزيل الخريطة', downloading: 'جارٍ التنزيل', remove: 'حذف الخريطة', locate: 'أين أنا؟', locating: 'جارٍ تحديد الموقع…',
    saveHotel: 'حفظ هذا الموقع كفندق', saveGroup: 'حفظ هذا الموقع كنقطة تجمع', hotel: 'الفندق', group: 'المجموعة', me: 'أنت', focusHotel: 'العودة إلى الفندق', focusGroup: 'العثور على المجموعة', noHotel: 'لم يتم حفظ موقع الفندق.', noGroup: 'لم يتم حفظ نقطة التجمع.', needGps: 'اضغط «أين أنا؟» أولاً.', savedHotel: 'تم حفظ موقع الفندق على هذا الهاتف.', savedGroup: 'تم حفظ نقطة التجمع على هذا الهاتف.',
    downloadFirst: 'اتصل بالإنترنت أولاً لتنزيل خريطة المدينة.', unsupportedCache: 'هذا المتصفح لا يدعم تخزين الخرائط دون إنترنت.', gpsUnsupported: 'GPS غير متاح على هذا الجهاز.', gpsError: 'تعذر استخدام GPS. حاول مرة أخرى في مكان مفتوح.', mapError: 'تعذر تحميل الخريطة.',
    readyHint: 'تعمل في وضع الطيران.', downloadHint: 'تنزيل مرة واحدة', current: 'موقعك', accuracy: 'الدقة', distance: 'المسافة المباشرة', safety: 'هذه الخريطة للمساعدة على معرفة المكان وليست ملاحة خطوة بخطوة. إذا التبس عليك الطريق فتوقف في مكان آمن واتصل بالمطوف أو أحد المسؤولين.', close: 'إغلاق', storage: 'التخزين',
  },
} as const;

let protocolReady = false;
let protocol: Protocol | null = null;

function locale(): Locale {
  const lang = document.documentElement.lang.toLowerCase();
  if (lang.startsWith('ar')) return 'ar';
  if (lang.startsWith('en')) return 'en';
  return 'ms';
}

function readJson<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || '') as T; } catch { return fallback; }
}

function profile(): Profile { return readJson<Profile>('teman-profile', {}); }
function currentCity(): City { return localStorage.getItem('teman-city') === 'madinah' ? 'madinah' : 'makkah'; }
function pointKey(kind: 'hotel' | 'group', city: City) { return `teman-map.${kind}.${city}`; }
function loadPoint(kind: 'hotel' | 'group', city: City): Point | null { return readJson<Point | null>(pointKey(kind, city), null); }
function savePoint(kind: 'hotel' | 'group', city: City, point: Point) { localStorage.setItem(pointKey(kind, city), JSON.stringify(point)); }
function loadCurrent(): Point | null {
  const value = readJson<{ lat?: number; lng?: number; accuracy?: number; timestamp?: number } | null>('teman-last-location', null);
  return value && Number.isFinite(value.lat) && Number.isFinite(value.lng) ? { lat: value.lat!, lng: value.lng!, accuracy: value.accuracy, timestamp: value.timestamp } : null;
}

function ensureProtocol() {
  if (protocolReady) return;
  protocol = new Protocol({ metadata: true });
  maplibregl.addProtocol('pmtiles', protocol.tile);
  protocolReady = true;
}

async function packCached(city: City): Promise<boolean> {
  if (!('caches' in window)) return false;
  const cache = await caches.open(PACK_CACHE);
  return Boolean(await cache.match(PACKS[city].path));
}

function markerElement(label: string, kind: 'me' | 'hotel' | 'group') {
  const element = document.createElement('div');
  element.className = `offlineMapMarker ${kind}`;
  const dot = document.createElement('span');
  const text = document.createElement('b');
  text.textContent = label;
  element.append(dot, text);
  return element;
}

function distanceMeters(a: Point, b: Point): number {
  const r = 6371000;
  const p1 = a.lat * Math.PI / 180;
  const p2 = b.lat * Math.PI / 180;
  const dp = (b.lat - a.lat) * Math.PI / 180;
  const dl = (b.lng - a.lng) * Math.PI / 180;
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * r * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function formatDistance(value: number) {
  return value < 1000 ? `${Math.round(value)} m` : `${(value / 1000).toFixed(value < 10000 ? 1 : 0)} km`;
}

function buildStyle(url: string): any {
  return {
    version: 8,
    sources: { haramain: { type: 'vector', url, attribution: '© OpenStreetMap contributors · Protomaps' } },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': '#f5f2e9' } },
      { id: 'earth', type: 'fill', source: 'haramain', 'source-layer': 'earth', paint: { 'fill-color': '#f5f2e9' } },
      { id: 'landuse', type: 'fill', source: 'haramain', 'source-layer': 'landuse', paint: { 'fill-color': '#edf0e5', 'fill-opacity': 0.7 } },
      { id: 'water', type: 'fill', source: 'haramain', 'source-layer': 'water', paint: { 'fill-color': '#b9d9ea' } },
      { id: 'buildings', type: 'fill', source: 'haramain', 'source-layer': 'buildings', minzoom: 13, paint: { 'fill-color': '#ddd8cf', 'fill-outline-color': '#c9c2b7' } },
      { id: 'roads-path', type: 'line', source: 'haramain', 'source-layer': 'roads', filter: ['==', ['get', 'kind'], 'path'], paint: { 'line-color': '#d9cdbb', 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.4, 16, 2.2] } },
      { id: 'roads-minor', type: 'line', source: 'haramain', 'source-layer': 'roads', filter: ['==', ['get', 'kind'], 'minor_road'], paint: { 'line-color': '#ffffff', 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.8, 16, 4.2] } },
      { id: 'roads-major-casing', type: 'line', source: 'haramain', 'source-layer': 'roads', filter: ['match', ['get', 'kind'], ['major_road', 'highway'], true, false], paint: { 'line-color': '#d7b989', 'line-width': ['interpolate', ['linear'], ['zoom'], 11, 1.5, 16, 7.2] } },
      { id: 'roads-major', type: 'line', source: 'haramain', 'source-layer': 'roads', filter: ['match', ['get', 'kind'], ['major_road', 'highway'], true, false], paint: { 'line-color': '#fff6df', 'line-width': ['interpolate', ['linear'], ['zoom'], 11, 0.8, 16, 5] } },
      { id: 'rail', type: 'line', source: 'haramain', 'source-layer': 'roads', filter: ['==', ['get', 'kind'], 'rail'], paint: { 'line-color': '#a5a0a0', 'line-width': 1.2, 'line-dasharray': [2, 2] } },
    ],
  };
}

export function initOfflineMap() {
  if (document.querySelector('.temanOfflineMapTrigger')) return;

  ensureProtocol();
  let city: City = currentCity();
  let current = loadCurrent();
  let map: MapLibreMap | null = null;
  let markers: Marker[] = [];
  let isCached = false;
  let downloading = false;
  let progress = 0;
  let message = '';
  let target: 'hotel' | 'group' | null = null;

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'temanOfflineMapTrigger';
  document.body.appendChild(trigger);

  const overlay = document.createElement('div');
  overlay.className = 'temanOfflineMapOverlay';
  overlay.hidden = true;
  overlay.innerHTML = `
    <section class="temanOfflineMapPanel" role="dialog" aria-modal="true">
      <header><div><span class="mapEyebrow" data-eyebrow></span><h2 data-title></h2><p data-intro></p></div><button type="button" data-close aria-label="Close">×</button></header>
      <div class="offlineMapBody">
        <div class="offlineMapConnectivity" data-connectivity></div>
        <div class="offlineMapCities">
          <button type="button" data-city="makkah"><b>Makkah</b><span dir="rtl">مكة المكرمة</span></button>
          <button type="button" data-city="madinah"><b>Madinah</b><span dir="rtl">المدينة المنورة</span></button>
        </div>
        <div class="offlineMapPack" data-pack>
          <div><strong data-pack-status></strong><span data-pack-hint></span><small data-storage></small></div>
          <div class="offlineMapPackActions"><button type="button" data-download></button><button type="button" data-remove></button></div>
          <div class="offlineMapProgress" data-progress hidden><i></i></div>
        </div>
        <div class="offlineMapPrimaryActions">
          <button type="button" class="me" data-locate></button>
          <button type="button" class="hotel" data-focus-hotel></button>
          <button type="button" class="group" data-focus-group></button>
        </div>
        <div class="offlineMapCanvasWrap"><div class="offlineMapCanvas" data-map></div><div class="offlineMapEmpty" data-empty hidden></div></div>
        <div class="offlineMapSaveActions">
          <button type="button" data-save-hotel></button><button type="button" data-save-group></button>
        </div>
        <div class="offlineMapDistance" data-distance hidden></div>
        <div class="offlineMapMessage" data-message hidden></div>
        <div class="offlineMapSafety" data-safety></div>
        <div class="offlineMapAttribution">Map data © OpenStreetMap contributors • PMTiles / Protomaps • MapLibre GL JS</div>
      </div>
    </section>`;
  document.body.appendChild(overlay);

  const mapNode = overlay.querySelector<HTMLElement>('[data-map]')!;
  const connectivity = overlay.querySelector<HTMLElement>('[data-connectivity]')!;
  const packStatus = overlay.querySelector<HTMLElement>('[data-pack-status]')!;
  const packHint = overlay.querySelector<HTMLElement>('[data-pack-hint]')!;
  const storage = overlay.querySelector<HTMLElement>('[data-storage]')!;
  const downloadButton = overlay.querySelector<HTMLButtonElement>('[data-download]')!;
  const removeButton = overlay.querySelector<HTMLButtonElement>('[data-remove]')!;
  const progressEl = overlay.querySelector<HTMLElement>('[data-progress]')!;
  const messageEl = overlay.querySelector<HTMLElement>('[data-message]')!;
  const distanceEl = overlay.querySelector<HTMLElement>('[data-distance]')!;
  const emptyEl = overlay.querySelector<HTMLElement>('[data-empty]')!;

  const destroyMap = () => {
    markers.forEach(marker => marker.remove());
    markers = [];
    map?.remove();
    map = null;
  };

  const addMarkers = () => {
    if (!map) return;
    markers.forEach(marker => marker.remove());
    markers = [];
    const t = COPY[locale()];
    const hotel = loadPoint('hotel', city);
    const group = loadPoint('group', city);
    const points: Array<{ point: Point; label: string; kind: 'me' | 'hotel' | 'group' }> = [];
    if (hotel) points.push({ point: hotel, label: t.hotel, kind: 'hotel' });
    if (group) points.push({ point: group, label: t.group, kind: 'group' });
    if (current) points.push({ point: current, label: t.me, kind: 'me' });
    points.forEach(item => {
      const marker = new maplibregl.Marker({ element: markerElement(item.label, item.kind), anchor: 'bottom' })
        .setLngLat([item.point.lng, item.point.lat])
        .addTo(map!);
      markers.push(marker);
    });
  };

  const initMap = () => {
    destroyMap();
    const canRender = navigator.onLine || isCached;
    mapNode.hidden = !canRender;
    emptyEl.hidden = canRender;
    if (!canRender) return;
    const pack = PACKS[city];
    try {
      const archive = new URL(pack.path, window.location.origin).toString();
      map = new maplibregl.Map({ container: mapNode, style: buildStyle(`pmtiles://${archive}`), center: pack.center, zoom: 14, minZoom: 11, maxZoom: 17, maxBounds: pack.bounds, attributionControl: false });
      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
      map.on('load', () => { addMarkers(); window.setTimeout(() => map?.resize(), 50); });
      map.on('error', () => { message = COPY[locale()].mapError; void render(false); });
    } catch {
      message = COPY[locale()].mapError;
    }
  };

  const refreshStorage = async () => {
    if (!navigator.storage?.estimate) { storage.textContent = ''; return; }
    try {
      const estimate = await navigator.storage.estimate();
      if (typeof estimate.usage === 'number' && typeof estimate.quota === 'number') {
        storage.textContent = `${COPY[locale()].storage}: ${(estimate.usage / 1048576).toFixed(1)} MB / ${(estimate.quota / 1048576).toFixed(0)} MB`;
      }
    } catch { storage.textContent = ''; }
  };

  const render = async (rebuildMap = false) => {
    const t = COPY[locale()];
    const pack = PACKS[city];
    isCached = await packCached(city);
    trigger.textContent = t.trigger;
    overlay.dir = locale() === 'ar' ? 'rtl' : 'ltr';
    overlay.querySelector<HTMLElement>('[data-eyebrow]')!.textContent = t.eyebrow;
    overlay.querySelector<HTMLElement>('[data-title]')!.textContent = t.title;
    overlay.querySelector<HTMLElement>('[data-intro]')!.textContent = t.intro;
    overlay.querySelector<HTMLButtonElement>('[data-close]')!.setAttribute('aria-label', t.close);
    connectivity.textContent = `${navigator.onLine ? '●' : '○'} ${navigator.onLine ? t.online : t.offline}`;
    connectivity.className = `offlineMapConnectivity ${navigator.onLine ? 'online' : 'offline'}`;
    overlay.querySelectorAll<HTMLButtonElement>('[data-city]').forEach(button => button.classList.toggle('active', button.dataset.city === city));
    packStatus.textContent = isCached ? t.packReady : navigator.onLine ? t.packMissing : t.packMissingOffline;
    packHint.textContent = isCached ? t.readyHint : `${t.downloadHint} • ${pack.approxSize}`;
    downloadButton.textContent = downloading ? `${t.downloading} ${progress}%` : `${t.download} ${pack.label.toUpperCase()}`;
    downloadButton.disabled = downloading || isCached;
    removeButton.textContent = t.remove;
    removeButton.hidden = !isCached;
    progressEl.hidden = !downloading;
    (progressEl.querySelector('i') as HTMLElement).style.width = `${Math.max(progress, 4)}%`;
    const locateButton = overlay.querySelector<HTMLButtonElement>('[data-locate]')!;
    locateButton.textContent = downloading ? t.locate : t.locate;
    overlay.querySelector<HTMLButtonElement>('[data-focus-hotel]')!.textContent = t.focusHotel;
    overlay.querySelector<HTMLButtonElement>('[data-focus-group]')!.textContent = t.focusGroup;
    overlay.querySelector<HTMLButtonElement>('[data-save-hotel]')!.textContent = t.saveHotel;
    overlay.querySelector<HTMLButtonElement>('[data-save-group]')!.textContent = t.saveGroup;
    overlay.querySelector<HTMLElement>('[data-safety]')!.textContent = t.safety;
    emptyEl.textContent = `${t.packMissingOffline}. ${t.downloadFirst}`;
    messageEl.hidden = !message;
    messageEl.textContent = message;
    const targetPoint = target ? loadPoint(target, city) : null;
    if (current && targetPoint) {
      distanceEl.hidden = false;
      distanceEl.textContent = `${t.distance}: ${formatDistance(distanceMeters(current, targetPoint))}`;
    } else {
      distanceEl.hidden = true;
    }
    await refreshStorage();
    if (rebuildMap) initMap(); else addMarkers();
  };

  const locate = () => {
    const t = COPY[locale()];
    if (!navigator.geolocation) { message = t.gpsUnsupported; void render(false); return; }
    const button = overlay.querySelector<HTMLButtonElement>('[data-locate]')!;
    button.disabled = true;
    button.textContent = t.locating;
    navigator.geolocation.getCurrentPosition(position => {
      current = { lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy, timestamp: Date.now() };
      localStorage.setItem('teman-last-location', JSON.stringify(current));
      message = `${t.current} • ${t.accuracy} ±${Math.round(position.coords.accuracy)} m`;
      button.disabled = false;
      if (map) map.flyTo({ center: [current.lng, current.lat], zoom: 16 });
      void render(false);
    }, () => {
      message = t.gpsError;
      button.disabled = false;
      void render(false);
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 });
  };

  const saveCurrent = (kind: 'hotel' | 'group') => {
    const t = COPY[locale()];
    if (!current) { message = t.needGps; void render(false); return; }
    const p = profile();
    const label = kind === 'hotel' ? (city === 'madinah' ? p.hotelMadinah : p.hotelMakkah) : (p.groupCode ? `${p.groupCode}${p.busNumber ? ` • ${p.busNumber}` : ''}` : undefined);
    savePoint(kind, city, { ...current, label });
    message = kind === 'hotel' ? t.savedHotel : t.savedGroup;
    void render(false);
  };

  const focus = (kind: 'hotel' | 'group') => {
    const t = COPY[locale()];
    const point = loadPoint(kind, city);
    target = kind;
    if (!point) { message = kind === 'hotel' ? t.noHotel : t.noGroup; void render(false); return; }
    message = point.label || (kind === 'hotel' ? t.hotel : t.group);
    if (map) map.flyTo({ center: [point.lng, point.lat], zoom: 16 });
    void render(false);
  };

  const downloadPack = async () => {
    const t = COPY[locale()];
    if (!navigator.onLine) { message = t.downloadFirst; void render(false); return; }
    if (!('caches' in window)) { message = t.unsupportedCache; void render(false); return; }
    downloading = true; progress = 0; message = '';
    await render(false);
    try {
      const pack = PACKS[city];
      const response = await fetch(pack.path, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const total = Number(response.headers.get('content-length') || 0);
      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];
      let loaded = 0;
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value.slice()); loaded += value.byteLength;
            if (total > 0) { progress = Math.min(100, Math.round(loaded / total * 100)); await render(false); }
          }
        }
      } else {
        const value = new Uint8Array(await response.arrayBuffer()); chunks.push(value); loaded = value.byteLength;
      }
      const blob = new Blob(chunks as BlobPart[], { type: 'application/vnd.pmtiles' });
      const cache = await caches.open(PACK_CACHE);
      await cache.put(pack.path, new Response(blob, { status: 200, headers: { 'Content-Type': 'application/vnd.pmtiles', 'Content-Length': String(blob.size), 'Accept-Ranges': 'bytes' } }));
      progress = 100; message = `${pack.label} • ${t.packReady}`;
    } catch (error) {
      message = `${t.mapError} ${error instanceof Error ? error.message : ''}`.trim();
    } finally {
      downloading = false;
      await render(true);
    }
  };

  const removePack = async () => {
    if ('caches' in window) {
      const cache = await caches.open(PACK_CACHE);
      await cache.delete(PACKS[city].path);
    }
    message = '';
    await render(true);
  };

  trigger.addEventListener('click', async () => {
    city = currentCity(); current = loadCurrent(); target = null; message = '';
    overlay.hidden = false; document.body.classList.add('teman-offline-map-open');
    await render(true);
  });
  overlay.querySelector<HTMLButtonElement>('[data-close]')!.addEventListener('click', () => { overlay.hidden = true; document.body.classList.remove('teman-offline-map-open'); destroyMap(); });
  overlay.addEventListener('click', event => { if (event.target === overlay) { overlay.hidden = true; document.body.classList.remove('teman-offline-map-open'); destroyMap(); } });
  overlay.querySelectorAll<HTMLButtonElement>('[data-city]').forEach(button => button.addEventListener('click', async () => {
    city = button.dataset.city === 'madinah' ? 'madinah' : 'makkah'; localStorage.setItem('teman-city', city); target = null; message = ''; await render(true);
  }));
  overlay.querySelector<HTMLButtonElement>('[data-locate]')!.addEventListener('click', locate);
  overlay.querySelector<HTMLButtonElement>('[data-save-hotel]')!.addEventListener('click', () => saveCurrent('hotel'));
  overlay.querySelector<HTMLButtonElement>('[data-save-group]')!.addEventListener('click', () => saveCurrent('group'));
  overlay.querySelector<HTMLButtonElement>('[data-focus-hotel]')!.addEventListener('click', () => focus('hotel'));
  overlay.querySelector<HTMLButtonElement>('[data-focus-group]')!.addEventListener('click', () => focus('group'));
  downloadButton.addEventListener('click', () => void downloadPack());
  removeButton.addEventListener('click', () => void removePack());
  window.addEventListener('online', () => { if (!overlay.hidden) void render(true); });
  window.addEventListener('offline', () => { if (!overlay.hidden) void render(true); });
  window.addEventListener('storage', () => { current = loadCurrent(); if (!overlay.hidden) void render(false); });
  onTemanUiRefresh(() => { trigger.textContent = COPY[locale()].trigger; if (!overlay.hidden) void render(false); });
  trigger.textContent = COPY[locale()].trigger;
}
