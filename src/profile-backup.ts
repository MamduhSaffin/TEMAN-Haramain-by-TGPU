import { onTemanUiRefresh } from './ui-refresh';

type Locale = 'ms' | 'en' | 'ar';
type City = 'makkah' | 'madinah';

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

type LegacyBackupPayload = {
  version: 1;
  exportedAt: string;
  profile: Profile;
  notes: string;
  exchangeRate: string;
  city: City;
  locale: Locale;
};

const BACKUP_STORAGE_KEYS = [
  'teman-notes',
  'teman-sar-myr-rate',
  'teman-city',
  'teman-locale',
  'teman-large-text',
  'teman-low-power',
  'teman-emergency-tested',
  'teman.reminders.v1',
  'teman.family.checkins.v1',
  'teman-map.hotel.makkah',
  'teman-map.hotel.madinah',
  'teman-map.group.makkah',
  'teman-map.group.madinah',
  'teman-meeting-point',
] as const;

type BackupStorageKey = typeof BACKUP_STORAGE_KEYS[number];
type BackupStorage = Partial<Record<BackupStorageKey, string>>;

type BackupPayloadV2 = {
  format: 'TEMAN Haramain Backup';
  version: 2;
  exportedAt: string;
  profile: Profile;
  storage: BackupStorage;
  recovery: {
    familyCloudCredentialsIncluded: false;
    liveGpsIncluded: false;
    offlineMapPacksIncluded: false;
  };
};

type ValidBackup = LegacyBackupPayload | BackupPayloadV2;

type PreRestoreSnapshot = {
  version: 1;
  backup: BackupPayloadV2;
  deviceOnly: {
    familyCloud?: string;
    lastLocation?: string;
  };
};

const PRE_RESTORE_KEY = 'teman.backup.before-restore.v2';
const RESTORE_MESSAGE_KEY = 'teman.backup.restore-message.v1';
const FAMILY_CLOUD_KEY = 'teman.family.cloud.v1';
const LAST_LOCATION_KEY = 'teman-last-location';
const MAX_FILE_SIZE = 1_000_000;
const MAX_JSON_VALUE = 250_000;

