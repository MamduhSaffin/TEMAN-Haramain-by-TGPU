import { onTemanUiRefresh, requestTemanUiRefresh } from './ui-refresh';

type Locale = 'ms' | 'en' | 'ar';

type Profile = {
  pilgrimName?: string;
  preferredName?: string;
  hotelMakkah?: string;
  hotelMadinah?: string;
  hotelAddressMakkah?: string;
  hotelAddressMadinah?: string;
  groupCode?: string;
  busNumber?: string;
  mutawwifName?: string;
  mutawwifPhone?: string;
  familyName?: string;
  familyPhone?: string;
};

type StoredLocation = { lat: number; lng: number; accuracy?: number; timestamp?: number };

const COPY = {
  ms: {
    title: 'NOMBOR KECEMASAN SAUDI', intro: 'Untuk kecemasan sebenar, hubungi nombor rasmi Saudi.',
    unified: '911 • Kecemasan Bersepadu', unifiedHint: 'Wilayah Makkah', ambulance: '997 • Ambulans', ambulanceHint: 'Saudi Red Crescent',
    police: '999 • Polis', policeHint: 'Rondaan keselamatan', civil: '998 • Pertahanan Awam', civilHint: 'Kebakaran / penyelamatan',
    health: '937 • Kementerian Kesihatan', healthHint: 'Sokongan kesihatan', official: 'Nombor rasmi kerajaan Saudi',
    tools: 'ALAT PENTING JEMAAH', toolsHint: 'Hubungi keluarga, simpan titik berkumpul dan tunjuk ID dengan cepat.',
    waFamily: 'WHATSAPP KELUARGA', waGuide: 'WHATSAPP MUTAWWIF', saveMeeting: 'SIMPAN TITIK BERKUMPUL', openMeeting: 'BUKA TITIK BERKUMPUL',
    shareMeeting: 'KONGSI TITIK BERKUMPUL', showId: 'TUNJUK ID JEMAAH', lowPower: 'MOD JIMAT BATERI', lowPowerOn: 'MOD JIMAT BATERI AKTIF',
    noPhone: 'Nombor telefon belum disimpan dalam Profil.', locating: 'Mendapatkan lokasi…', meetingSaved: 'Titik berkumpul disimpan pada telefon ini.',
    noLocation: 'Lokasi belum tersedia. Benarkan GPS dan cuba lagi.', close: 'TUTUP', copyId: 'SALIN ID', copied: 'DISALIN',
    idTitle: 'ID JEMAAH TEMAN', privacy: 'Maklumat ini hanya dipaparkan daripada data yang disimpan pada telefon.',
    helpText: 'Assalamualaikum. Saya perlukan bantuan. Ini maklumat TEMAN saya.', meetingText: 'Ini titik berkumpul saya.',
  },
  en: {
    title: 'SAUDI EMERGENCY NUMBERS', intro: 'For a real emergency, call the official Saudi numbers.',
    unified: '911 • Unified Emergency', unifiedHint: 'Makkah Region', ambulance: '997 • Ambulance', ambulanceHint: 'Saudi Red Crescent',
    police: '999 • Police', policeHint: 'Security patrols', civil: '998 • Civil Defense', civilHint: 'Fire / rescue',
    health: '937 • Ministry of Health', healthHint: 'Health support', official: 'Official Saudi government numbers',
    tools: 'PILGRIM FIELD TOOLS', toolsHint: 'Message family, save a meeting point, and show your pilgrim ID quickly.',
    waFamily: 'WHATSAPP FAMILY', waGuide: 'WHATSAPP MUTAWWIF', saveMeeting: 'SAVE MEETING POINT', openMeeting: 'OPEN MEETING POINT',
    shareMeeting: 'SHARE MEETING POINT', showId: 'SHOW PILGRIM ID', lowPower: 'LOW POWER MODE', lowPowerOn: 'LOW POWER MODE ON',
    noPhone: 'Phone number is not saved in Profile yet.', locating: 'Getting location…', meetingSaved: 'Meeting point saved on this phone.',
    noLocation: 'Location is not available yet. Allow GPS and try again.', close: 'CLOSE', copyId: 'COPY ID', copied: 'COPIED',
    idTitle: 'TEMAN PILGRIM ID', privacy: 'This only displays information already stored on this phone.',
    helpText: 'Assalamualaikum. I need help. These are my TEMAN details.', meetingText: 'This is my meeting point.',
  },
  ar: {
    title: 'أرقام الطوارئ في السعودية', intro: 'في حالة الطوارئ الحقيقية اتصل بالأرقام الرسمية السعودية.',
    unified: '911 • الطوارئ الموحدة', unifiedHint: 'منطقة مكة المكرمة', ambulance: '997 • الإسعاف', ambulanceHint: 'الهلال الأحمر السعودي',
    police: '999 • الشرطة', policeHint: 'الدوريات الأمنية', civil: '998 • الدفاع المدني', civilHint: 'الحريق / الإنقاذ',
    health: '937 • وزارة الصحة', healthHint: 'الدعم الصحي', official: 'أرقام رسمية حكومية سعودية',
    tools: 'أدوات مهمة للحاج والمعتمر', toolsHint: 'تواصل مع الأسرة واحفظ نقطة اللقاء واعرض بطاقة التعريف بسرعة.',
    waFamily: 'واتساب الأسرة', waGuide: 'واتساب المطوف', saveMeeting: 'حفظ نقطة اللقاء', openMeeting: 'فتح نقطة اللقاء',
    shareMeeting: 'مشاركة نقطة اللقاء', showId: 'عرض بطاقة الحاج', lowPower: 'وضع توفير البطارية', lowPowerOn: 'وضع توفير البطارية مفعّل',
    noPhone: 'رقم الهاتف غير محفوظ في الملف.', locating: 'جارٍ تحديد الموقع…', meetingSaved: 'تم حفظ نقطة اللقاء على هذا الهاتف.',
    noLocation: 'الموقع غير متاح. اسمح باستخدام GPS وحاول مرة أخرى.', close: 'إغلاق', copyId: 'نسخ البطاقة', copied: 'تم النسخ',
    idTitle: 'بطاقة TEMAN للحاج', privacy: 'تُعرض هنا فقط المعلومات المحفوظة على هذا الهاتف.',
    helpText: 'السلام عليكم. أحتاج إلى مساعدة. هذه بياناتي في TEMAN.', meetingText: 'هذه نقطة اللقاء الخاصة بي.',
  },
} as const;

