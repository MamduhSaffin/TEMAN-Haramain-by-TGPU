type Locale = 'ms' | 'en' | 'ar';

type Profile = {
  pilgrimName?: string;
  preferredName?: string;
  hotelMakkah?: string;
  hotelMadinah?: string;
  hotelAddress?: string;
  hotelAddressMakkah?: string;
  hotelAddressMadinah?: string;
  groupCode?: string;
  busNumber?: string;
  mutawwifName?: string;
  mutawwifPhone?: string;
  familyName?: string;
  familyPhone?: string;
};

type BackupPayload = {
  version: 1;
  exportedAt: string;
  profile: Profile;
  notes: string;
  exchangeRate: string;
  city: 'makkah' | 'madinah';
  locale: Locale;
};

const COPY = {
  ms: {
    title: 'BACKUP KELUARGA',
    intro: 'Simpan salinan profil TEMAN sebelum berlepas. Data tidak dihantar ke server.',
    share: 'KONGSI BUTIRAN PROFIL',
    download: 'SIMPAN FAIL BACKUP',
    restore: 'PULIHKAN BACKUP',
    copied: 'Butiran profil telah disalin.',
    restored: 'Backup dipulihkan. TEMAN akan dimuat semula.',
    invalid: 'Fail backup tidak sah atau rosak.',
    saveFirst: 'Simpan profil jemaah dahulu sebelum membuat backup.',
    privacy: 'Mengandungi hotel dan nombor telefon. Kongsi hanya dengan ahli keluarga / penjaga yang dipercayai.',
    shareIntro: 'Maklumat keselamatan TEMAN Haramain',
  },
  en: {
    title: 'FAMILY BACKUP',
    intro: 'Keep a copy of the TEMAN profile before departure. Nothing is uploaded to a server.',
    share: 'SHARE PROFILE DETAILS',
    download: 'SAVE BACKUP FILE',
    restore: 'RESTORE BACKUP',
    copied: 'Profile details copied.',
    restored: 'Backup restored. TEMAN will reload.',
    invalid: 'The backup file is invalid or damaged.',
    saveFirst: 'Save the pilgrim profile before creating a backup.',
    privacy: 'Contains hotel and phone details. Share only with trusted family or caregivers.',
    shareIntro: 'TEMAN Haramain safety information',
  },
  ar: {
    title: 'نسخة احتياطية للأسرة',
    intro: 'احفظ نسخة من ملف TEMAN قبل السفر. لا يتم رفع البيانات إلى أي خادم.',
    share: 'مشاركة بيانات الملف',
    download: 'حفظ ملف النسخة الاحتياطية',
    restore: 'استعادة النسخة الاحتياطية',
    copied: 'تم نسخ بيانات الملف.',
    restored: 'تمت استعادة النسخة الاحتياطية. سيعاد تحميل TEMAN.',
    invalid: 'ملف النسخة الاحتياطية غير صالح أو تالف.',
    saveFirst: 'احفظ ملف الحاج أو المعتمر أولاً قبل إنشاء نسخة احتياطية.',
    privacy: 'يتضمن بيانات الفندق وأرقام الهاتف. شاركه فقط مع الأسرة أو المسؤول الموثوق.',
    shareIntro: 'معلومات السلامة في TEMAN Haramain',
  },
} as const;

const PROFILE_KEYS: Array<keyof Profile> = [
  'pilgrimName','preferredName','hotelMakkah','hotelMadinah','hotelAddress','hotelAddressMakkah','hotelAddressMadinah',
  'groupCode','busNumber','mutawwifName','mutawwifPhone','familyName','familyPhone',
];

function locale(): Locale {
  const lang = document.documentElement.lang.toLowerCase();
  if (lang.startsWith('ar')) return 'ar';
  if (lang.startsWith('en')) return 'en';
  return 'ms';
}

function loadProfile(): Profile {
  try {
    const parsed = JSON.parse(localStorage.getItem('teman-profile') || '{}') as Record<string, unknown>;
    const profile: Profile = {};
    PROFILE_KEYS.forEach(key => {
      const value = parsed[key];
      if (typeof value === 'string') profile[key] = value.slice(0, 1000);
    });
    return profile;
  } catch {
    return {};
  }
}

function profileReady(profile: Profile) {
  return Boolean(profile.pilgrimName && (profile.hotelMakkah || profile.hotelMadinah) && (profile.mutawwifPhone || profile.familyPhone));
}

function buildBackup(profile: Profile): BackupPayload {
  const storedLocale = localStorage.getItem('teman-locale');
  const storedCity = localStorage.getItem('teman-city');
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile,
    notes: (localStorage.getItem('teman-notes') || '').slice(0, 20000),
    exchangeRate: (localStorage.getItem('teman-sar-myr-rate') || '').slice(0, 50),
    city: storedCity === 'madinah' ? 'madinah' : 'makkah',
    locale: storedLocale === 'ar' || storedLocale === 'en' ? storedLocale : 'ms',
  };
}