const COPY = {
  ms: {
    title: 'BACKUP & PEMULIHAN TEMAN',
    intro: 'Simpan profil, nota, peringatan, sejarah check-in, tetapan dan lokasi hotel/kumpulan dalam satu fail.',
    share: 'KONGSI BUTIRAN PROFIL',
    download: 'SIMPAN BACKUP PENUH',
    restore: 'PULIHKAN BACKUP',
    undo: 'BATALKAN PEMULIHAN TERAKHIR',
    copied: 'Butiran profil telah disalin.',
    saved: 'Backup penuh TEMAN telah disimpan.',
    restored: 'Backup dipulihkan. TEMAN akan dimuat semula.',
    undone: 'Data sebelum pemulihan telah dikembalikan. TEMAN akan dimuat semula.',
    invalid: 'Fail backup tidak sah, terlalu besar atau rosak.',
    saveFirst: 'Simpan profil jemaah dahulu sebelum membuat backup.',
    privacy: 'Backup mengandungi data peribadi, peringatan dan lokasi hotel/kumpulan. Token Family Link, lokasi GPS terakhir dan fail peta offline TIDAK dimasukkan. Simpan fail ini dengan selamat.',
    shareIntro: 'Maklumat keselamatan TEMAN Haramain',
    mapHint: 'Selepas pulih pada telefon baharu, pek peta Makkah/Madinah perlu dimuat turun semula dan Family Link perlu diaktifkan semula.',
  },
  en: {
    title: 'TEMAN BACKUP & RECOVERY',
    intro: 'Keep your profile, notes, reminders, check-in history, settings and saved hotel/group locations in one file.',
    share: 'SHARE PROFILE DETAILS',
    download: 'SAVE FULL BACKUP',
    restore: 'RESTORE BACKUP',
    undo: 'UNDO LAST RESTORE',
    copied: 'Profile details copied.',
    saved: 'Full TEMAN backup saved.',
    restored: 'Backup restored. TEMAN will reload.',
    undone: 'Your pre-restore data has been recovered. TEMAN will reload.',
    invalid: 'The backup file is invalid, too large or damaged.',
    saveFirst: 'Save the pilgrim profile before creating a backup.',
    privacy: 'The backup contains personal data, reminders and saved hotel/group locations. Family Link tokens, the last GPS location and offline map files are NOT included. Keep this file secure.',
    shareIntro: 'TEMAN Haramain safety information',
    mapHint: 'After restoring on a new phone, re-download the Makkah/Madinah map pack and activate Family Link again.',
  },
  ar: {
    title: 'النسخ الاحتياطي والاستعادة في TEMAN',
    intro: 'احفظ الملف الشخصي والملاحظات والتذكيرات وسجل تسجيل الحالة والإعدادات ومواقع الفندق والتجمع في ملف واحد.',
    share: 'مشاركة بيانات الملف',
    download: 'حفظ نسخة احتياطية كاملة',
    restore: 'استعادة النسخة الاحتياطية',
    undo: 'التراجع عن آخر استعادة',
    copied: 'تم نسخ بيانات الملف.',
    saved: 'تم حفظ نسخة TEMAN الاحتياطية الكاملة.',
    restored: 'تمت استعادة النسخة الاحتياطية. سيعاد تحميل TEMAN.',
    undone: 'تمت استعادة البيانات التي كانت موجودة قبل الاستعادة. سيعاد تحميل TEMAN.',
    invalid: 'ملف النسخة الاحتياطية غير صالح أو كبير جداً أو تالف.',
    saveFirst: 'احفظ ملف الحاج أو المعتمر أولاً قبل إنشاء نسخة احتياطية.',
    privacy: 'تتضمن النسخة بيانات شخصية وتذكيرات ومواقع الفندق والتجمع المحفوظة. لا تتضمن رموز Family Link أو آخر موقع GPS أو ملفات الخرائط دون إنترنت. احتفظ بالملف في مكان آمن.',
    shareIntro: 'معلومات السلامة في TEMAN Haramain',
    mapHint: 'بعد الاستعادة على هاتف جديد، نزّل خريطة مكة/المدينة مرة أخرى وفعّل Family Link من جديد.',
  },
} as const;

const PROFILE_KEYS: Array<keyof Profile> = [
  'pilgrimName','preferredName','hotelMakkah','hotelMadinah','hotelAddress','hotelAddressMakkah','hotelAddressMadinah',
  'groupCode','busNumber','mutawwifName','mutawwifPhone','familyName','familyPhone',
];

const JSON_STORAGE_KEYS = new Set<BackupStorageKey>([
  'teman.reminders.v1',
  'teman.family.checkins.v1',
  'teman-map.hotel.makkah',
  'teman-map.hotel.madinah',
  'teman-map.group.makkah',
  'teman-map.group.madinah',
  'teman-meeting-point',
]);

function locale(): Locale {
  const lang = document.documentElement.lang.toLowerCase();
  if (lang.startsWith('ar')) return 'ar';
  if (lang.startsWith('en')) return 'en';
  return 'ms';
}

function cleanProfile(value: unknown): Profile {
  if (!value || typeof value !== 'object') return {};
  const source = value as Record<string, unknown>;
  const profile: Profile = {};
  PROFILE_KEYS.forEach(key => {
    const item = source[key];
    if (typeof item === 'string') profile[key] = item.slice(0, 1000);
  });
  return profile;
}

function loadProfile(): Profile {
  try {
    return cleanProfile(JSON.parse(localStorage.getItem('teman-profile') || '{}'));
  } catch {
    return {};
  }
}

function profileReady(profile: Profile) {
  return Boolean(profile.pilgrimName && (profile.hotelMakkah || profile.hotelMadinah) && (profile.mutawwifPhone || profile.familyPhone));
}

