import { onTemanUiRefresh } from './ui-refresh';

type Locale = 'ms' | 'en' | 'ar';
type City = 'makkah' | 'madinah';
type Mode = 'hotel' | 'group';
type Point = { lat: number; lng: number; accuracy?: number; timestamp?: number; label?: string };
type Profile = {
  hotelMakkah?: string;
  hotelMadinah?: string;
  groupCode?: string;
  busNumber?: string;
  mutawwifName?: string;
  mutawwifPhone?: string;
  familyName?: string;
  familyPhone?: string;
};
type CompassEvent = DeviceOrientationEvent & { webkitCompassHeading?: number };

type OrientationConstructor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

const COPY = {
  ms: {
    trigger: '🧭 PANDU ARAH', eyebrow: 'PANDU ARAH KESELAMATAN', title: 'Balik dengan kompas besar', intro: 'Guna GPS dan titik yang telah disimpan. Internet tidak diperlukan.',
    close: 'Tutup', hotel: 'BALIK KE HOTEL', group: 'CARI KUMPULAN', hotelHint: 'Hotel yang disimpan', groupHint: 'Tempat berkumpul', destination: 'DESTINASI', noHotel: 'Lokasi hotel belum disimpan.', noGroup: 'Tempat kumpulan belum disimpan.',
    finding: 'Mencari GPS…', gpsReady: 'GPS aktif', gpsError: 'GPS tidak dapat digunakan. Cuba di kawasan terbuka dan benarkan lokasi.', gpsUnsupported: 'GPS tidak tersedia pada peranti ini.',
    enableCompass: 'AKTIFKAN KOMPAS', compassOn: 'KOMPAS AKTIF ✓', compassDenied: 'Akses kompas tidak dibenarkan. Jarak dan bearing masih boleh digunakan.', compassUnsupported: 'Sensor kompas tidak tersedia. Gunakan bearing darjah dan peta offline.',
    distance: 'JARAK LURUS', bearing: 'ARAH', accuracy: 'Ketepatan GPS', northReference: 'Belum ikut arah telefon — aktifkan kompas.', turnHint: 'Pusing badan/telefon perlahan sehingga anak panah menghala ke atas.', arrived: 'ANDA SUDAH SANGAT DEKAT ✓', arrivedHint: 'Semak bangunan/tanda sekeliling. Jangan bergantung pada anak panah sahaja.',
    openMap: 'BUKA PETA OFFLINE', callMutawwif: 'TELEFON MUTAWWIF', callFamily: 'TELEFON KELUARGA', saveFirst: 'Buka Peta Offline dan simpan titik hotel atau kumpulan dahulu.',
    safety: 'Ini panduan orientasi berdasarkan GPS + kompas, bukan laluan berjalan turn-by-turn. Jalan sebenar mungkin terhalang atau tidak selamat. Jika keliru, berhenti di tempat selamat dan hubungi mutawwif/petugas.', online: 'Online', offline: 'Offline',
  },
  en: {
    trigger: '🧭 SAFETY COMPASS', eyebrow: 'SAFETY NAVIGATION', title: 'Find your way back with a large compass', intro: 'Uses GPS and your saved point. Internet is not required.',
    close: 'Close', hotel: 'BACK TO HOTEL', group: 'FIND MY GROUP', hotelHint: 'Saved hotel', groupHint: 'Saved meeting point', destination: 'DESTINATION', noHotel: 'Hotel location has not been saved.', noGroup: 'Group meeting point has not been saved.',
    finding: 'Finding GPS…', gpsReady: 'GPS active', gpsError: 'GPS could not be used. Try outside and allow location access.', gpsUnsupported: 'GPS is not available on this device.',
    enableCompass: 'ENABLE COMPASS', compassOn: 'COMPASS ACTIVE ✓', compassDenied: 'Compass permission was not granted. Distance and bearing still work.', compassUnsupported: 'Compass sensor is unavailable. Use the degree bearing and offline map.',
    distance: 'STRAIGHT-LINE DISTANCE', bearing: 'BEARING', accuracy: 'GPS accuracy', northReference: 'Not following phone direction yet — enable the compass.', turnHint: 'Turn your body/phone slowly until the arrow points upward.', arrived: 'YOU ARE VERY CLOSE ✓', arrivedHint: 'Check nearby buildings/signs. Do not rely on the arrow alone.',
    openMap: 'OPEN OFFLINE MAP', callMutawwif: 'CALL MUTAWWIF', callFamily: 'CALL FAMILY', saveFirst: 'Open Offline Map and save the hotel or group point first.',
    safety: 'This is GPS + compass orientation, not turn-by-turn walking navigation. Real routes may be blocked or unsafe. If unsure, stop somewhere safe and contact your mutawwif or an official.', online: 'Online', offline: 'Offline',
  },
  ar: {
    trigger: '🧭 بوصلة الأمان', eyebrow: 'الملاحة الآمنة', title: 'العودة ببوصلة كبيرة', intro: 'تستخدم GPS والنقطة المحفوظة، ولا تحتاج إلى الإنترنت.',
    close: 'إغلاق', hotel: 'العودة إلى الفندق', group: 'العثور على المجموعة', hotelHint: 'الفندق المحفوظ', groupHint: 'نقطة التجمع المحفوظة', destination: 'الوجهة', noHotel: 'لم يتم حفظ موقع الفندق.', noGroup: 'لم يتم حفظ نقطة تجمع المجموعة.',
    finding: 'جارٍ تحديد الموقع…', gpsReady: 'GPS يعمل', gpsError: 'تعذر استخدام GPS. جرّب في مكان مفتوح واسمح بالوصول إلى الموقع.', gpsUnsupported: 'GPS غير متاح على هذا الجهاز.',
    enableCompass: 'تفعيل البوصلة', compassOn: 'البوصلة مفعلة ✓', compassDenied: 'لم يتم السماح للبوصلة. ما زالت المسافة والاتجاه بالدرجات متاحة.', compassUnsupported: 'حساس البوصلة غير متاح. استخدم زاوية الاتجاه والخريطة دون إنترنت.',
    distance: 'المسافة المباشرة', bearing: 'الاتجاه', accuracy: 'دقة GPS', northReference: 'السهم لا يتبع اتجاه الهاتف بعد — فعّل البوصلة.', turnHint: 'حرّك جسمك/الهاتف ببطء حتى يشير السهم إلى الأعلى.', arrived: 'أنت قريب جدًا ✓', arrivedHint: 'تحقق من المباني والعلامات حولك ولا تعتمد على السهم وحده.',
    openMap: 'فتح الخريطة دون إنترنت', callMutawwif: 'الاتصال بالمطوف', callFamily: 'الاتصال بالأسرة', saveFirst: 'افتح الخريطة دون إنترنت واحفظ موقع الفندق أو نقطة التجمع أولاً.',
    safety: 'هذه أداة إرشاد باستخدام GPS والبوصلة وليست ملاحة مشي خطوة بخطوة. قد تكون الطرق الفعلية مغلقة أو غير آمنة. إذا التبس عليك الطريق فتوقف في مكان آمن واتصل بالمطوف أو أحد المسؤولين.', online: 'متصل', offline: 'دون إنترنت',
  },
} as const;

