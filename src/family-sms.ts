import { onTemanUiRefresh } from './ui-refresh';

type Locale = 'ms' | 'en' | 'ar';
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
    button: '📱 HANTAR SMS KELUARGA',
    hint: 'Internet tidak diperlukan • guna rangkaian SMS',
    noPhone: 'Nombor telefon keluarga belum disimpan dalam profil TEMAN.',
    noStatus: 'Belum ada check-in. TEMAN akan sediakan SMS ringkas untuk meminta keluarga menghubungi anda.',
    status: 'Status', time: 'Masa', hotel: 'Hotel', groupBus: 'Kumpulan / Bas',
    fallback: 'Saya menggunakan TEMAN Haramain. Tolong hubungi saya apabila menerima SMS ini.',
    footer: 'Dihantar melalui TEMAN Haramain. SMS tidak memerlukan internet.',
  },
  en: {
    button: '📱 SEND FAMILY SMS',
    hint: 'No internet required • uses SMS network',
    noPhone: 'No family phone number is saved in the TEMAN profile.',
    noStatus: 'No check-in yet. TEMAN will prepare a simple SMS asking your family to contact you.',
    status: 'Status', time: 'Time', hotel: 'Hotel', groupBus: 'Group / Bus',
    fallback: 'I am using TEMAN Haramain. Please contact me when you receive this SMS.',
    footer: 'Sent through TEMAN Haramain. SMS does not require internet.',
  },
  ar: {
    button: '📱 إرسال رسالة SMS للأسرة',
    hint: 'لا يحتاج إلى الإنترنت • يستخدم شبكة الرسائل',
    noPhone: 'رقم هاتف الأسرة غير محفوظ في ملف TEMAN.',
    noStatus: 'لا توجد حالة مرسلة بعد. سيجهز TEMAN رسالة قصيرة لطلب اتصال الأسرة بك.',
    status: 'الحالة', time: 'الوقت', hotel: 'الفندق', groupBus: 'المجموعة / الحافلة',
    fallback: 'أستخدم TEMAN Haramain. يرجى الاتصال بي عند استلام هذه الرسالة.',
    footer: 'أرسلت عبر TEMAN Haramain. رسائل SMS لا تحتاج إلى الإنترنت.',
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

function profile(): Profile {
  return readJson<Profile>('teman-profile', {});
}

function latestCheckIn(): CheckIn | null {
  return readJson<CheckIn[]>(CHECKINS_KEY, [])[0] || null;
}

function currentHotel(p: Profile): string {
  return localStorage.getItem('teman-city') === 'madinah' ? (p.hotelMadinah || '') : (p.hotelMakkah || '');
}

function formatTime(value: number | undefined, lang: Locale): string {
  if (!value) return new Date().toLocaleString(lang === 'ar' ? 'ar-SA' : lang === 'en' ? 'en-GB' : 'ms-MY', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
  return new Date(value).toLocaleString(lang === 'ar' ? 'ar-SA' : lang === 'en' ? 'en-GB' : 'ms-MY', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
}

function buildSms(): { phone: string; text: string } | null {
  const p = profile();
  const phone = (p.familyPhone || '').replace(/[^\d+]/g, '');
  if (!phone) return null;

  const lang = locale();
  const t = COPY[lang];
  const latest = latestCheckIn();
  const name = latest?.pilgrimName || p.pilgrimName || p.preferredName || 'TEMAN Pilgrim';
  const hotel = latest?.hotelName || currentHotel(p);
  const group = latest?.groupCode || p.groupCode || '';
  const bus = latest?.busNumber || p.busNumber || '';

  const lines = [
    `TEMAN Haramain — ${name}`,
    latest?.label ? `${t.status}: ${latest.label}` : t.fallback,
    `${t.time}: ${formatTime(latest?.createdAt, lang)}`,
    hotel ? `${t.hotel}: ${hotel}` : '',
    group || bus ? `${t.groupBus}: ${group || '—'} • ${bus || '—'}` : '',
    '',
    t.footer,
  ].filter(line => line !== '');

  return { phone, text: lines.join('\n') };
}

function openSms() {
  const lang = locale();
  const t = COPY[lang];
  const payload = buildSms();
  if (!payload) {
    window.alert(t.noPhone);
    return;
  }

  if (!latestCheckIn()) window.alert(t.noStatus);

  const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const separator = isiOS ? '&' : '?';
  window.location.href = `sms:${payload.phone}${separator}body=${encodeURIComponent(payload.text)}`;
}

export function initFamilySmsFallback() {
  if (document.querySelector('.temanFamilySmsFallback')) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'temanFamilySmsFallback';
  button.setAttribute('aria-label', COPY[locale()].button);
  button.addEventListener('click', openSms);

  const label = document.createElement('b');
  const hint = document.createElement('span');
  button.append(label, hint);
  document.body.appendChild(button);

  const render = () => {
    const t = COPY[locale()];
    label.textContent = t.button;
    hint.textContent = t.hint;
    button.setAttribute('aria-label', t.button);
  };

  onTemanUiRefresh(render);
  window.addEventListener('storage', render);
  render();
}