function sanitizeStorageValue(key: BackupStorageKey, value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (value.length > MAX_JSON_VALUE) return null;
  if (key === 'teman-notes') return value.slice(0, 20_000);
  if (key === 'teman-sar-myr-rate') return /^\d{1,4}(?:\.\d{1,6})?$/.test(value) ? value : null;
  if (key === 'teman-city') return value === 'madinah' || value === 'makkah' ? value : null;
  if (key === 'teman-locale') return value === 'ms' || value === 'en' || value === 'ar' ? value : null;
  if (key === 'teman-large-text' || key === 'teman-low-power' || key === 'teman-emergency-tested') return value === '1' || value === '0' ? value : null;
  if (JSON_STORAGE_KEYS.has(key)) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (key === 'teman.reminders.v1' || key === 'teman.family.checkins.v1') {
        if (!Array.isArray(parsed)) return null;
      } else if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return null;
      }
      return JSON.stringify(parsed);
    } catch {
      return null;
    }
  }
  return null;
}

function sanitizeDeviceJson(value: string | null): string | undefined {
  if (!value || value.length > MAX_JSON_VALUE) return undefined;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== 'object') return undefined;
    return JSON.stringify(parsed);
  } catch {
    return undefined;
  }
}

function collectStorage(): BackupStorage {
  const storage: BackupStorage = {};
  BACKUP_STORAGE_KEYS.forEach(key => {
    const current = localStorage.getItem(key);
    if (current === null) return;
    const safe = sanitizeStorageValue(key, current);
    if (safe !== null) storage[key] = safe;
  });
  return storage;
}

function buildBackup(profile: Profile): BackupPayloadV2 {
  return {
    format: 'TEMAN Haramain Backup',
    version: 2,
    exportedAt: new Date().toISOString(),
    profile,
    storage: collectStorage(),
    recovery: {
      familyCloudCredentialsIncluded: false,
      liveGpsIncluded: false,
      offlineMapPacksIncluded: false,
    },
  };
}

function shareText(profile: Profile) {
  const t = COPY[locale()];
  const cityLine = [
    profile.hotelMakkah ? `Makkah: ${profile.hotelMakkah}${profile.hotelAddressMakkah ? ` — ${profile.hotelAddressMakkah}` : ''}` : '',
    profile.hotelMadinah ? `Madinah: ${profile.hotelMadinah}${profile.hotelAddressMadinah ? ` — ${profile.hotelAddressMadinah}` : ''}` : '',
  ].filter(Boolean).join('\n');
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

function validateLegacyBackup(raw: Record<string, unknown>): LegacyBackupPayload | null {
  if (raw.version !== 1 || !raw.profile || typeof raw.profile !== 'object') return null;
  const profile = cleanProfile(raw.profile);
  const notes = typeof raw.notes === 'string' ? raw.notes.slice(0, 20_000) : '';
  const exchangeRate = typeof raw.exchangeRate === 'string' && /^\d{1,4}(?:\.\d{1,6})?$/.test(raw.exchangeRate) ? raw.exchangeRate : '';
  const city: City = raw.city === 'madinah' ? 'madinah' : 'makkah';
  const restoredLocale: Locale = raw.locale === 'ar' || raw.locale === 'en' ? raw.locale : 'ms';
  return {
    version: 1,
    exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt.slice(0, 100) : new Date().toISOString(),
    profile,
    notes,
    exchangeRate,
    city,
    locale: restoredLocale,
  };
}

function validateV2Backup(raw: Record<string, unknown>): BackupPayloadV2 | null {
  if (raw.version !== 2 || raw.format !== 'TEMAN Haramain Backup' || !raw.profile || typeof raw.profile !== 'object') return null;
  if (!raw.storage || typeof raw.storage !== 'object' || Array.isArray(raw.storage)) return null;
  const storageSource = raw.storage as Record<string, unknown>;
  const storage: BackupStorage = {};
  for (const key of BACKUP_STORAGE_KEYS) {
    const sourceValue = storageSource[key];
    const safe = sanitizeStorageValue(key, sourceValue);
    if (sourceValue !== undefined && safe === null) return null;
    if (safe !== null) storage[key] = safe;
  }
  return {
    format: 'TEMAN Haramain Backup',
    version: 2,
    exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt.slice(0, 100) : new Date().toISOString(),
    profile: cleanProfile(raw.profile),
    storage,
    recovery: {
      familyCloudCredentialsIncluded: false,
      liveGpsIncluded: false,
      offlineMapPacksIncluded: false,
    },
  };
}

function validateBackup(value: unknown): ValidBackup | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  if (raw.version === 2) return validateV2Backup(raw);
  if (raw.version === 1) return validateLegacyBackup(raw);
  return null;
}