function shareText(profile: Profile) {
  const t = COPY[locale()];
  const cityLine = [profile.hotelMakkah ? `Makkah: ${profile.hotelMakkah}${profile.hotelAddressMakkah ? ` — ${profile.hotelAddressMakkah}` : ''}` : '', profile.hotelMadinah ? `Madinah: ${profile.hotelMadinah}${profile.hotelAddressMadinah ? ` — ${profile.hotelAddressMadinah}` : ''}` : ''].filter(Boolean).join('\n');
  return [
    t.shareIntro,
    `Name: ${profile.pilgrimName || '—'}${profile.preferredName ? ` (${profile.preferredName})` : ''}`,
    cityLine,
    `Group: ${profile.groupCode || '—'}${profile.busNumber ? ` • Bus ${profile.busNumber}` : ''}`,
    `Mutawwif: ${profile.mutawwifName || '—'} ${profile.mutawwifPhone || ''}`.trim(),
    `Family: ${profile.familyName || '—'} ${profile.familyPhone || ''}`.trim(),
  ].filter(Boolean).join('\n');
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
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

function validateBackup(value: unknown): BackupPayload | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (raw.version !== 1 || !raw.profile || typeof raw.profile !== 'object') return null;
  const profile: Profile = {};
  const source = raw.profile as Record<string, unknown>;
  PROFILE_KEYS.forEach(key => {
    const item = source[key];
    if (typeof item === 'string') profile[key] = item.slice(0, 1000);
  });
  const notes = typeof raw.notes === 'string' ? raw.notes.slice(0, 20000) : '';
  const exchangeRate = typeof raw.exchangeRate === 'string' ? raw.exchangeRate.slice(0, 50) : '';
  const city = raw.city === 'madinah' ? 'madinah' : 'makkah';
  const restoredLocale: Locale = raw.locale === 'ar' || raw.locale === 'en' ? raw.locale : 'ms';
  return { version: 1, exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : new Date().toISOString(), profile, notes, exchangeRate, city, locale: restoredLocale };
}

export function initProfileBackup() {
  let status = '';

  const render = () => {
    const form = document.querySelector<HTMLElement>('.form');
    const main = form?.closest<HTMLElement>('main.page');
    if (!form || !main) return;
    let card = main.querySelector<HTMLElement>('.profileBackupCard');
    if (!card) {
      card = document.createElement('section');
      card.className = 'profileBackupCard';
      card.innerHTML = `
        <div class="profileBackupHead"><div><strong data-title></strong><span data-intro></span></div><b aria-hidden="true">⇩</b></div>
        <div class="profileBackupActions">
          <button type="button" data-share></button>
          <button type="button" data-download></button>
          <button type="button" data-restore></button>
          <input type="file" accept="application/json,.json" data-file hidden />
        </div>
        <p class="profileBackupStatus" data-status aria-live="polite"></p>
        <p class="profileBackupPrivacy" data-privacy></p>
      `;
      main.appendChild(card);

      card.querySelector<HTMLButtonElement>('[data-share]')?.addEventListener('click', async () => {
        const t = COPY[locale()];
        const profile = loadProfile();
        if (!profileReady(profile)) {
          status = t.saveFirst;
          render();
          return;
        }
        const text = shareText(profile);
        try {
          if (navigator.share) await navigator.share({ title: 'TEMAN Haramain', text });
          else {
            await copyText(text);
            status = t.copied;
          }
        } catch {
          // A cancelled native share is not an error.
        }
        render();
      });

      card.querySelector<HTMLButtonElement>('[data-download]')?.addEventListener('click', () => {
        const t = COPY[locale()];
        const profile = loadProfile();
        if (!profileReady(profile)) {
          status = t.saveFirst;
          render();
          return;
        }
        const payload = buildBackup(profile);
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const safeName = (profile.preferredName || profile.pilgrimName || 'pilgrim').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'pilgrim';
        link.href = url;
        link.download = `teman-${safeName}-backup.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        status = '';
      });

      const fileInput = card.querySelector<HTMLInputElement>('[data-file]')!;
      card.querySelector<HTMLButtonElement>('[data-restore]')?.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', async () => {
        const t = COPY[locale()];
        const file = fileInput.files?.[0];
        if (!file || file.size > 1000000) {
          status = t.invalid;
          render();
          return;
        }
        try {
          const payload = validateBackup(JSON.parse(await file.text()));
          if (!payload) throw new Error('invalid backup');
          localStorage.setItem('teman-profile', JSON.stringify(payload.profile));
          localStorage.setItem('teman-notes', payload.notes);
          if (payload.exchangeRate) localStorage.setItem('teman-sar-myr-rate', payload.exchangeRate);
          else localStorage.removeItem('teman-sar-myr-rate');
          localStorage.setItem('teman-city', payload.city);
          localStorage.setItem('teman-locale', payload.locale);
          status = t.restored;
          render();
          window.setTimeout(() => window.location.reload(), 900);
        } catch {
          status = t.invalid;
          render();
        } finally {
          fileInput.value = '';
        }
      });
    }

    const t = COPY[locale()];
    card.querySelector<HTMLElement>('[data-title]')!.textContent = t.title;
    card.querySelector<HTMLElement>('[data-intro]')!.textContent = t.intro;
    card.querySelector<HTMLButtonElement>('[data-share]')!.textContent = t.share;
    card.querySelector<HTMLButtonElement>('[data-download]')!.textContent = t.download;
    card.querySelector<HTMLButtonElement>('[data-restore]')!.textContent = t.restore;
    card.querySelector<HTMLElement>('[data-status]')!.textContent = status;
    card.querySelector<HTMLElement>('[data-privacy]')!.textContent = t.privacy;
  };

  const observer = new MutationObserver(render);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['lang'] });
  window.setTimeout(render, 0);
}