function locale(): Locale {
  const lang = document.documentElement.lang.toLowerCase();
  if (lang.startsWith('ar')) return 'ar';
  if (lang.startsWith('en')) return 'en';
  return 'ms';
}

function city() { return localStorage.getItem('teman-city') === 'madinah' ? 'madinah' : 'makkah'; }
function dial(number: string) { window.location.href = `tel:${number}`; }
function loadProfile(): Profile { try { return JSON.parse(localStorage.getItem('teman-profile') || '{}') as Profile; } catch { return {}; } }
function loadLocation(key: string): StoredLocation | null {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null') as StoredLocation | null;
    return value && Number.isFinite(value.lat) && Number.isFinite(value.lng) ? value : null;
  } catch { return null; }
}
function mapsUrl(loc: StoredLocation) { return `https://www.google.com/maps/search/?api=1&query=${loc.lat.toFixed(6)},${loc.lng.toFixed(6)}`; }
function normalizePhone(value: string | undefined, defaultCountry: '60' | '966') {
  if (!value) return '';
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('60') || digits.startsWith('966')) return digits;
  if (digits.startsWith('0')) digits = digits.slice(1);
  return `${defaultCountry}${digits}`;
}
async function copyText(text: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const field = document.createElement('textarea'); field.value = text; field.style.position = 'fixed'; field.style.opacity = '0';
  document.body.appendChild(field); field.select(); document.execCommand('copy'); field.remove();
}

