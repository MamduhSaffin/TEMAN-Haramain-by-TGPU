import { onTemanUiRefresh } from './ui-refresh';

type Locale = 'ms' | 'en' | 'ar';
type ReminderKind = 'medication' | 'hydration' | 'meeting' | 'bus' | 'family';
type ReminderSchedule =
  | { kind: 'daily'; time: string }
  | { kind: 'interval'; everyMinutes: number; startAt: number }
  | { kind: 'once'; at: number };

type TemanReminder = {
  id: string;
  kind: ReminderKind;
  title: string;
  enabled: boolean;
  schedule: ReminderSchedule;
  createdAt: number;
  lastTriggeredAt?: number;
};

export type { ReminderSchedule, TemanReminder, ReminderKind };

type NotificationState = NotificationPermission | 'unsupported';

const STORAGE_KEY = 'teman.reminders.v1';
const DAILY_GRACE_MS = 5 * 60 * 1000;
const MAX_TIMER_WAIT_MS = 15_000;

const ICONS: Record<ReminderKind, string> = {
  medication: '💊',
  hydration: '💧',
  meeting: '📍',
  bus: '🚌',
  family: '👪',
};

const COPY = {
  ms: {
    short: 'Peringatan', title: 'Peringatan TEMAN', intro: 'Simpan jadual penting pada telefon. Peringatan ini berfungsi tanpa akaun dan tanpa servis berbayar.',
    add: 'Tambah Pantas', mine: 'Peringatan Saya', empty: 'Belum ada peringatan. Tambah hanya yang benar-benar diperlukan.', close: 'Tutup',
    medication: 'Ambil ubat', hydration: 'Minum air', meeting: 'Tempat berkumpul', bus: 'Bas akan bergerak', family: 'Check-in keluarga',
    medicationHint: 'Setiap hari • 8:00 pagi', hydrationHint: 'Setiap 2 jam', meetingHint: 'Sekali • 1 jam dari sekarang', busHint: 'Sekali • 2 jam dari sekarang', familyHint: 'Setiap hari • 8:00 malam',
    daily: 'Masa setiap hari', interval: 'Ulang setiap', once: 'Tarikh & masa', next: 'Seterusnya', off: 'Dimatikan', delete: 'Padam', on: 'ON', offToggle: 'OFF',
    hour1: '1 jam', hour15: '1 jam 30 minit', hour2: '2 jam', hour3: '3 jam',
    notifications: 'Notifikasi peranti', allow: 'Benarkan notifikasi', granted: 'Dibenarkan', denied: 'Disekat', default: 'Belum diminta', unsupported: 'Tidak tersedia dalam browser ini',
    unsupportedHint: 'Buka preview ini terus dalam Chrome/Edge atau pasang TEMAN sebagai PWA. Browser dalam aplikasi seperti WhatsApp/ChatGPT mungkin tidak menyokong notifikasi.',
    notificationNote: 'Semasa TEMAN dibuka, masa peringatan disemak dengan lebih tepat. Notifikasi ketika aplikasi ditutup masih bergantung pada sokongan browser/PWA.',
    added: 'Peringatan ditambah dan disimpan pada telefon.', removed: 'Peringatan dipadam dari telefon.', due: 'PERINGATAN', permissionGranted: 'Notifikasi peranti dibenarkan.', permissionDenied: 'Notifikasi tidak dibenarkan. Jadual masih disimpan offline.',
  },
  en: {
    short: 'Reminders', title: 'TEMAN Reminders', intro: 'Keep important schedules on this phone. No account or paid service is required.',
    add: 'Quick Add', mine: 'My Reminders', empty: 'No reminders yet. Add only the reminders you really need.', close: 'Close',
    medication: 'Take medication', hydration: 'Drink water', meeting: 'Meeting point', bus: 'Bus departure', family: 'Family check-in',
    medicationHint: 'Daily • 8:00 AM', hydrationHint: 'Every 2 hours', meetingHint: 'Once • 1 hour from now', busHint: 'Once • 2 hours from now', familyHint: 'Daily • 8:00 PM',
    daily: 'Time every day', interval: 'Repeat every', once: 'Date & time', next: 'Next', off: 'Off', delete: 'Delete', on: 'ON', offToggle: 'OFF',
    hour1: '1 hour', hour15: '1 hour 30 minutes', hour2: '2 hours', hour3: '3 hours',
    notifications: 'Device notifications', allow: 'Allow notifications', granted: 'Allowed', denied: 'Blocked', default: 'Not requested', unsupported: 'Unavailable in this browser',
    unsupportedHint: 'Open this preview directly in Chrome/Edge or install TEMAN as a PWA. In-app browsers such as WhatsApp/ChatGPT may not expose notifications.',
    notificationNote: 'While TEMAN is open, reminder times are checked more precisely. Alerts while the app is closed still depend on browser/PWA support.',
    added: 'Reminder added and saved on this phone.', removed: 'Reminder deleted from this phone.', due: 'REMINDER', permissionGranted: 'Device notifications are enabled.', permissionDenied: 'Notifications are not enabled. The schedule is still saved offline.',
  },
  ar: {
    short: 'التذكيرات', title: 'تذكيرات TEMAN', intro: 'احفظ المواعيد المهمة على هذا الهاتف دون حساب أو خدمة مدفوعة.',
    add: 'إضافة سريعة', mine: 'تذكيراتي', empty: 'لا توجد تذكيرات بعد. أضف التذكيرات الضرورية فقط.', close: 'إغلاق',
    medication: 'تناول الدواء', hydration: 'شرب الماء', meeting: 'مكان التجمع', bus: 'موعد الحافلة', family: 'تواصل مع الأسرة',
    medicationHint: 'يوميًا • 8:00 صباحًا', hydrationHint: 'كل ساعتين', meetingHint: 'مرة واحدة • بعد ساعة', busHint: 'مرة واحدة • بعد ساعتين', familyHint: 'يوميًا • 8:00 مساءً',
    daily: 'الوقت يوميًا', interval: 'التكرار كل', once: 'التاريخ والوقت', next: 'التالي', off: 'متوقف', delete: 'حذف', on: 'تشغيل', offToggle: 'إيقاف',
    hour1: 'ساعة', hour15: 'ساعة ونصف', hour2: 'ساعتان', hour3: '3 ساعات',
    notifications: 'إشعارات الجهاز', allow: 'السماح بالإشعارات', granted: 'مسموح', denied: 'محظور', default: 'لم يُطلب بعد', unsupported: 'غير متاح في هذا المتصفح',
    unsupportedHint: 'افتح المعاينة مباشرة في Chrome أو Edge أو ثبّت TEMAN كتطبيق PWA. قد لا تدعم المتصفحات داخل التطبيقات مثل WhatsApp أو ChatGPT الإشعارات.',
    notificationNote: 'عندما يكون TEMAN مفتوحًا يتم فحص وقت التذكير بدقة أكبر. الإشعارات عند إغلاق التطبيق تعتمد على دعم المتصفح أو PWA.',
    added: 'تمت إضافة التذكير وحفظه على الهاتف.', removed: 'تم حذف التذكير من الهاتف.', due: 'تذكير', permissionGranted: 'تم السماح بإشعارات الجهاز.', permissionDenied: 'لم يتم السماح بالإشعارات، لكن الجدول ما زال محفوظًا دون إنترنت.',
  },
} as const;