function locale(): Locale {
  const lang = document.documentElement.lang.toLowerCase();
  if (lang.startsWith('ar')) return 'ar';
  if (lang.startsWith('en')) return 'en';
  return 'ms';
}

function currentCity(): City { return localStorage.getItem('teman-city') === 'madinah' ? 'madinah' : 'makkah'; }
function readJson<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || '') as T; } catch { return fallback; }
}
function profile(): Profile { return readJson<Profile>('teman-profile', {}); }
function pointKey(kind: Mode, city: City) { return `teman-map.${kind}.${city}`; }
function loadPoint(kind: Mode, city: City): Point | null { return readJson<Point | null>(pointKey(kind, city), null); }
function normalize(value: number) { return ((value % 360) + 360) % 360; }
function radians(value: number) { return value * Math.PI / 180; }
function degrees(value: number) { return value * 180 / Math.PI; }
function distanceMeters(a: Point, b: Point) {
  const radius = 6371000;
  const lat1 = radians(a.lat); const lat2 = radians(b.lat);
  const dLat = radians(b.lat - a.lat); const dLng = radians(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * radius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
function bearingDegrees(a: Point, b: Point) {
  const lat1 = radians(a.lat); const lat2 = radians(b.lat); const dLng = radians(b.lng - a.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return normalize(degrees(Math.atan2(y, x)));
}
function formatDistance(value: number) {
  if (value < 1000) return `${Math.round(value)} m`;
  return `${(value / 1000).toFixed(value < 10000 ? 1 : 0)} km`;
}
function directionName(value: number, lang: Locale) {
  const index = Math.round(normalize(value) / 45) % 8;
  const names = lang === 'ar'
    ? ['شمال','شمال شرق','شرق','جنوب شرق','جنوب','جنوب غرب','غرب','شمال غرب']
    : lang === 'ms'
      ? ['Utara','Timur Laut','Timur','Tenggara','Selatan','Barat Daya','Barat','Barat Laut']
      : ['North','North-East','East','South-East','South','South-West','West','North-West'];
  return names[index];
}
function cleanPhone(value?: string) { return (value || '').replace(/[^\d+]/g, ''); }

export function initSafetyCompass() {
  if (document.querySelector('.temanSafetyCompassTrigger')) return;

  const trigger = document.createElement('button');
  trigger.type = 'button'; trigger.className = 'temanSafetyCompassTrigger'; trigger.hidden = true; document.body.appendChild(trigger);

  const overlay = document.createElement('section');
  overlay.className = 'temanSafetyCompassOverlay'; overlay.hidden = true; overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `<article class="temanSafetyCompassPanel">
    <header><div><span data-eyebrow></span><h2 data-title></h2><p data-intro></p></div><button type="button" data-close>×</button></header>
    <div class="safetyCompassBody">
      <div class="safetyCompassConnectivity" data-connectivity></div>
      <div class="safetyCompassModes">
        <button type="button" data-mode="hotel"><strong data-hotel></strong><span data-hotel-hint></span></button>
        <button type="button" data-mode="group"><strong data-group></strong><span data-group-hint></span></button>
      </div>
      <section class="safetyCompassDestination"><span data-destination-label></span><strong data-destination></strong><small data-destination-city></small></section>
      <div class="safetyCompassDial" aria-live="polite">
        <div class="safetyCompassNorth">N</div>
        <div class="safetyCompassArrow" data-arrow><span>➤</span></div>
        <div class="safetyCompassCenter"></div>
      </div>
      <div class="safetyCompassMetrics">
        <div><span data-distance-label></span><strong data-distance>—</strong></div>
        <div><span data-bearing-label></span><strong data-bearing>—</strong></div>
      </div>
      <div class="safetyCompassAccuracy" data-accuracy></div>
      <div class="safetyCompassHint" data-hint></div>
      <div class="safetyCompassArrived" data-arrived hidden><strong></strong><span></span></div>
      <button type="button" class="safetyCompassEnable" data-enable-compass></button>
      <div class="safetyCompassActions">
        <button type="button" data-map></button>
        <button type="button" data-mutawwif hidden></button>
        <button type="button" data-family hidden></button>
      </div>
      <div class="safetyCompassMessage" data-message hidden></div>
      <div class="safetyCompassSafety" data-safety></div>
    </div>
  </article>`;
  document.body.appendChild(overlay);

  let mode: Mode = 'hotel';
  let city: City = currentCity();
  let current: Point | null = readJson<Point | null>('teman-last-location', null);
  let heading: number | null = null;
  let compassEnabled = false;
  let gpsWatch: number | null = null;
  let message = '';
  let lastArrivalBuzz = false;

  const q = <T extends HTMLElement>(selector: string) => overlay.querySelector<T>(selector)!;

  const destination = () => loadPoint(mode, city);
  const destinationLabel = () => {
    const p = profile(); const point = destination();
    if (point?.label) return point.label;
    if (mode === 'hotel') return city === 'madinah' ? (p.hotelMadinah || '') : (p.hotelMakkah || '');
    return [p.groupCode, p.busNumber].filter(Boolean).join(' • ');
  };

  function setMessage(value: string) {
    message = value;
    const node = q<HTMLElement>('[data-message]'); node.hidden = !value; node.textContent = value;
  }

  function renderTrigger() {
    trigger.textContent = COPY[locale()].trigger;
    trigger.hidden = !document.querySelector('.hero');
  }

  function updateGuidance() {
    const t = COPY[locale()]; const dest = destination();
    q<HTMLElement>('[data-destination-label]').textContent = t.destination;
    q<HTMLElement>('[data-destination]').textContent = destinationLabel() || (mode === 'hotel' ? t.noHotel : t.noGroup);
    q<HTMLElement>('[data-destination-city]').textContent = city === 'madinah' ? 'Madinah • المدينة المنورة' : 'Makkah • مكة المكرمة';
    q<HTMLElement>('[data-distance-label]').textContent = t.distance;
    q<HTMLElement>('[data-bearing-label]').textContent = t.bearing;

    const arrow = q<HTMLElement>('[data-arrow]');
    const arrived = q<HTMLElement>('[data-arrived]');
    if (!dest || !current) {
      q<HTMLElement>('[data-distance]').textContent = '—';
      q<HTMLElement>('[data-bearing]').textContent = '—';
      q<HTMLElement>('[data-accuracy]').textContent = current?.accuracy ? `${t.accuracy}: ±${Math.round(current.accuracy)} m` : '';
      q<HTMLElement>('[data-hint]').textContent = dest ? t.finding : t.saveFirst;
      arrow.style.transform = 'rotate(0deg)'; arrow.classList.add('idle'); arrived.hidden = true; lastArrivalBuzz = false;
      return;
    }

    const distance = distanceMeters(current, dest);
    const bearing = bearingDegrees(current, dest);
    const rotation = heading === null ? bearing : normalize(bearing - heading);
    arrow.style.transform = `rotate(${rotation}deg)`; arrow.classList.remove('idle');
    q<HTMLElement>('[data-distance]').textContent = formatDistance(distance);
    q<HTMLElement>('[data-bearing]').textContent = `${Math.round(bearing)}° • ${directionName(bearing, locale())}`;
    q<HTMLElement>('[data-accuracy]').textContent = current.accuracy ? `${t.accuracy}: ±${Math.round(current.accuracy)} m` : '';
    q<HTMLElement>('[data-hint]').textContent = heading === null ? t.northReference : t.turnHint;

    const isArrived = distance <= 60;
    arrived.hidden = !isArrived;
    if (isArrived) {
      arrived.querySelector('strong')!.textContent = t.arrived;
      arrived.querySelector('span')!.textContent = t.arrivedHint;
      if (!lastArrivalBuzz && navigator.vibrate) navigator.vibrate([80, 60, 80]);
    }
    lastArrivalBuzz = isArrived;
  }

  function render() {
    const t = COPY[locale()]; const p = profile();
    overlay.dir = locale() === 'ar' ? 'rtl' : 'ltr';
    q<HTMLElement>('[data-eyebrow]').textContent = t.eyebrow;
    q<HTMLElement>('[data-title]').textContent = t.title;
    q<HTMLElement>('[data-intro]').textContent = t.intro;
    q<HTMLButtonElement>('[data-close]').setAttribute('aria-label', t.close);
    q<HTMLElement>('[data-connectivity]').textContent = `● ${navigator.onLine ? t.online : t.offline}`;
    q<HTMLElement>('[data-connectivity]').className = `safetyCompassConnectivity ${navigator.onLine ? 'online' : 'offline'}`;
    q<HTMLElement>('[data-hotel]').textContent = t.hotel; q<HTMLElement>('[data-hotel-hint]').textContent = t.hotelHint;
    q<HTMLElement>('[data-group]').textContent = t.group; q<HTMLElement>('[data-group-hint]').textContent = t.groupHint;
    overlay.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button => button.classList.toggle('active', button.dataset.mode === mode));
    q<HTMLButtonElement>('[data-enable-compass]').textContent = compassEnabled ? t.compassOn : t.enableCompass;
    q<HTMLButtonElement>('[data-map]').textContent = t.openMap;
    const mutawwif = q<HTMLButtonElement>('[data-mutawwif]'); mutawwif.textContent = t.callMutawwif; mutawwif.hidden = !cleanPhone(p.mutawwifPhone);
    const family = q<HTMLButtonElement>('[data-family]'); family.textContent = t.callFamily; family.hidden = !cleanPhone(p.familyPhone);
    q<HTMLElement>('[data-safety]').textContent = t.safety;
    const messageNode = q<HTMLElement>('[data-message]'); messageNode.hidden = !message; messageNode.textContent = message;
    updateGuidance();
  }

  function onOrientation(raw: Event) {
    const event = raw as CompassEvent;
    let next: number | null = null;
    if (typeof event.webkitCompassHeading === 'number' && Number.isFinite(event.webkitCompassHeading)) next = event.webkitCompassHeading;
    else if (typeof event.alpha === 'number' && Number.isFinite(event.alpha)) next = normalize(360 - event.alpha);
    if (next !== null) { heading = next; updateGuidance(); }
  }

  async function enableCompass() {
    const t = COPY[locale()];
    if (typeof DeviceOrientationEvent === 'undefined') { setMessage(t.compassUnsupported); return; }
    try {
      const Orientation = DeviceOrientationEvent as OrientationConstructor;
      if (typeof Orientation.requestPermission === 'function') {
        const permission = await Orientation.requestPermission();
        if (permission !== 'granted') { setMessage(t.compassDenied); return; }
      }
      window.removeEventListener('deviceorientation', onOrientation as EventListener);
      window.addEventListener('deviceorientation', onOrientation as EventListener, { passive: true });
      compassEnabled = true; setMessage(''); render();
    } catch { setMessage(t.compassDenied); }
  }

  function startGps() {
    const t = COPY[locale()];
    if (!navigator.geolocation) { setMessage(t.gpsUnsupported); return; }
    if (gpsWatch !== null) navigator.geolocation.clearWatch(gpsWatch);
    setMessage(t.finding);
    gpsWatch = navigator.geolocation.watchPosition(position => {
      current = { lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy, timestamp: Date.now() };
      localStorage.setItem('teman-last-location', JSON.stringify(current));
      setMessage(t.gpsReady); updateGuidance();
    }, () => { setMessage(t.gpsError); }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 });
  }

  function stopSensors() {
    if (gpsWatch !== null && navigator.geolocation) navigator.geolocation.clearWatch(gpsWatch);
    gpsWatch = null;
    window.removeEventListener('deviceorientation', onOrientation as EventListener);
    heading = null; compassEnabled = false; lastArrivalBuzz = false;
  }

  function close() {
    overlay.hidden = true; document.body.classList.remove('teman-safety-compass-open'); stopSensors();
  }

  trigger.addEventListener('click', () => {
    city = currentCity(); current = readJson<Point | null>('teman-last-location', null); mode = 'hotel'; message = '';
    overlay.hidden = false; document.body.classList.add('teman-safety-compass-open'); render(); startGps();
  });
  q<HTMLButtonElement>('[data-close]').addEventListener('click', close);
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
  overlay.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button => button.addEventListener('click', () => {
    mode = button.dataset.mode === 'group' ? 'group' : 'hotel'; message = ''; lastArrivalBuzz = false; render();
  }));
  q<HTMLButtonElement>('[data-enable-compass]').addEventListener('click', () => void enableCompass());
  q<HTMLButtonElement>('[data-map]').addEventListener('click', () => { close(); document.querySelector<HTMLButtonElement>('.temanOfflineMapTrigger')?.click(); });
  q<HTMLButtonElement>('[data-mutawwif]').addEventListener('click', () => { const phone = cleanPhone(profile().mutawwifPhone); if (phone) window.location.href = `tel:${phone}`; });
  q<HTMLButtonElement>('[data-family]').addEventListener('click', () => { const phone = cleanPhone(profile().familyPhone); if (phone) window.location.href = `tel:${phone}`; });
  window.addEventListener('online', () => { if (!overlay.hidden) render(); });
  window.addEventListener('offline', () => { if (!overlay.hidden) render(); });
  window.addEventListener('storage', () => { city = currentCity(); if (!overlay.hidden) render(); });
  onTemanUiRefresh(() => { renderTrigger(); if (!overlay.hidden) { city = currentCity(); render(); } });
  renderTrigger();
}