function readPreRestoreSnapshot(): PreRestoreSnapshot | null {
  const saved = localStorage.getItem(PRE_RESTORE_KEY);
  if (!saved) return null;
  try {
    const raw = JSON.parse(saved) as Record<string, unknown>;
    if (raw.version !== 1 || !raw.backup) return null;
    const backup = validateBackup(raw.backup);
    if (!backup || backup.version !== 2) return null;
    const deviceRaw = raw.deviceOnly && typeof raw.deviceOnly === 'object' ? raw.deviceOnly as Record<string, unknown> : {};
    return {
      version: 1,
      backup,
      deviceOnly: {
        familyCloud: typeof deviceRaw.familyCloud === 'string' ? sanitizeDeviceJson(deviceRaw.familyCloud) : undefined,
        lastLocation: typeof deviceRaw.lastLocation === 'string' ? sanitizeDeviceJson(deviceRaw.lastLocation) : undefined,
      },
    };
  } catch {
    return null;
  }
}

function savePreRestoreSnapshot() {
  const profile = loadProfile();
  const hasUsefulData = Object.keys(profile).length > 0 || BACKUP_STORAGE_KEYS.some(key => localStorage.getItem(key) !== null) || localStorage.getItem(FAMILY_CLOUD_KEY) !== null;
  if (!hasUsefulData) return;
  const snapshot: PreRestoreSnapshot = {
    version: 1,
    backup: buildBackup(profile),
    deviceOnly: {
      familyCloud: sanitizeDeviceJson(localStorage.getItem(FAMILY_CLOUD_KEY)),
      lastLocation: sanitizeDeviceJson(localStorage.getItem(LAST_LOCATION_KEY)),
    },
  };
  try {
    localStorage.setItem(PRE_RESTORE_KEY, JSON.stringify(snapshot));
  } catch {
    // A failed safety snapshot must not block an intentional restore.
  }
}

function isolateRestoredIdentity() {
  localStorage.removeItem(FAMILY_CLOUD_KEY);
  localStorage.removeItem(LAST_LOCATION_KEY);
}

function applyV2Backup(payload: BackupPayloadV2, createSafetySnapshot = true) {
  if (createSafetySnapshot) savePreRestoreSnapshot();
  localStorage.setItem('teman-profile', JSON.stringify(payload.profile));
  BACKUP_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
  BACKUP_STORAGE_KEYS.forEach(key => {
    const value = payload.storage[key];
    if (typeof value === 'string') localStorage.setItem(key, value);
  });
  if (createSafetySnapshot) isolateRestoredIdentity();
}

function applyLegacyBackup(payload: LegacyBackupPayload) {
  savePreRestoreSnapshot();
  localStorage.setItem('teman-profile', JSON.stringify(payload.profile));
  localStorage.setItem('teman-notes', payload.notes);
  if (payload.exchangeRate) localStorage.setItem('teman-sar-myr-rate', payload.exchangeRate);
  else localStorage.removeItem('teman-sar-myr-rate');
  localStorage.setItem('teman-city', payload.city);
  localStorage.setItem('teman-locale', payload.locale);
  isolateRestoredIdentity();
}

function applyBackup(payload: ValidBackup) {
  if (payload.version === 2) applyV2Backup(payload, true);
  else applyLegacyBackup(payload);
}

