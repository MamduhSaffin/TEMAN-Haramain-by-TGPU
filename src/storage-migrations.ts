export const TEMAN_STORAGE_SCHEMA_VERSION = 1;

const VERSION_KEY = 'teman.storage.schema.version';
const JOURNAL_KEY = 'teman.storage.migration.journal.v1';
const HEALTH_KEY = 'teman.storage.health.v1';
const QUARANTINE_KEY = 'teman.storage.quarantine.v1';

const LEGACY_ALIASES: Array<[legacy: string, canonical: string]> = [
  ['teman.family.checkins', 'teman.family.checkins.v1'],
  ['teman.family.cloud', 'teman.family.cloud.v1'],
];

const JSON_ARRAY_KEYS = [
  'teman.reminders.v1',
  'teman.family.checkins.v1',
] as const;

const JSON_OBJECT_KEYS = [
  'teman-profile',
  'teman.family.cloud.v1',
] as const;

const POINT_KEYS = [
  'teman-map.hotel.makkah',
  'teman-map.hotel.madinah',
  'teman-map.group.makkah',
  'teman-map.group.madinah',
  'teman-meeting-point',
] as const;

const PRIMITIVE_KEYS = [
  'teman-city',
  'teman-locale',
  'teman-large-text',
  'teman-low-power',
  'teman-emergency-tested',
] as const;

const TOUCHED_KEYS = Array.from(new Set([
  ...LEGACY_ALIASES.flatMap(([legacy, canonical]) => [legacy, canonical]),
  ...JSON_ARRAY_KEYS,
  ...JSON_OBJECT_KEYS,
  ...POINT_KEYS,
  ...PRIMITIVE_KEYS,
]));

type Journal = {
  fromVersion: number;
  toVersion: number;
  createdAt: number;
  values: Record<string, string | null>;
};

type Health = {
  status: 'ok' | 'migrated' | 'recovered' | 'failed' | 'newer-schema';
  schemaVersion: number;
  supportedVersion: number;
  checkedAt: number;
  detail?: string;
};

type QuarantineEntry = {
  key: string;
  value: string;
  reason: string;
  quarantinedAt: number;
};

function parseVersion(value: string | null): number {
  if (!value) return 0;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

function writeHealth(health: Health) {
  try {
    localStorage.setItem(HEALTH_KEY, JSON.stringify(health));
  } catch {
    // Storage health reporting must never block the app.
  }
}

function snapshot(keys: string[]): Record<string, string | null> {
  const values: Record<string, string | null> = {};
  keys.forEach(key => { values[key] = localStorage.getItem(key); });
  return values;
}

function restoreSnapshot(values: Record<string, string | null>) {
  Object.entries(values).forEach(([key, value]) => {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  });
}

function parseJournal(): Journal | null {
  try {
    const raw = JSON.parse(localStorage.getItem(JOURNAL_KEY) || 'null') as Partial<Journal> | null;
    if (!raw || typeof raw !== 'object') return null;
    if (!Number.isInteger(raw.fromVersion) || !Number.isInteger(raw.toVersion) || !raw.values || typeof raw.values !== 'object') return null;
    return raw as Journal;
  } catch {
    return null;
  }
}

function recoverInterruptedMigration() {
  const journal = parseJournal();
  if (!journal) {
    if (localStorage.getItem(JOURNAL_KEY)) localStorage.removeItem(JOURNAL_KEY);
    return;
  }

  const current = parseVersion(localStorage.getItem(VERSION_KEY));
  if (current >= journal.toVersion) {
    localStorage.removeItem(JOURNAL_KEY);
    return;
  }

  try {
    restoreSnapshot(journal.values);
    localStorage.removeItem(JOURNAL_KEY);
    writeHealth({
      status: 'recovered',
      schemaVersion: journal.fromVersion,
      supportedVersion: TEMAN_STORAGE_SCHEMA_VERSION,
      checkedAt: Date.now(),
      detail: 'Recovered an interrupted storage migration.',
    });
  } catch {
    // If rollback itself fails, leave the journal in place for the next startup.
  }
}

function quarantine(key: string, value: string, reason: string) {
  try {
    let entries: QuarantineEntry[] = [];
    const raw = localStorage.getItem(QUARANTINE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) entries = parsed.filter(Boolean).slice(-7) as QuarantineEntry[];
    }
    entries.push({ key, value: value.slice(0, 50_000), reason, quarantinedAt: Date.now() });
    localStorage.setItem(QUARANTINE_KEY, JSON.stringify(entries.slice(-8)));
  } catch {
    // Corrupt data can still be removed even if quarantine storage is unavailable.
  }
}

