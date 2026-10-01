import { beforeEach, describe, expect, it } from 'vitest';
import { initFamilyLink } from '../src/family-link';

describe('family link local behavior', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '<main class="page"><section class="hero"></section></main>';
    document.documentElement.lang = 'en';
    localStorage.setItem(
      'teman-profile',
      JSON.stringify({ pilgrimName: 'Pilgrim', hotelMakkah: 'Hotel A', groupCode: 'G1', busNumber: 'B1' }),
    );
    Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: false });
  });

  it('keeps check-in queue available offline and preserves newest-first pending semantics', () => {
    initFamilyLink();

    const trigger = document.querySelector<HTMLButtonElement>('.temanFamilyTrigger');
    expect(trigger).toBeTruthy();
    trigger?.click();

    document.querySelector<HTMLButtonElement>('[data-checkin="safe"]')?.click();
    document.querySelector<HTMLButtonElement>('[data-checkin="with-group"]')?.click();

    const checkins = JSON.parse(localStorage.getItem('teman.family.checkins.v1') || '[]') as Array<{
      status: string;
      synced?: boolean;
    }>;

    expect(checkins).toHaveLength(2);
    expect(checkins[0]?.status).toBe('with-group');
    expect(checkins[1]?.status).toBe('safe');
    expect(checkins.every(item => item.synced === false)).toBe(true);
  });
});