function locale(): Locale {
  const lang = document.documentElement.lang.toLowerCase();
  if (lang.startsWith('ar')) return 'ar';
  if (lang.startsWith('en')) return 'en';
  return 'ms';
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char] || char));
}

function loadReminders(): TemanReminder[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed as TemanReminder[] : [];
  } catch {
    return [];
  }
}

function saveReminders(reminders: TemanReminder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
}

function newId(kind: ReminderKind) {
  return `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function defaultTitle(kind: ReminderKind) {
  return COPY[locale()][kind];
}

function createReminder(kind: ReminderKind, now = Date.now()): TemanReminder {
  if (kind === 'hydration') {
    return { id: newId(kind), kind, title: defaultTitle(kind), enabled: true, schedule: { kind: 'interval', everyMinutes: 120, startAt: now + 120 * 60 * 1000 }, createdAt: now };
  }
  if (kind === 'meeting' || kind === 'bus') {
    return { id: newId(kind), kind, title: defaultTitle(kind), enabled: true, schedule: { kind: 'once', at: now + (kind === 'meeting' ? 60 : 120) * 60 * 1000 }, createdAt: now };
  }
  return { id: newId(kind), kind, title: defaultTitle(kind), enabled: true, schedule: { kind: 'daily', time: kind === 'medication' ? '08:00' : '20:00' }, createdAt: now };
}

function todayAt(time: string, now: number) {
  const [hours, minutes] = time.split(':');
  const date = new Date(now);
  date.setHours(Number(hours || 0), Number(minutes || 0), 0, 0);
  return date.getTime();
}

function currentDueSlot(reminder: TemanReminder, now = Date.now()): number | undefined {
  if (!reminder.enabled) return undefined;

  if (reminder.schedule.kind === 'once') {
    const scheduled = reminder.schedule.at;
    return now >= scheduled && (reminder.lastTriggeredAt ?? 0) < scheduled ? scheduled : undefined;
  }

  if (reminder.schedule.kind === 'daily') {
    const scheduled = todayAt(reminder.schedule.time, now);
    if (now < scheduled || now - scheduled > DAILY_GRACE_MS) return undefined;
    return (reminder.lastTriggeredAt ?? 0) < scheduled ? scheduled : undefined;
  }

  if (now < reminder.schedule.startAt) return undefined;
  const interval = Math.max(15, reminder.schedule.everyMinutes) * 60 * 1000;
  const slot = reminder.schedule.startAt + Math.floor((now - reminder.schedule.startAt) / interval) * interval;
  return (reminder.lastTriggeredAt ?? 0) < slot ? slot : undefined;
}

function nextOccurrence(reminder: TemanReminder, now = Date.now()): number | undefined {
  if (!reminder.enabled) return undefined;

  if (reminder.schedule.kind === 'once') {
    return reminder.lastTriggeredAt ? undefined : reminder.schedule.at;
  }

  if (reminder.schedule.kind === 'daily') {
    const today = todayAt(reminder.schedule.time, now);
    if (today > now) return today;
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.getTime();
  }

  const interval = Math.max(15, reminder.schedule.everyMinutes) * 60 * 1000;
  if (now < reminder.schedule.startAt) return reminder.schedule.startAt;
  return reminder.schedule.startAt + (Math.floor((now - reminder.schedule.startAt) / interval) + 1) * interval;
}

export const __reminderTestHooks = {
  todayAt,
  currentDueSlot,
  nextOccurrence,
};

function toLocalInput(value: number) {
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDateTime(value?: number) {
  if (!value) return '—';
  const tag = locale() === 'ar' ? 'ar-SA' : locale() === 'en' ? 'en-GB' : 'ms-MY';
  return new Date(value).toLocaleString(tag, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function notificationStatus(): NotificationState {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

async function showSystemNotification(reminder: TemanReminder) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const options: NotificationOptions = {
    body: reminder.title,
    icon: '/teman-icon.svg',
    badge: '/teman-icon.svg',
    tag: `teman-reminder-${reminder.id}`,
  };

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('TEMAN Haramain', options);
      return;
    } catch {
      // Fall through to the page notification API when available.
    }
  }

  try {
    new Notification('TEMAN Haramain', options);
  } catch {
    // The in-app reminder remains visible if the browser blocks system notifications.
  }
}

export function initTemanReminders() {
  if (document.querySelector('.temanReminderTrigger')) return;

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'temanReminderTrigger';
  trigger.hidden = true;
  document.body.appendChild(trigger);

  const overlay = document.createElement('section');
  overlay.className = 'temanReminderOverlay';
  overlay.hidden = true;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  document.body.appendChild(overlay);

  let reminders = loadReminders();
  let message = '';
  let alertMessage = '';
  let alertTimer: number | null = null;
  let checkTimer: number | null = null;
  let lastOverlayLocale = locale();

  const persist = () => {
    saveReminders(reminders);
    renderTrigger();
    if (!overlay.hidden) renderOverlay();
    scheduleNextCheck();
  };

  const showMessage = (value: string) => {
    message = value;
    if (!overlay.hidden) renderOverlay();
  };

  const showDue = (reminder: TemanReminder) => {
    const t = COPY[locale()];
    alertMessage = `${t.due}: ${reminder.title}`;
    if (alertTimer !== null) window.clearTimeout(alertTimer);
    alertTimer = window.setTimeout(() => {
      alertMessage = '';
      alertTimer = null;
      renderTrigger();
    }, 12_000);
    renderTrigger();
    void showSystemNotification(reminder);
  };

  const runDueCheck = () => {
    const now = Date.now();
    let changed = false;
    reminders = reminders.map(reminder => {
      if (!currentDueSlot(reminder, now)) return reminder;
      changed = true;
      showDue(reminder);
      return { ...reminder, lastTriggeredAt: now };
    });
    if (changed) saveReminders(reminders);
    renderTrigger();
    if (!overlay.hidden && changed) renderOverlay();
  };

  function scheduleNextCheck() {
    if (checkTimer !== null) window.clearTimeout(checkTimer);
    const now = Date.now();
    const future = reminders
      .map(item => nextOccurrence(item, now))
      .filter((value): value is number => typeof value === 'number' && value > now)
      .sort((a, b) => a - b)[0];
    const wait = future ? Math.min(Math.max(future - now + 150, 750), MAX_TIMER_WAIT_MS) : MAX_TIMER_WAIT_MS;
    checkTimer = window.setTimeout(() => {
      runDueCheck();
      scheduleNextCheck();
    }, wait);
  }

  function renderTrigger() {
    const onHome = Boolean(document.querySelector('.hero'));
    trigger.hidden = !onHome;
    if (!onHome) return;
    const t = COPY[locale()];
    const active = reminders.filter(item => item.enabled).length;
    trigger.textContent = alertMessage || `⏰ ${t.short}${active ? ` (${active})` : ''}`;
    trigger.classList.toggle('hasAlert', Boolean(alertMessage));
  }

  const closeOverlay = () => {
    overlay.hidden = true;
    document.body.classList.remove('teman-reminders-open');
    trigger.focus();
  };

  function renderOverlay() {
    const t = COPY[locale()];
    lastOverlayLocale = locale();
    const status = notificationStatus();
    const statusText = status === 'granted' ? t.granted : status === 'denied' ? t.denied : status === 'unsupported' ? t.unsupported : t.default;
    const sorted = [...reminders].sort((a, b) => (nextOccurrence(a) ?? Number.MAX_SAFE_INTEGER) - (nextOccurrence(b) ?? Number.MAX_SAFE_INTEGER));

    overlay.innerHTML = `
      <div class="temanReminderPanel">
        <header>
          <div><span class="reminderEyebrow">TEMAN Haramain</span><h2>${t.title}</h2><p>${t.intro}</p></div>
          <button type="button" data-close aria-label="${t.close}">×</button>
        </header>
        <div class="temanReminderBody">
          ${message ? `<div class="reminderMessage">${escapeHtml(message)}</div>` : ''}
          <section class="reminderNotificationCard">
            <div><strong>${t.notifications}</strong><span>${statusText}</span></div>
            ${status !== 'granted' && status !== 'unsupported' ? `<button type="button" data-notifications>${t.allow}</button>` : ''}
          </section>
          ${status === 'unsupported' ? `<p class="reminderFootnote">${t.unsupportedHint}</p>` : ''}
          <h3>${t.add}</h3>
          <div class="reminderQuickGrid">
            ${(['medication', 'hydration', 'meeting', 'bus', 'family'] as ReminderKind[]).map(kind => `<button type="button" data-add="${kind}"><b>${ICONS[kind]} ${t[kind]}</b><span>${t[`${kind}Hint` as keyof typeof t]}</span></button>`).join('')}
          </div>
          <h3>${t.mine}</h3>
          ${sorted.length === 0 ? `<div class="reminderEmpty">${t.empty}</div>` : `<div class="reminderList">${sorted.map(reminder => reminderCard(reminder, t)).join('')}</div>`}
          <p class="reminderFootnote">${t.notificationNote}</p>
        </div>
      </div>`;

    overlay.querySelector<HTMLButtonElement>('[data-close]')?.addEventListener('click', closeOverlay);

    overlay.querySelector<HTMLButtonElement>('[data-notifications]')?.addEventListener('click', async () => {
      if (!('Notification' in window)) {
        showMessage(COPY[locale()].unsupportedHint);
        return;
      }
      try {
        const result = await Notification.requestPermission();
        showMessage(result === 'granted' ? COPY[locale()].permissionGranted : COPY[locale()].permissionDenied);
      } catch {
        showMessage(COPY[locale()].permissionDenied);
      }
    });

    overlay.querySelectorAll<HTMLButtonElement>('[data-add]').forEach(button => button.addEventListener('click', () => {
      const kind = button.dataset.add as ReminderKind;
      reminders = [...reminders, createReminder(kind)];
      message = COPY[locale()].added;
      persist();
    }));

    overlay.querySelectorAll<HTMLButtonElement>('[data-delete]').forEach(button => button.addEventListener('click', () => {
      reminders = reminders.filter(item => item.id !== button.dataset.delete);
      message = COPY[locale()].removed;
      persist();
    }));

    overlay.querySelectorAll<HTMLInputElement>('[data-enabled]').forEach(input => input.addEventListener('change', () => {
      reminders = reminders.map(item => item.id === input.dataset.enabled ? { ...item, enabled: input.checked } : item);
      persist();
    }));

    overlay.querySelectorAll<HTMLInputElement>('[data-title]').forEach(input => input.addEventListener('change', () => {
      const value = input.value.trim().slice(0, 80);
      reminders = reminders.map(item => item.id === input.dataset.title ? { ...item, title: value || defaultTitle(item.kind) } : item);
      persist();
    }));

    overlay.querySelectorAll<HTMLInputElement>('[data-daily]').forEach(input => input.addEventListener('change', () => {
      if (!input.value) return;
      reminders = reminders.map(item => item.id === input.dataset.daily ? { ...item, schedule: { kind: 'daily', time: input.value }, lastTriggeredAt: undefined } : item);
      persist();
    }));

    overlay.querySelectorAll<HTMLSelectElement>('[data-interval]').forEach(select => select.addEventListener('change', () => {
      const minutes = Number(select.value);
      reminders = reminders.map(item => item.id === select.dataset.interval ? { ...item, schedule: { kind: 'interval', everyMinutes: minutes, startAt: Date.now() + minutes * 60 * 1000 }, lastTriggeredAt: undefined } : item);
      persist();
    }));

    overlay.querySelectorAll<HTMLInputElement>('[data-once]').forEach(input => input.addEventListener('change', () => {
      const at = new Date(input.value).getTime();
      if (!Number.isFinite(at)) return;
      reminders = reminders.map(item => item.id === input.dataset.once ? { ...item, schedule: { kind: 'once', at }, lastTriggeredAt: undefined } : item);
      persist();
    }));
  }

  function reminderCard(reminder: TemanReminder, t: typeof COPY.ms | typeof COPY.en | typeof COPY.ar) {
    const schedule = reminder.schedule.kind === 'daily'
      ? `<label><span>${t.daily}</span><input type="time" data-daily="${reminder.id}" value="${escapeHtml(reminder.schedule.time)}"></label>`
      : reminder.schedule.kind === 'interval'
        ? `<label><span>${t.interval}</span><select data-interval="${reminder.id}"><option value="60" ${reminder.schedule.everyMinutes === 60 ? 'selected' : ''}>${t.hour1}</option><option value="90" ${reminder.schedule.everyMinutes === 90 ? 'selected' : ''}>${t.hour15}</option><option value="120" ${reminder.schedule.everyMinutes === 120 ? 'selected' : ''}>${t.hour2}</option><option value="180" ${reminder.schedule.everyMinutes === 180 ? 'selected' : ''}>${t.hour3}</option></select></label>`
        : `<label><span>${t.once}</span><input type="datetime-local" data-once="${reminder.id}" value="${toLocalInput(reminder.schedule.at)}"></label>`;

    return `<article class="temanReminderCard">
      <div class="reminderCardHead"><span class="reminderKindIcon">${ICONS[reminder.kind]}</span><input aria-label="${escapeHtml(t[reminder.kind])}" data-title="${reminder.id}" value="${escapeHtml(reminder.title)}"><label class="reminderToggle"><input type="checkbox" data-enabled="${reminder.id}" ${reminder.enabled ? 'checked' : ''}><span>${reminder.enabled ? t.on : t.offToggle}</span></label></div>
      <div class="reminderSchedule">${schedule}</div>
      <div class="reminderNext"><span>${t.next}</span><strong>${reminder.enabled ? formatDateTime(nextOccurrence(reminder)) : t.off}</strong></div>
      <button type="button" class="reminderDelete" data-delete="${reminder.id}">${t.delete}</button>
    </article>`;
  }

  trigger.addEventListener('click', () => {
    message = '';
    renderOverlay();
    overlay.hidden = false;
    document.body.classList.add('teman-reminders-open');
    overlay.querySelector<HTMLButtonElement>('[data-close]')?.focus();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !overlay.hidden) closeOverlay();
  });

  window.addEventListener('storage', event => {
    if (event.key && event.key !== STORAGE_KEY) return;
    reminders = loadReminders();
    renderTrigger();
    if (!overlay.hidden) renderOverlay();
    scheduleNextCheck();
  });

  onTemanUiRefresh(() => {
    renderTrigger();
    const currentLocale = locale();
    if (!overlay.hidden && currentLocale !== lastOverlayLocale) renderOverlay();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      reminders = loadReminders();
      runDueCheck();
      scheduleNextCheck();
    }
  });

  window.addEventListener('pageshow', () => {
    reminders = loadReminders();
    runDueCheck();
    scheduleNextCheck();
  }, { passive: true });

  window.addEventListener('beforeunload', () => {
    if (checkTimer !== null) window.clearTimeout(checkTimer);
  }, { once: true });

  renderTrigger();
  runDueCheck();
  scheduleNextCheck();
}