export function initSaudiEmergency() {
  if (!document.getElementById('teman-field-tools-style')) {
    const style = document.createElement('style');
    style.id = 'teman-field-tools-style';
    style.textContent = `
      .fieldTools{margin:16px 0;padding:18px;border:2px solid #c9ddcf;border-radius:24px;background:#f7fbf8}
      .fieldToolsHead strong,.fieldToolsHead span{display:block}.fieldToolsHead strong{font-size:18px;color:#0b5d3b}.fieldToolsHead span{margin-top:5px;color:#5b7063;font-size:14px;line-height:1.45}
      .fieldToolsGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}.fieldToolsGrid button{min-height:68px;border:2px solid #bfd7c6;border-radius:17px;background:#fff;color:#174b34;font-weight:900;padding:12px;cursor:pointer}
      .fieldToolsGrid button:disabled{opacity:.5;cursor:not-allowed}.fieldStatus{min-height:20px;margin:10px 0 0;color:#52695d;font-size:13px;font-weight:700}
      .pilgrimIdOverlay{position:fixed;inset:0;z-index:1200;background:#f3f8f4;padding:18px;overflow:auto}.pilgrimIdCard{width:min(760px,100%);margin:0 auto;background:#fff;border:3px solid #0b5d3b;border-radius:28px;padding:24px;box-shadow:0 18px 50px rgba(20,60,43,.18)}
      .pilgrimIdCard h2{margin:0;color:#0b5d3b;font-size:28px}.pilgrimIdCard .idName{font-size:clamp(30px,7vw,52px);font-weight:950;margin:22px 0;color:#173f2e}.pilgrimIdFacts{display:grid;grid-template-columns:1fr 1fr;gap:10px}.pilgrimIdFacts div{padding:14px;border-radius:16px;background:#eef6f0}.pilgrimIdFacts b,.pilgrimIdFacts span{display:block}.pilgrimIdFacts b{font-size:12px;color:#64776d}.pilgrimIdFacts span{margin-top:4px;font-size:18px;font-weight:850;overflow-wrap:anywhere}.pilgrimIdActions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}.pilgrimIdActions button{min-height:56px;border:0;border-radius:16px;background:#0b5d3b;color:#fff;font-weight:900}.pilgrimIdActions button:last-child{background:#edf3ef;color:#234b37}.pilgrimIdCard small{display:block;margin-top:14px;color:#687a70}
      body.temanLowPower *,body.temanLowPower *::before,body.temanLowPower *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}body.temanLowPower .safetyDock,body.temanLowPower .installTemanBanner{backdrop-filter:none!important}body.temanLowPower .page{background-image:none!important}
      @media(max-width:540px){.fieldToolsGrid,.pilgrimIdFacts,.pilgrimIdActions{grid-template-columns:1fr}.pilgrimIdCard{padding:18px}}
      [dir='rtl'] .fieldToolsHead,[dir='rtl'] .pilgrimIdCard{text-align:right}
    `;
    document.head.appendChild(style);
  }

  const setLowPower = (enabled: boolean) => {
    document.body.classList.toggle('temanLowPower', enabled);
    localStorage.setItem('teman-low-power', enabled ? '1' : '0');
  };
  setLowPower(localStorage.getItem('teman-low-power') === '1');

  let statusMessage = '';

  const profileSummary = () => {
    const p = loadProfile(); const c = city(); const t = COPY[locale()];
    const hotel = c === 'makkah' ? p.hotelMakkah : p.hotelMadinah;
    const address = c === 'makkah' ? p.hotelAddressMakkah : p.hotelAddressMadinah;
    return [t.idTitle, p.pilgrimName || p.preferredName || '-', `${c === 'makkah' ? 'Makkah' : 'Madinah'}: ${hotel || '-'}`, address || '', `Group: ${p.groupCode || '-'}`, `Bus: ${p.busNumber || '-'}`, `Mutawwif: ${p.mutawwifName || '-'} ${p.mutawwifPhone || ''}`, `Family: ${p.familyName || '-'} ${p.familyPhone || ''}`].filter(Boolean).join('\n');
  };

  const openId = () => {
    const p = loadProfile(); const c = city(); const t = COPY[locale()];
    const overlay = document.createElement('section'); overlay.className = 'pilgrimIdOverlay'; overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true');
    const hotel = c === 'makkah' ? p.hotelMakkah : p.hotelMadinah; const address = c === 'makkah' ? p.hotelAddressMakkah : p.hotelAddressMadinah;
    overlay.innerHTML = `<div class="pilgrimIdCard"><h2>${t.idTitle}</h2><div class="idName"></div><div class="pilgrimIdFacts"><div><b>City / المدينة</b><span>${c === 'makkah' ? 'Makkah' : 'Madinah'}</span></div><div><b>Hotel / الفندق</b><span></span></div><div><b>Address / العنوان</b><span></span></div><div><b>Group / المجموعة</b><span></span></div><div><b>Bus / الحافلة</b><span></span></div><div><b>Mutawwif / المطوف</b><span></span></div><div><b>Family / الأسرة</b><span></span></div></div><div class="pilgrimIdActions"><button type="button" data-copy-id>${t.copyId}</button><button type="button" data-close-id>${t.close}</button></div><small>${t.privacy}</small></div>`;
    overlay.querySelector<HTMLElement>('.idName')!.textContent = p.pilgrimName || p.preferredName || 'TEMAN Haramain';
    const spans = overlay.querySelectorAll<HTMLElement>('.pilgrimIdFacts span');
    spans[1].textContent = hotel || '-'; spans[2].textContent = address || '-'; spans[3].textContent = p.groupCode || '-'; spans[4].textContent = p.busNumber || '-'; spans[5].textContent = `${p.mutawwifName || '-'} ${p.mutawwifPhone || ''}`.trim(); spans[6].textContent = `${p.familyName || '-'} ${p.familyPhone || ''}`.trim();
    overlay.querySelector<HTMLButtonElement>('[data-close-id]')!.addEventListener('click', () => overlay.remove());
    overlay.querySelector<HTMLButtonElement>('[data-copy-id]')!.addEventListener('click', async e => { const b = e.currentTarget as HTMLButtonElement; await copyText(profileSummary()); b.textContent = t.copied; });
    document.body.appendChild(overlay);
  };

  const openWhatsApp = (kind: 'family' | 'guide') => {
    const p = loadProfile(); const t = COPY[locale()]; const raw = kind === 'family' ? p.familyPhone : p.mutawwifPhone;
    const phone = normalizePhone(raw, kind === 'family' ? '60' : '966');
    if (!phone) { statusMessage = t.noPhone; render(); return; }
    const loc = loadLocation('teman-last-location');
    const message = `${t.helpText}${loc ? `\n${mapsUrl(loc)}` : ''}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const saveMeetingPoint = () => {
    const t = COPY[locale()];
    const existing = loadLocation('teman-last-location');
    if (existing) { localStorage.setItem('teman-meeting-point', JSON.stringify(existing)); statusMessage = t.meetingSaved; render(); return; }
    if (!navigator.geolocation) { statusMessage = t.noLocation; render(); return; }
    statusMessage = t.locating; render();
    navigator.geolocation.getCurrentPosition(pos => {
      const point: StoredLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, timestamp: Date.now() };
      localStorage.setItem('teman-meeting-point', JSON.stringify(point)); statusMessage = t.meetingSaved; render();
    }, () => { statusMessage = t.noLocation; render(); }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 120000 });
  };

  const shareMeeting = async () => {
    const point = loadLocation('teman-meeting-point'); const t = COPY[locale()];
    if (!point) { statusMessage = t.noLocation; render(); return; }
    const text = `${t.meetingText}\n${mapsUrl(point)}`;
    try { if (navigator.share) await navigator.share({ title: 'TEMAN Meeting Point', text, url: mapsUrl(point) }); else await copyText(text); } catch { /* cancelled */ }
  };

  const render = () => {
    const page = document.querySelector<HTMLElement>('.emergencyPage'); const choices = page?.querySelector<HTMLElement>('.emergencyChoices');
    if (!page || !choices) return;

    let section = page.querySelector<HTMLElement>('.saudiEmergencyCard');
    if (!section) {
      section = document.createElement('section'); section.className = 'saudiEmergencyCard';
      section.innerHTML = `<div class="saudiEmergencyHead"><div><strong data-title></strong><span data-intro></span></div><b aria-hidden="true">☎</b></div><div class="saudiEmergencyGrid"><button type="button" data-number="911" data-service="unified"><strong></strong><span></span></button><button type="button" data-number="997" data-service="ambulance"><strong></strong><span></span></button><button type="button" data-number="999" data-service="police"><strong></strong><span></span></button><button type="button" data-number="998" data-service="civil"><strong></strong><span></span></button><button type="button" data-number="937" data-service="health"><strong></strong><span></span></button></div><small data-official></small>`;
      choices.insertAdjacentElement('afterend', section);
      section.querySelectorAll<HTMLButtonElement>('[data-number]').forEach(button => button.addEventListener('click', () => dial(button.dataset.number || '')));
    }

    const t = COPY[locale()]; section.querySelector<HTMLElement>('[data-title]')!.textContent = t.title; section.querySelector<HTMLElement>('[data-intro]')!.textContent = t.intro; section.querySelector<HTMLElement>('[data-official]')!.textContent = t.official;
    (['unified', 'ambulance', 'police', 'civil', 'health'] as const).forEach(service => { const b = section!.querySelector<HTMLButtonElement>(`[data-service="${service}"]`)!; b.querySelector('strong')!.textContent = t[service]; b.querySelector('span')!.textContent = t[`${service}Hint` as keyof typeof t]; });
    section.querySelector<HTMLButtonElement>('[data-service="unified"]')!.hidden = false;

    let tools = page.querySelector<HTMLElement>('.fieldTools');
    if (!tools) {
      tools = document.createElement('section'); tools.className = 'fieldTools';
      tools.innerHTML = `<div class="fieldToolsHead"><strong data-ft-title></strong><span data-ft-hint></span></div><div class="fieldToolsGrid"><button type="button" data-wa-family></button><button type="button" data-wa-guide></button><button type="button" data-save-meeting></button><button type="button" data-open-meeting></button><button type="button" data-share-meeting></button><button type="button" data-show-id></button><button type="button" data-low-power></button></div><p class="fieldStatus" data-ft-status aria-live="polite"></p>`;
      section.insertAdjacentElement('afterend', tools);
      tools.querySelector<HTMLButtonElement>('[data-wa-family]')!.addEventListener('click', () => openWhatsApp('family'));
      tools.querySelector<HTMLButtonElement>('[data-wa-guide]')!.addEventListener('click', () => openWhatsApp('guide'));
      tools.querySelector<HTMLButtonElement>('[data-save-meeting]')!.addEventListener('click', saveMeetingPoint);
      tools.querySelector<HTMLButtonElement>('[data-open-meeting]')!.addEventListener('click', () => { const p = loadLocation('teman-meeting-point'); if (p) window.open(mapsUrl(p), '_blank', 'noopener,noreferrer'); });
      tools.querySelector<HTMLButtonElement>('[data-share-meeting]')!.addEventListener('click', shareMeeting);
      tools.querySelector<HTMLButtonElement>('[data-show-id]')!.addEventListener('click', openId);
      tools.querySelector<HTMLButtonElement>('[data-low-power]')!.addEventListener('click', () => { setLowPower(!document.body.classList.contains('temanLowPower')); render(); });
    }

    tools.querySelector<HTMLElement>('[data-ft-title]')!.textContent = t.tools; tools.querySelector<HTMLElement>('[data-ft-hint]')!.textContent = t.toolsHint; tools.querySelector<HTMLElement>('[data-ft-status]')!.textContent = statusMessage;
    tools.querySelector<HTMLButtonElement>('[data-wa-family]')!.textContent = t.waFamily; tools.querySelector<HTMLButtonElement>('[data-wa-guide]')!.textContent = t.waGuide; tools.querySelector<HTMLButtonElement>('[data-save-meeting]')!.textContent = t.saveMeeting; tools.querySelector<HTMLButtonElement>('[data-open-meeting]')!.textContent = t.openMeeting; tools.querySelector<HTMLButtonElement>('[data-share-meeting]')!.textContent = t.shareMeeting; tools.querySelector<HTMLButtonElement>('[data-show-id]')!.textContent = t.showId; tools.querySelector<HTMLButtonElement>('[data-low-power]')!.textContent = document.body.classList.contains('temanLowPower') ? t.lowPowerOn : t.lowPower;
    const meeting = loadLocation('teman-meeting-point'); tools.querySelector<HTMLButtonElement>('[data-open-meeting]')!.disabled = !meeting; tools.querySelector<HTMLButtonElement>('[data-share-meeting]')!.disabled = !meeting;
  };

  document.addEventListener('click', event => {
    const target = event.target as HTMLElement;
    if (target.closest('.citySwitch')) requestTemanUiRefresh();
  });
  onTemanUiRefresh(render);
  window.setTimeout(render, 0);
}
