import { beforeEach, describe, expect, it } from 'vitest';
import { runStorageMigrations, TEMAN_STORAGE_SCHEMA_VERSION } from '../src/storage-migrations';

const VERSION_KEY = 'teman.storage.schema.version';
const QUARANTINE_KEY = 'teman.storage.quarantine.v1';
const JOURNAL_KEY = 'teman.storage.migration.journal.v1';

describe('storage migrations', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('migrates fresh install to schema v1', () => {
    runStorageMigrations();
    expect(localStorage.getItem(VERSION_KEY)).toBe(String(TEMAN_STORAGE_SCHEMA_VERSION));
  });

  it('copies legacy Family Link aliases into canonical v1 keys', () => {
    localStorage.setItem('teman.family.checkins', '[{"id":"legacy"}]');
    localStorage.setItem('teman.family.cloud', '{"familyId":"legacy"}');

    runStorageMigrations();

    expect(localStorage.getItem('teman.family.checkins.v1')).toBe('[{"id":"legacy"}]');
    expect(localStorage.getItem('teman.family.cloud.v1')).toBe('{"familyId":"legacy"}');
    expect(localStorage.getItem('teman.family.checkins')).toBeNull();
    expect(localStorage.getItem('teman.family.cloud')).toBeNull();
  });

  it('does not overwrite canonical Family Link keys with legacy aliases', () => {
    localStorage.setItem('teman.family.checkins', '[{"id":"legacy"}]');
    localStorage.setItem('teman.family.cloud', '{"familyId":"legacy"}');
    localStorage.setItem('teman.family.checkins.v1', '[{"id":"new"}]');
    localStorage.setItem('teman.family.cloud.v1', '{"familyId":"new"}');

    runStorageMigrations();

    expect(localStorage.getItem('teman.family.checkins.v1')).toBe('[{"id":"new"}]');
    expect(localStorage.getItem('teman.family.cloud.v1')).toBe('{"familyId":"new"}');
    expect(localStorage.getItem('teman.family.checkins')).toBeNull();
    expect(localStorage.getItem('teman.family.cloud')).toBeNull();
  });

  it('keeps valid saved Makkah and Madinah hotel/group points intact', () => {
    const makkahHotel = JSON.stringify({ lat: 21.4225, lng: 39.8262, accuracy: 8, timestamp: 1 });
    const makkahGroup = JSON.stringify({ lat: 21.423, lng: 39.827, label: 'Group A' });
    const madinahHotel = JSON.stringify({ lat: 24.4672, lng: 39.6111, accuracy: 12, timestamp: 2 });
    const madinahGroup = JSON.stringify({ lat: 24.468, lng: 39.612, label: 'Bus' });

    localStorage.setItem('teman-map.hotel.makkah', makkahHotel);
    localStorage.setItem('teman-map.group.makkah', makkahGroup);
    localStorage.setItem('teman-map.hotel.madinah', madinahHotel);
    localStorage.setItem('teman-map.group.madinah', madinahGroup);

    runStorageMigrations();

    expect(localStorage.getItem('teman-map.hotel.makkah')).toBe(makkahHotel);
    expect(localStorage.getItem('teman-map.group.makkah')).toBe(makkahGroup);
    expect(localStorage.getItem('teman-map.hotel.madinah')).toBe(madinahHotel);
    expect(localStorage.getItem('teman-map.group.madinah')).toBe(madinahGroup);
  });

  it('quarantines malformed array/object/location values and removes them', () => {
    localStorage.setItem('teman.family.checkins.v1', '{"not":"an array"}');
    localStorage.setItem('teman.family.cloud.v1', '[]');
    localStorage.setItem('teman-map.hotel.makkah', '{"lat":"bad","lng":39.8}');

    runStorageMigrations();

    expect(localStorage.getItem('teman.family.checkins.v1')).toBeNull();
    expect(localStorage.getItem('teman.family.cloud.v1')).toBeNull();
    expect(localStorage.getItem('teman-map.hotel.makkah')).toBeNull();
    const quarantine = JSON.parse(localStorage.getItem(QUARANTINE_KEY) || '[]') as Array<{ key: string }>;
    expect(quarantine.map(entry => entry.key)).toEqual(
      expect.arrayContaining(['teman.family.checkins.v1', 'teman.family.cloud.v1', 'teman-map.hotel.makkah']),
    );
  });

  it('restores interrupted migration journal snapshot safely', () => {
    localStorage.setItem('teman.family.checkins.v1', '{"bad":"value"}');
    localStorage.setItem(
      JOURNAL_KEY,
      JSON.stringify({
        fromVersion: 0,
        toVersion: 1,
        createdAt: Date.now(),
        values: {
          'teman.family.checkins.v1': '[{"id":"restored"}]',
          [VERSION_KEY]: '0',
        },
      }),
    );

    runStorageMigrations();

    expect(localStorage.getItem('teman.family.checkins.v1')).toBe('[{"id":"restored"}]');
    expect(localStorage.getItem(JOURNAL_KEY)).toBeNull();
  });

  it('does not downgrade newer unsupported schema', () => {
    localStorage.setItem(VERSION_KEY, '999');
    localStorage.setItem('teman.family.checkins', '[{"id":"legacy"}]');

    runStorageMigrations();

    expect(localStorage.getItem(VERSION_KEY)).toBe('999');
    expect(localStorage.getItem('teman.family.checkins')).toBe('[{"id":"legacy"}]');
  });
});
