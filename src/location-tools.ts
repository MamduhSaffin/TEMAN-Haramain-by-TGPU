import { onTemanUiRefresh } from './ui-refresh';

type Locale = 'ms' | 'en' | 'ar';

type StoredLocation = {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
};

const COPY = {
  ms: {
    title: 'LOKASI SAYA',
    intro: 'Jika sesat, dapatkan lokasi GPS dan kongsi kepada keluarga atau mutawwif.',
    get: 'DAPATKAN LOKASI SAYA',
    locating: 'MENCARI LOKASI…',
    share: 'KONGSI LOKASI',
    map: 'BUKA PETA',
    copy: 'SALIN LOKASI',
    copied: 'LOKASI DISALIN',
    unavailable: 'Lokasi GPS tidak disokong pada peranti ini.',
    denied: 'Akses lokasi tidak dibenarkan. Benarkan Location untuk TEMAN dalam tetapan pelayar.',
    timeout: 'Lokasi mengambil masa terlalu lama. Cuba lagi di kawasan terbuka.',
    error: 'Lokasi tidak dapat diperoleh. Cuba lagi.',
    last: 'Lokasi GPS terakhir',
    accuracy: 'Ketepatan anggaran',
    updated: 'Dikemas kini',
    privacy: 'TEMAN hanya meminta lokasi apabila anda menekan butang. Lokasi terakhir disimpan pada telefon ini.',
    shareText: 'Ini lokasi GPS saya sekarang. Tolong bantu saya.',
  },
  en: {
    title: 'MY LOCATION',
    intro: 'If you are lost, get your GPS location and share it with family or your mutawwif.',
    get: 'GET MY LOCATION',
    locating: 'FINDING LOCATION…',
    share: 'SHARE LOCATION',
    map: 'OPEN MAP',
    copy: 'COPY LOCATION',
    copied: 'LOCATION COPIED',
    unavailable: 'GPS location is not supported on this device.',
    denied: 'Location permission was denied. Allow Location for TEMAN in your browser settings.',
    timeout: 'Location took too long. Try again in a more open area.',
    error: 'Location could not be obtained. Please try again.',
    last: 'Last saved GPS location',
    accuracy: 'Approximate accuracy',
    updated: 'Updated',
    privacy: 'TEMAN only requests location when you tap the button. The last location stays on this phone.',
    shareText: 'This is my current GPS location. Please help me.',
  },
  ar: {
    title: 'موقعي',
    intro: 'إذا ضللت الطريق، حدّد موقعك عبر GPS وشاركه مع الأسرة أو مسؤول المجموعة.',
    get: 'تحديد موقعي',
    locating: 'جارٍ تحديد الموقع…',
    share: 'مشاركة الموقع',
    map: 'فتح الخريطة',
    copy: 'نسخ الموقع',
    copied: 'تم نسخ الموقع',
    unavailable: 'تحديد الموقع غير مدعوم على هذا الجهاز.',
    denied: 'لم يتم السماح بالوصول إلى الموقع. اسمح لـ TEMAN باستخدام الموقع من إعدادات المتصفح.',
    timeout: 'استغرق تحديد الموقع وقتًا طويلًا. حاول مرة أخرى في مكان مفتوح.',
    error: 'تعذر تحديد الموقع. حاول مرة أخرى.',
    last: 'آخر موقع GPS محفوظ',
    accuracy: 'الدقة التقريبية',
    updated: 'آخر تحديث',
    privacy: 'يطلب TEMAN موقعك فقط عند الضغط على الزر. يبقى آخر موقع محفوظًا على هذا الهاتف.',
    shareText: 'هذا موقعي الحالي عبر GPS. الرجاء مساعدتي.',
  },
} as const;

function locale(): Locale {
  const lang = document.documentElement.lang.toLowerCase();
  if (lang.startsWith('ar')) return 'ar';
  if (lang.startsWith('en')) return 'en';
  return 'ms';
}

function loadLocation(): StoredLocation | null {
  try {
    const value = JSON.parse(localStorage.getItem('teman-last-location') || 'null') as StoredLocation | null;
    if (!value || !Number.isFinite(value.lat) || !Number.isFinite(value.lng) || !Number.isFinite(value.timestamp)) return null;
    return value;
  } catch {
    return null;
  }
}

function mapsUrl(location: StoredLocation) {
  return `https://www.google.com/maps/search/?api=1&query=${location.lat.toFixed(6)},${location.lng.toFixed(6)}`;
}

function formatDate(timestamp: number, lang: Locale) {
  try {
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : lang === 'ms' ? 'ms-MY' : 'en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(timestamp));
  } catch {
    return new Date(timestamp).toLocaleString();
  }
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  document.execCommand('copy');
  field.remove();
}

