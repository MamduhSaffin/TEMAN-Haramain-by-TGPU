import { beforeEach, describe, expect, it } from 'vitest';
import { __profileBackupTestHooks } from '../src/profile-backup';

const PRE_RESTORE_KEY = 'teman.backup.before-restore.v2';
const FAMILY_CLOUD_KEY = 'teman.family.cloud.v1';
const LAST_LOCATION_KEY = 'teman-last-location';

describe('profile backup and recovery', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'en';
  });

  it('builds v2 backup with supported keys and excludes cloud credentials and GPS location', () => {
    localStorage.setItem('teman-notes', 'hello');
    localStorage.setItem('teman.reminders.v1', '[]');
    localStorage.setItem(FAMILY_CLOUD_KEY, '{"familyId":"secret"}');
    localStorage.setItem(LAST_LOCATION_KEY, '{"lat":1,"lng":2}');

    const payload = __profileBackupTestHooks.buildBackup({ pilgrimName: 'A' });

    expect(payload.version).toBe(2);
    expect(payload.storage['teman-notes']).toBe('hello');
    expect(payload.storage['teman.reminders.v1']).toBe('[]');
    expect(payload.storage).not.toHaveProperty(FAMILY_CLOUD_KEY);
    expect(payload.storage).not.toHaveProperty(LAST_LOCATION_KEY);
    expect(payload.recovery.familyCloudCredentialsIncluded).toBe(false);
    expect(payload.recovery.liveGpsIncluded).toBe(false);
  });

  it('accepts legacy v1 backups', () => {
    const payload = __profileBackupTestHooks.validateBackup({
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: { pilgrimName: 'Legacy' },
      notes: 'n',
      exchangeRate: '1.23',
      city: 'makkah',
      locale: 'en',
    });

    expect(payload?.version).toBe(1);
  });

  it('restores v2 backup and creates pre-restore undo snapshot', () => {
    localStorage.setItem('teman-profile', JSON.stringify({ pilgrimName: 'Before' }));
    localStorage.setItem('teman-notes', 'before-notes');
    localStorage.setItem(FAMILY_CLOUD_KEY, '{"familyId":"old"}');
    localStorage.setItem(LAST_LOCATION_KEY, '{"lat":4,"lng":5}');

    const incoming = {
      format: 'TEMAN Haramain Backup' as const,
      version: 2 as const,
      exportedAt: new Date().toISOString(),
      profile: { pilgrimName: 'After' },
      storage: { 'teman-notes': 'after-notes' },
      recovery: {
        familyCloudCredentialsIncluded: false,
        liveGpsIncluded: false,
        offlineMapPacksIncluded: false,
      },
    };

    __profileBackupTestHooks.applyV2Backup(incoming, true);

    expect(localStorage.getItem('teman-profile')).toContain('After');
    expect(localStorage.getItem('teman-notes')).toBe('after-notes');
    expect(localStorage.getItem(FAMILY_CLOUD_KEY)).toBeNull();
    expect(localStorage.getItem(LAST_LOCATION_KEY)).toBeNull();
    expect(localStorage.getItem(PRE_RESTORE_KEY)).toBeTruthy();
  });

  it('undo restore recovers previous device state including cloud credentials', () => {
    localStorage.setItem('teman-profile', JSON.stringify({ pilgrimName: 'Before' }));
    localStorage.setItem('teman-notes', 'before-notes');
    localStorage.setItem(FAMILY_CLOUD_KEY, '{"familyId":"old"}');
    localStorage.setItem(LAST_LOCATION_KEY, '{"lat":4,"lng":5}');

    __profileBackupTestHooks.applyV2Backup(
      {
        format: 'TEMAN Haramain Backup',
        version: 2,
        exportedAt: new Date().toISOString(),
        profile: { pilgrimName: 'After' },
        storage: { 'teman-notes': 'after-notes' },
        recovery: {
          familyCloudCredentialsIncluded: false,
          liveGpsIncluded: false,
          offlineMapPacksIncluded: false,
        },
      },
      true,
    );

    const snapshot = __profileBackupTestHooks.readPreRestoreSnapshot();
    expect(snapshot).not.toBeNull();
    __profileBackupTestHooks.restorePreRestoreSnapshot(snapshot!);

    expect(localStorage.getItem('teman-profile')).toContain('Before');
    expect(localStorage.getItem('teman-notes')).toBe('before-notes');
    expect(localStorage.getItem(FAMILY_CLOUD_KEY)).toBe('{"familyId":"old"}');
    expect(localStorage.getItem(LAST_LOCATION_KEY)).toBe('{"lat":4,"lng":5}');
  });

  it('rejects malformed or oversized v2 backup payloads', () => {
    expect(
      __profileBackupTestHooks.validateBackup({
        version: 2,
        format: 'TEMAN Haramain Backup',
        exportedAt: new Date().toISOString(),
        profile: {},
        storage: { 'teman.reminders.v1': '{"not":"array"}' },
      }),
    ).toBeNull();

    expect(
      __profileBackupTestHooks.validateBackup({
        version: 2,
        format: 'TEMAN Haramain Backup',
        exportedAt: new Date().toISOString(),
        profile: {},
        storage: { 'teman-notes': 'x'.repeat(250_001) },
      }),
    ).toBeNull();
  });
});
