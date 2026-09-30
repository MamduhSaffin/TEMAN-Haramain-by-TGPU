import QRCode from 'qrcode';
import { onTemanUiRefresh } from './ui-refresh';

type Locale = 'ms' | 'en' | 'ar';
type CardMode = 'status' | 'help';
type Profile = {
  pilgrimName?: string;
  preferredName?: string;
  hotelMakkah?: string;
  hotelMadinah?: string;
  groupCode?: string;
  busNumber?: string;
  familyName?: string;
  familyPhone?: string;
};
type CheckIn = {
  label?: string;
  createdAt?: number;
  pilgrimName?: string;
  hotelName?: string;
  groupCode?: string;
  busNumber?: string;
};

const CHECKINS_KEY = 'teman.family.checkins.v1';

const COPY = {
  ms: {
    short: 'Kad Offline',
    title: 'Kad Kecemasan Offline',
    intro: 'Tunjukkan skrin ini kepada petugas atau orang berdekatan. Kad dan QR ini berfungsi tanpa internet selepas TEMAN dimuatkan pada telefon.',
    close: 'Tutup',
    statusMode: 'STATUS SAYA',
    helpMode: 'SAYA PERLUKAN BANTUAN',
    safeBanner: 'MAKLUMAT JEMAAH',
    helpBanner: '⚠️ SAYA PERLUKAN BANTUAN',
    scan: 'IMBAS QR',
    scanHint: 'QR mengandungi maklumat yang sama pada kad ini. Tiada live GPS.',
    pilgrim: 'JEMAAH', status: 'STATUS', time: 'MASA', hotel: 'HOTEL', groupBus: 'KUMPULAN / BAS', family: 'KELUARGA', phone: 'TELEFON',
    none: 'Belum ada check-in',
    call: '📞 TELEFON KELUARGA',
    copy: 'SALIN MAKLUMAT',
    copied: 'Maklumat kad telah disalin.',
    noPhone: 'Nombor keluarga belum disimpan dalam profil TEMAN.',
    privacy: 'Privasi',
    privacyText: 'Kad ini dijana terus pada telefon. QR tidak mengandungi lokasi GPS langsung dan tidak menghantar data ke internet.',
    helpStatus: 'PERLUKAN BANTUAN / NEED HELP / أحتاج مساعدة',
  },
  en: {
    short: 'Offline Card',
    title: 'Offline Emergency Card',
    intro: 'Show this screen to staff or someone nearby. The card and QR work without internet after TEMAN has loaded on the phone.',
    close: 'Close',
    statusMode: 'MY STATUS',
    helpMode: 'I NEED HELP',
    safeBanner: 'PILGRIM INFORMATION',
    helpBanner: '⚠️ I NEED HELP',
    scan: 'SCAN QR',
    scanHint: 'The QR contains the same information shown on this card. No live GPS.',
    pilgrim: 'PILGRIM', status: 'STATUS', time: 'TIME', hotel: 'HOTEL', groupBus: 'GROUP / BUS', family: 'FAMILY', phone: 'PHONE',
    none: 'No check-in yet',
    call: '📞 CALL FAMILY',
    copy: 'COPY INFORMATION',
    copied: 'Card information copied.',
    noPhone: 'No family phone number is saved in the TEMAN profile.',
    privacy: 'Privacy',
    privacyText: 'This card is generated directly on the phone. The QR contains no live GPS location and sends nothing to the internet.',
    helpStatus: 'NEED HELP / PERLUKAN BANTUAN / أحتاج مساعدة',
  },
  ar: {
    short: 'بطاقة دون إنترنت',
    title: 'بطاقة الطوارئ دون إنترنت',
    intro: 'اعرض هذه الشاشة على الموظف أو أي شخص قريب. تعمل البطاقة ورمز QR دون إنترنت بعد تحميل TEMAN على الهاتف.',
    close: 'إغلاق',
    statusMode: 'حالتي',
    helpMode: 'أحتاج مساعدة',
    safeBanner: 'معلومات الحاج / المعتمر',
    helpBanner: '⚠️ أحتاج مساعدة',
    scan: 'امسح رمز QR',
    scanHint: 'يحتوي الرمز على نفس المعلومات الظاهرة في البطاقة، بدون تتبع GPS مباشر.',
    pilgrim: 'الحاج / المعتمر', status: 'الحالة', time: 'الوقت', hotel: 'الفندق', groupBus: 'المجموعة / الحافلة', family: 'الأسرة', phone: 'الهاتف',
    none: 'لا توجد حالة بعد',
    call: '📞 الاتصال بالأسرة',
    copy: 'نسخ المعلومات',
    copied: 'تم نسخ معلومات البطاقة.',
    noPhone: 'رقم الأسرة غير محفوظ في ملف TEMAN.',
    privacy: 'الخصوصية',
    privacyText: 'يتم إنشاء هذه البطاقة على الهاتف مباشرة. لا يحتوي QR على موقع GPS مباشر ولا يرسل أي بيانات إلى الإنترنت.',
    helpStatus: 'أحتاج مساعدة / NEED HELP / PERLUKAN BANTUAN',
  },
} as const;

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
function latestCheckIn(): CheckIn | null { return readJson<CheckIn[]>(CHECKINS_KEY, [])[0] || null; }
function currentHotel(p: Profile): string {
  return localStorage.getItem('teman-city') === 'madinah' ? (p.hotelMadinah || '') : (p.hotelMakkah || '');
}
function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c] || c));
}
function formatTime(value?: number): string {
  if (!value) return '—';
  const lang = locale() === 'ar' ? 'ar-SA' : locale() === 'en' ? 'en-GB' : 'ms-MY';
  return new Date(value).toLocaleString(lang, { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
}
async function copyText(text: string) {
  if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return; }
  const area = document.createElement('textarea');
  area.value = text; area.style.position = 'fixed'; area.style.opacity = '0'; document.body.appendChild(area); area.select(); document.execCommand('copy'); area.remove();
}

function cardData(mode: CardMode) {
  const p = profile();
  const latest = latestCheckIn();
  const t = COPY[locale()];
  const name = latest?.pilgrimName || p.pilgrimName || p.preferredName || 'TEMAN Pilgrim';
  const status = mode === 'help' ? t.helpStatus : (latest?.label || t.none);
  const hotel = latest?.hotelName || currentHotel(p);
  const group = latest?.groupCode || p.groupCode || '';
  const bus = latest?.busNumber || p.busNumber || '';
  const family = p.familyName || '';
  const phone = (p.familyPhone || '').replace(/[^\d+]/g, '');
  const createdAt = latest?.createdAt;
  return { name, status, hotel, group, bus, family, phone, createdAt };
}

function qrPayload(mode: CardMode): string {
  const d = cardData(mode);
  return [
    'TEMAN Haramain — OFFLINE EMERGENCY CARD',
    `NAME: ${d.name}`,
    `STATUS: ${d.status}`,
    d.createdAt ? `TIME: ${new Date(d.createdAt).toISOString()}` : '',
    d.hotel ? `HOTEL: ${d.hotel}` : '',
    d.group || d.bus ? `GROUP/BUS: ${d.group || '-'} / ${d.bus || '-'}` : '',
    d.family ? `FAMILY: ${d.family}` : '',
    d.phone ? `TEL: ${d.phone}` : '',
    'NO LIVE GPS / لا يوجد تتبع مباشر',
  ].filter(Boolean).join('\n');
}

export function initOfflineEmergencyCard() {
  if (document.querySelector('.temanOfflineCardTrigger')) return;

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'temanOfflineCardTrigger';
  trigger.hidden = true;
  document.body.appendChild(trigger);

  const overlay = document.createElement('section');
  overlay.className = 'temanOfflineCardOverlay';
  overlay.hidden = true;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  document.body.appendChild(overlay);

  let mode: CardMode = 'status';
  let message = '';
  let renderToken = 0;

  const t = () => COPY[locale()];

  function renderTrigger() {
    const onHome = Boolean(document.querySelector('.hero'));
    trigger.hidden = !onHome;
    if (!onHome) return;
    trigger.textContent = `🪪 ${t().short}`;
  }

  async function renderOverlay() {
    const token = ++renderToken;
    const c = t();
    const d = cardData(mode);
    const isHelp = mode === 'help';
    const payload = qrPayload(mode);

    overlay.innerHTML = `<div class="temanOfflineCardPanel ${isHelp ? 'isHelp' : ''}">
      <header>
        <div><span>TEMAN Haramain</span><h2>${c.title}</h2><p>${c.intro}</p></div>
        <button type="button" data-close aria-label="${c.close}">×</button>
      </header>
      <div class="offlineCardBody">
        ${message ? `<div class="offlineCardMessage">${escapeHtml(message)}</div>` : ''}
        <div class="offlineCardModeSwitch" role="group" aria-label="${c.title}">
          <button type="button" data-mode="status" class="${mode === 'status' ? 'active' : ''}">${c.statusMode}</button>
          <button type="button" data-mode="help" class="help ${mode === 'help' ? 'active' : ''}">${c.helpMode}</button>
        </div>
        <section class="offlineIdentityCard">
          <div class="offlineEmergencyBanner">${isHelp ? c.helpBanner : c.safeBanner}</div>
          <div class="offlineName">${escapeHtml(d.name)}</div>
          <div class="offlineStatus">${escapeHtml(d.status)}</div>
          <div class="offlineInfoGrid">
            <div><span>${c.time}</span><strong>${formatTime(d.createdAt)}</strong></div>
            <div><span>${c.hotel}</span><strong>${escapeHtml(d.hotel || '—')}</strong></div>
            <div><span>${c.groupBus}</span><strong>${escapeHtml(`${d.group || '—'} • ${d.bus || '—'}`)}</strong></div>
            <div><span>${c.family}</span><strong>${escapeHtml(d.family || '—')}</strong></div>
            <div><span>${c.phone}</span><strong>${escapeHtml(d.phone || '—')}</strong></div>
          </div>
          <div class="offlineQrWrap">
            <div class="offlineQrPlaceholder" data-qr>QR</div>
            <div><strong>${c.scan}</strong><p>${c.scanHint}</p></div>
          </div>
        </section>
        <div class="offlineCardActions">
          <button type="button" data-call ${d.phone ? '' : 'disabled'}>${c.call}</button>
          <button type="button" data-copy>${c.copy}</button>
        </div>
        <section class="offlineCardPrivacy"><strong>🔒 ${c.privacy}</strong><p>${c.privacyText}</p></section>
      </div>
    </div>`;

    overlay.querySelector<HTMLButtonElement>('[data-close]')?.addEventListener('click', closeOverlay);
    overlay.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button => button.addEventListener('click', () => {
      mode = button.dataset.mode === 'help' ? 'help' : 'status';
      message = '';
      void renderOverlay();
    }));
    overlay.querySelector<HTMLButtonElement>('[data-call]')?.addEventListener('click', () => {
      const phone = cardData(mode).phone;
      if (!phone) { message = t().noPhone; void renderOverlay(); return; }
      window.location.href = `tel:${phone}`;
    });
    overlay.querySelector<HTMLButtonElement>('[data-copy]')?.addEventListener('click', () => {
      void copyText(payload).then(() => { message = t().copied; void renderOverlay(); });
    });

    try {
      const dataUrl = await QRCode.toDataURL(payload, { errorCorrectionLevel: 'M', margin: 1, width: 360 });
      if (token !== renderToken || overlay.hidden) return;
      const qr = overlay.querySelector<HTMLElement>('[data-qr]');
      if (qr) qr.innerHTML = `<img src="${dataUrl}" alt="${escapeHtml(c.scan)}" width="240" height="240">`;
    } catch {
      const qr = overlay.querySelector<HTMLElement>('[data-qr]');
      if (qr) qr.textContent = 'QR';
    }
  }

  function closeOverlay() {
    overlay.hidden = true;
    document.body.classList.remove('teman-offline-card-open');
    trigger.focus();
  }

  trigger.addEventListener('click', () => {
    mode = 'status'; message = '';
    overlay.hidden = false;
    document.body.classList.add('teman-offline-card-open');
    void renderOverlay().then(() => overlay.querySelector<HTMLButtonElement>('[data-close]')?.focus());
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !overlay.hidden) closeOverlay(); });
  window.addEventListener('storage', event => {
    if ([CHECKINS_KEY, 'teman-profile', 'teman-city'].includes(event.key || '')) {
      renderTrigger();
      if (!overlay.hidden) void renderOverlay();
    }
  });
  onTemanUiRefresh(() => {
    renderTrigger();
    if (!overlay.hidden) void renderOverlay();
  });

  renderTrigger();
}