export function initLocationTools() {
  let current = loadLocation();
  let locating = false;
  let statusMessage = '';
  let copied = false;

  const locationText = (location: StoredLocation) => {
    const t = COPY[locale()];
    return [
      'TEMAN Haramain by TGPU',
      t.shareText,
      `GPS: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
      `${t.accuracy}: ±${Math.round(location.accuracy)} m`,
      `${t.updated}: ${formatDate(location.timestamp, locale())}`,
      mapsUrl(location),
    ].join('\n');
  };

  const updateEmergencyFact = () => {
    const facts = document.querySelector<HTMLElement>('.emergencyPage .facts');
    if (!facts) return;
    const existing = facts.querySelector<HTMLElement>('.temanLocationFact');
    if (!current) {
      existing?.remove();
      return;
    }
    const fact = existing || document.createElement('div');
    fact.className = 'temanLocationFact';
    fact.innerHTML = '';
    const label = document.createElement('span');
    label.textContent = 'GPS / الموقع';
    const strong = document.createElement('strong');
    strong.textContent = `${current.lat.toFixed(6)}, ${current.lng.toFixed(6)}`;
    const small = document.createElement('small');
    const t = COPY[locale()];
    small.textContent = `${t.last} • ±${Math.round(current.accuracy)} m • ${formatDate(current.timestamp, locale())}`;
    fact.append(label, strong, small);
    if (!existing) facts.appendChild(fact);
  };

  const render = () => {
    const page = document.querySelector<HTMLElement>('.emergencyPage');
    const helpCard = page?.querySelector<HTMLElement>('.helpCard');
    if (!page || !helpCard) return;

    let card = page.querySelector<HTMLElement>('.locationToolCard');
    if (!card) {
      card = document.createElement('section');
      card.className = 'locationToolCard';
      card.innerHTML = `
        <div class="locationToolHead"><div><strong data-title></strong><span data-intro></span></div><b aria-hidden="true">⌖</b></div>
        <button type="button" class="locationPrimary" data-get></button>
        <div class="locationReadout" data-readout hidden>
          <span data-last-label></span>
          <strong data-coords></strong>
          <small data-meta></small>
        </div>
        <div class="locationActions" data-actions hidden>
          <button type="button" data-share></button>
          <button type="button" data-map></button>
          <button type="button" data-copy></button>
        </div>
        <p class="locationStatus" data-status aria-live="polite"></p>
        <p class="locationPrivacy" data-privacy></p>
      `;
      helpCard.parentElement?.insertBefore(card, helpCard);

      card.querySelector<HTMLButtonElement>('[data-get]')?.addEventListener('click', () => {
        const t = COPY[locale()];
        copied = false;
        statusMessage = '';
        if (!navigator.geolocation) {
          statusMessage = t.unavailable;
          render();
          return;
        }
        locating = true;
        render();
        navigator.geolocation.getCurrentPosition(
          position => {
            current = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: Date.now(),
            };
            localStorage.setItem('teman-last-location', JSON.stringify(current));
            locating = false;
            statusMessage = '';
            render();
            updateEmergencyFact();
          },
          error => {
            locating = false;
            statusMessage = error.code === error.PERMISSION_DENIED ? t.denied : error.code === error.TIMEOUT ? t.timeout : t.error;
            render();
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 120000 },
        );
      });

      card.querySelector<HTMLButtonElement>('[data-share]')?.addEventListener('click', async () => {
        if (!current) return;
        const text = locationText(current);
        try {
          if (navigator.share) await navigator.share({ title: 'TEMAN Haramain — GPS', text, url: mapsUrl(current) });
          else {
            await copyText(text);
            copied = true;
            render();
          }
        } catch {
          // The user may cancel the native share sheet. Leave the screen unchanged.
        }
      });

      card.querySelector<HTMLButtonElement>('[data-map]')?.addEventListener('click', () => {
        if (!current) return;
        window.open(mapsUrl(current), '_blank', 'noopener,noreferrer');
      });

      card.querySelector<HTMLButtonElement>('[data-copy]')?.addEventListener('click', async () => {
        if (!current) return;
        try {
          await copyText(locationText(current));
          copied = true;
          render();
          window.setTimeout(() => { copied = false; render(); }, 1800);
        } catch {
          copied = false;
        }
      });
    }

    const t = COPY[locale()];
    card.querySelector<HTMLElement>('[data-title]')!.textContent = t.title;
    card.querySelector<HTMLElement>('[data-intro]')!.textContent = t.intro;
    card.querySelector<HTMLElement>('[data-privacy]')!.textContent = t.privacy;
    const getButton = card.querySelector<HTMLButtonElement>('[data-get]')!;
    getButton.textContent = locating ? t.locating : t.get;
    getButton.disabled = locating;
    card.querySelector<HTMLElement>('[data-status]')!.textContent = statusMessage;

    const readout = card.querySelector<HTMLElement>('[data-readout]')!;
    const actions = card.querySelector<HTMLElement>('[data-actions]')!;
    readout.hidden = !current;
    actions.hidden = !current;
    if (current) {
      card.querySelector<HTMLElement>('[data-last-label]')!.textContent = t.last;
      card.querySelector<HTMLElement>('[data-coords]')!.textContent = `${current.lat.toFixed(6)}, ${current.lng.toFixed(6)}`;
      card.querySelector<HTMLElement>('[data-meta]')!.textContent = `${t.accuracy}: ±${Math.round(current.accuracy)} m • ${t.updated}: ${formatDate(current.timestamp, locale())}`;
      card.querySelector<HTMLButtonElement>('[data-share]')!.textContent = t.share;
      card.querySelector<HTMLButtonElement>('[data-map]')!.textContent = t.map;
      card.querySelector<HTMLButtonElement>('[data-copy]')!.textContent = copied ? t.copied : t.copy;
    }

    updateEmergencyFact();
  };

  onTemanUiRefresh(render);
  window.setTimeout(render, 0);
}