function removeMalformed(key: string, reason: string) {
  const raw = localStorage.getItem(key);
  if (raw === null) return;
  quarantine(key, raw, reason);
  localStorage.removeItem(key);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validateJsonArrayKey(key: string) {
  const raw = localStorage.getItem(key);
  if (raw === null) return;
  try {
    if (!Array.isArray(JSON.parse(raw))) removeMalformed(key, 'Expected a JSON array.');
  } catch {
    removeMalformed(key, 'Invalid JSON array.');
  }
}

function validateJsonObjectKey(key: string) {
  const raw = localStorage.getItem(key);
  if (raw === null) return;
  try {
    if (!isPlainObject(JSON.parse(raw))) removeMalformed(key, 'Expected a JSON object.');
  } catch {
    removeMalformed(key, 'Invalid JSON object.');
  }
}

function validatePointKey(key: string) {
  const raw = localStorage.getItem(key);
  if (raw === null) return;
  try {
    const point = JSON.parse(raw) as { lat?: unknown; lng?: unknown };
    if (!isPlainObject(point) || typeof point.lat !== 'number' || typeof point.lng !== 'number' || !Number.isFinite(point.lat) || !Number.isFinite(point.lng)) {
      removeMalformed(key, 'Invalid saved location point.');
    }
  } catch {
    removeMalformed(key, 'Invalid saved location JSON.');
  }
}

function normalizePrimitiveKeys() {
  const city = localStorage.getItem('teman-city');
  if (city !== null && city !== 'makkah' && city !== 'madinah') removeMalformed('teman-city', 'Unknown city value.');

  const locale = localStorage.getItem('teman-locale');
  if (locale !== null && locale !== 'ms' && locale !== 'en' && locale !== 'ar') removeMalformed('teman-locale', 'Unknown locale value.');

  ['teman-large-text', 'teman-low-power', 'teman-emergency-tested'].forEach(key => {
    const value = localStorage.getItem(key);
    if (value !== null && value !== '0' && value !== '1') removeMalformed(key, 'Expected 0 or 1.');
  });
}

function migrateLegacyAliases() {
  LEGACY_ALIASES.forEach(([legacy, canonical]) => {
    const oldValue = localStorage.getItem(legacy);
    if (oldValue === null) return;
    if (localStorage.getItem(canonical) === null) localStorage.setItem(canonical, oldValue);
    localStorage.removeItem(legacy);
  });
}

function migrate0To1() {
  migrateLegacyAliases();
  normalizePrimitiveKeys();
  JSON_ARRAY_KEYS.forEach(validateJsonArrayKey);
  JSON_OBJECT_KEYS.forEach(validateJsonObjectKey);
  POINT_KEYS.forEach(validatePointKey);
}

export function runStorageMigrations() {
  if (typeof window === 'undefined') return;

  try {
    void window.localStorage;
  } catch {
    return;
  }

  recoverInterruptedMigration();
  let version = parseVersion(localStorage.getItem(VERSION_KEY));

  if (version > TEMAN_STORAGE_SCHEMA_VERSION) {
    writeHealth({
      status: 'newer-schema',
      schemaVersion: version,
      supportedVersion: TEMAN_STORAGE_SCHEMA_VERSION,
      checkedAt: Date.now(),
      detail: 'Stored data was created by a newer TEMAN version; no downgrade migration was attempted.',
    });
    return;
  }

  if (version === TEMAN_STORAGE_SCHEMA_VERSION) {
    writeHealth({ status: 'ok', schemaVersion: version, supportedVersion: TEMAN_STORAGE_SCHEMA_VERSION, checkedAt: Date.now() });
    return;
  }

  const fromVersion = version;
  try {
    const journal: Journal = {
      fromVersion,
      toVersion: TEMAN_STORAGE_SCHEMA_VERSION,
      createdAt: Date.now(),
      values: snapshot([...TOUCHED_KEYS, VERSION_KEY]),
    };
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(journal));

    if (version < 1) {
      migrate0To1();
      version = 1;
      localStorage.setItem(VERSION_KEY, String(version));
    }

    localStorage.removeItem(JOURNAL_KEY);
    writeHealth({
      status: 'migrated',
      schemaVersion: version,
      supportedVersion: TEMAN_STORAGE_SCHEMA_VERSION,
      checkedAt: Date.now(),
      detail: `Migrated local data from schema ${fromVersion} to ${version}.`,
    });
  } catch {
    const journal = parseJournal();
    let restored = false;
    if (journal) {
      try {
        restoreSnapshot(journal.values);
        restored = true;
      } catch {
        // Leave the journal in place so the next startup can retry recovery.
      }
    }
    if (restored || !journal) localStorage.removeItem(JOURNAL_KEY);
    writeHealth({
      status: 'failed',
      schemaVersion: parseVersion(localStorage.getItem(VERSION_KEY)),
      supportedVersion: TEMAN_STORAGE_SCHEMA_VERSION,
      checkedAt: Date.now(),
      detail: restored
        ? 'Storage migration failed and the previous values were restored.'
        : 'Storage migration failed; recovery will be retried on the next startup.',
    });
  }
}