function restorePreRestoreSnapshot(snapshot: PreRestoreSnapshot) {
  applyV2Backup(snapshot.backup, false);
  localStorage.removeItem(FAMILY_CLOUD_KEY);
  localStorage.removeItem(LAST_LOCATION_KEY);
  if (snapshot.deviceOnly.familyCloud) localStorage.setItem(FAMILY_CLOUD_KEY, snapshot.deviceOnly.familyCloud);
  if (snapshot.deviceOnly.lastLocation) localStorage.setItem(LAST_LOCATION_KEY, snapshot.deviceOnly.lastLocation);
}

function downloadBackup(payload: BackupPayloadV2, profile: Profile) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = (profile.preferredName || profile.pilgrimName || 'pilgrim').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'pilgrim';
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `teman-${safeName}-${date}-backup-v2.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const __profileBackupTestHooks = {
  buildBackup,
  validateBackup,
  applyV2Backup,
  readPreRestoreSnapshot,
  restorePreRestoreSnapshot,
};

export function initProfileBackup() {
  let status = localStorage.getItem(RESTORE_MESSAGE_KEY) || '';
  if (status) localStorage.removeItem(RESTORE_MESSAGE_KEY);

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
          <button type="button" data-undo></button>
          <input type="file" accept="application/json,.json" data-file hidden />
        </div>
        <p class="profileBackupStatus" data-status aria-live="polite"></p>
        <p class="profileBackupPrivacy" data-privacy></p>
        <p class="profileBackupPrivacy" data-map-hint></p>
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
        downloadBackup(buildBackup(profile), profile);
        status = t.saved;
        render();
      });

      const fileInput = card.querySelector<HTMLInputElement>('[data-file]')!;
      card.querySelector<HTMLButtonElement>('[data-restore]')?.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', async () => {
        const t = COPY[locale()];
        const file = fileInput.files?.[0];
        if (!file || file.size > MAX_FILE_SIZE) {
          status = t.invalid;
          render();
          return;
        }
        try {
          const payload = validateBackup(JSON.parse(await file.text()));
          if (!payload) throw new Error('invalid backup');
          applyBackup(payload);
          localStorage.setItem(RESTORE_MESSAGE_KEY, t.restored);
          window.setTimeout(() => window.location.reload(), 250);
        } catch {
          status = t.invalid;
          render();
        } finally {
          fileInput.value = '';
        }
      });

      card.querySelector<HTMLButtonElement>('[data-undo]')?.addEventListener('click', () => {
        const t = COPY[locale()];
        const snapshot = readPreRestoreSnapshot();
        if (!snapshot) {
          localStorage.removeItem(PRE_RESTORE_KEY);
          status = t.invalid;
          render();
          return;
        }
        try {
          restorePreRestoreSnapshot(snapshot);
          localStorage.removeItem(PRE_RESTORE_KEY);
          localStorage.setItem(RESTORE_MESSAGE_KEY, t.undone);
          window.setTimeout(() => window.location.reload(), 250);
        } catch {
          localStorage.removeItem(PRE_RESTORE_KEY);
          status = t.invalid;
          render();
        }
      });
    }

    const t = COPY[locale()];
    card.querySelector<HTMLElement>('[data-title]')!.textContent = t.title;
    card.querySelector<HTMLElement>('[data-intro]')!.textContent = t.intro;
    card.querySelector<HTMLButtonElement>('[data-share]')!.textContent = t.share;
    card.querySelector<HTMLButtonElement>('[data-download]')!.textContent = t.download;
    card.querySelector<HTMLButtonElement>('[data-restore]')!.textContent = t.restore;
    const undo = card.querySelector<HTMLButtonElement>('[data-undo]')!;
    undo.textContent = t.undo;
    undo.hidden = !readPreRestoreSnapshot();
    card.querySelector<HTMLElement>('[data-status]')!.textContent = status;
    card.querySelector<HTMLElement>('[data-privacy]')!.textContent = t.privacy;
    card.querySelector<HTMLElement>('[data-map-hint]')!.textContent = t.mapHint;
  };

  onTemanUiRefresh(render);
  window.addEventListener('storage', render);
  window.setTimeout(render, 0);
}
