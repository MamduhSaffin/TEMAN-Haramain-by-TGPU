import { describe, expect, it } from 'vitest';
import { __reminderTestHooks, type TemanReminder } from '../src/teman-reminders';

function makeReminder(partial: Partial<TemanReminder>): TemanReminder {
  return {
    id: 'r1',
    kind: 'family',
    title: 'test',
    enabled: true,
    schedule: { kind: 'daily', time: '08:00' },
    createdAt: 0,
    ...partial,
  };
}

describe('reminder scheduling', () => {
  it('computes daily due slots only within grace window', () => {
    const scheduleTime = new Date('2026-01-01T08:03:00.000Z').getTime();
    const reminder = makeReminder({ schedule: { kind: 'daily', time: '08:00' } });

    expect(__reminderTestHooks.currentDueSlot(reminder, scheduleTime)).toBe(
      __reminderTestHooks.todayAt('08:00', scheduleTime),
    );

    const outsideGrace = new Date('2026-01-01T08:06:00.000Z').getTime();
    expect(__reminderTestHooks.currentDueSlot(reminder, outsideGrace)).toBeUndefined();
  });

  it('fires once-reminder only once', () => {
    const at = new Date('2026-01-01T12:00:00.000Z').getTime();
    const reminder = makeReminder({ schedule: { kind: 'once', at } });

    expect(__reminderTestHooks.currentDueSlot(reminder, at + 1)).toBe(at);
    expect(__reminderTestHooks.currentDueSlot({ ...reminder, lastTriggeredAt: at }, at + 2)).toBeUndefined();
    expect(__reminderTestHooks.nextOccurrence({ ...reminder, lastTriggeredAt: at }, at + 2)).toBeUndefined();
  });

  it('advances interval reminders to next slot', () => {
    const startAt = new Date('2026-01-01T00:00:00.000Z').getTime();
    const now = startAt + 2.5 * 60 * 60 * 1000;
    const reminder = makeReminder({
      schedule: { kind: 'interval', everyMinutes: 60, startAt },
    });

    expect(__reminderTestHooks.currentDueSlot(reminder, now)).toBe(startAt + 2 * 60 * 60 * 1000);
    expect(__reminderTestHooks.nextOccurrence(reminder, now)).toBe(startAt + 3 * 60 * 60 * 1000);
  });

  it('does not fire disabled reminders', () => {
    const reminder = makeReminder({ enabled: false, schedule: { kind: 'once', at: Date.now() - 1000 } });
    expect(__reminderTestHooks.currentDueSlot(reminder, Date.now())).toBeUndefined();
    expect(__reminderTestHooks.nextOccurrence(reminder, Date.now())).toBeUndefined();
  });
});
