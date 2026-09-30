import { onTemanUiRefresh, requestTemanUiRefresh } from './ui-refresh';

type Locale = 'ms' | 'en' | 'ar';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

type WakeLockSentinelLite = { release: () => Promise<void> };
type NavigatorWithWakeLock = Navigator & {
  wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLite> };
};

const COPY: Record<Locale, {
  home: string;
  sos: string;
  translate: string;
  profile: string;
  showLarge: string;
  close: string;
  speak: string;
  copy: string;
  copied: string;
  installTitle: string;
  installText: string;
  install: string;
  notNow: string;
}> = {
  ms: {
    home: 'Utama', sos: 'SOS', translate: 'Terjemah', profile: 'Profil', showLarge: 'TUNJUK BESAR',
    close: 'Tutup', speak: 'Main Arab', copy: 'Salin', copied: 'Disalin', installTitle: 'Pasang TEMAN',
    installText: 'Letak TEMAN di skrin utama untuk akses lebih cepat.', install: 'Pasang', notNow: 'Nanti',
  },
  en: {
    home: 'Home', sos: 'SOS', translate: 'Translate', profile: 'Profile', showLarge: 'SHOW LARGE',
    close: 'Close', speak: 'Play Arabic', copy: 'Copy', copied: 'Copied', installTitle: 'Install TEMAN',
    installText: 'Add TEMAN to your home screen for faster access.', install: 'Install', notNow: 'Later',
  },
  ar: {
    home: 'الرئيسية', sos: 'SOS', translate: 'ترجمة', profile: 'الملف', showLarge: 'عرض كبير',
    close: 'إغلاق', speak: 'تشغيل العربية', copy: 'نسخ', copied: 'تم النسخ', installTitle: 'تثبيت TEMAN',
    installText: 'أضف TEMAN إلى الشاشة الرئيسية للوصول السريع.', install: 'تثبيت', notNow: 'لاحقًا',
  },
};

function locale(): Locale {
  const lang = document.documentElement.lang.toLowerCase();
  if (lang.startsWith('ar')) return 'ar';
  if (lang.startsWith('en')) return 'en';
  return 'ms';
}

function setText(element: Element | null, value: string) {
  if (element && element.textContent !== value) element.textContent = value;
}

function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  return new Promise((resolve, reject) => {
    try {
      const field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      const ok = document.execCommand('copy');
      field.remove();
      ok ? resolve() : reject(new Error('copy failed'));
    } catch (error) {
      reject(error);
    }
  });
}

function clickAfterHome(selector: string) {
  const direct = document.querySelector<HTMLButtonElement>(selector);
  if (direct) {
    direct.click();
    return;
  }
  const back = document.querySelector<HTMLButtonElement>('button.back');
  if (back) {
    back.click();
    window.setTimeout(() => document.querySelector<HTMLButtonElement>(selector)?.click(), 80);
  }
}

export function initUxEnhancements() {
  if (document.querySelector('.safetyDock')) return;

  document.body.classList.add('has-safety-dock');

  const dock = document.createElement('nav');
  dock.className = 'safetyDock';
  dock.setAttribute('aria-label', 'TEMAN quick navigation');
  dock.innerHTML = `
    <button type="button" data-nav="home"><b aria-hidden="true">⌂</b><span></span></button>
    <button type="button" data-nav="sos" class="dockSos"><b aria-hidden="true">SOS</b><span></span></button>
    <button type="button" data-nav="translate"><b aria-hidden="true">文</b><span></span></button>
    <button type="button" data-nav="profile"><b aria-hidden="true">●</b><span></span></button>
  `;
  document.body.appendChild(dock);

  const showLarge = document.createElement('button');
  showLarge.type = 'button';
  showLarge.className = 'showLargeTrigger';
  showLarge.hidden = true;
  document.body.appendChild(showLarge);

  const installBanner = document.createElement('aside');
  installBanner.className = 'installTemanBanner';
  installBanner.hidden = true;
  installBanner.innerHTML = `
    <div><strong></strong><span></span></div>
    <button type="button" data-install></button>
    <button type="button" data-dismiss aria-label="Dismiss">×</button>
  `;
  document.body.appendChild(installBanner);

  let deferredInstall: BeforeInstallPromptEvent | null = null;
  let installDismissed = sessionStorage.getItem('teman-install-dismissed') === '1';
  let officerOverlay: HTMLElement | null = null;
  let wakeLock: WakeLockSentinelLite | null = null;
  let noteTimer: number | undefined;

  const labels = () => {
    const t = COPY[locale()];
    setText(dock.querySelector('[data-nav="home"] span'), t.home);
    setText(dock.querySelector('[data-nav="sos"] span'), t.sos);
    setText(dock.querySelector('[data-nav="translate"] span'), t.translate);
    setText(dock.querySelector('[data-nav="profile"] span'), t.profile);
    setText(showLarge, t.showLarge);
    setText(installBanner.querySelector('strong'), t.installTitle);
    setText(installBanner.querySelector('span'), t.installText);
    setText(installBanner.querySelector('[data-install]'), t.install);
    installBanner.querySelector<HTMLButtonElement>('[data-dismiss]')?.setAttribute('aria-label', t.notNow);
  };

  const updateState = () => {
    const onHome = Boolean(document.querySelector('.hero'));
    const onEmergency = Boolean(document.querySelector('.emergencyPage'));
    const onTranslate = Boolean(document.querySelector('.translationCard'));
    const onProfile = Boolean(document.querySelector('.form'));
    const helpCard = document.querySelector('#help-card');

    dock.querySelectorAll<HTMLButtonElement>('button').forEach(button => button.removeAttribute('data-active'));
    const active = onEmergency ? 'sos' : onTranslate ? 'translate' : onProfile ? 'profile' : onHome ? 'home' : '';
    if (active) dock.querySelector<HTMLButtonElement>(`[data-nav="${active}"]`)?.setAttribute('data-active', 'true');

    showLarge.hidden = !helpCard;
    installBanner.hidden = !deferredInstall || installDismissed || !onHome;
    labels();
  };

  dock.addEventListener('click', event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-nav]');
    if (!button) return;
    const nav = button.dataset.nav;
    if (nav === 'home') {
      document.querySelector<HTMLButtonElement>('button.back')?.click();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (nav === 'sos') {
      clickAfterHome('.action.emergency');
    } else if (nav === 'translate') {
      clickAfterHome('.translateFeature');
    } else if (nav === 'profile') {
      clickAfterHome('.profileFeature');
    }
    requestTemanUiRefresh();
  });

  const closeOfficerOverlay = async () => {
    officerOverlay?.remove();
    officerOverlay = null;
    document.body.classList.remove('officer-mode-open');
    try { await wakeLock?.release(); } catch { /* no-op */ }
    wakeLock = null;
    showLarge.focus();
  };

  const openOfficerOverlay = async () => {
    const card = document.querySelector<HTMLElement>('#help-card');
    if (!card || officerOverlay) return;
    const t = COPY[locale()];
    const arabic = card.querySelector<HTMLElement>('.arabic')?.innerText.trim() || '';
    const english = Array.from(card.querySelectorAll<HTMLParagraphElement>('p')).find(p => !p.classList.contains('arabic'))?.innerText.trim() || '';
    const facts = card.querySelector<HTMLElement>('.facts')?.cloneNode(true) as HTMLElement | null;

    const overlay = document.createElement('section');
    overlay.className = 'officerOverlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', t.showLarge);

    const panel = document.createElement('div');
    panel.className = 'officerPanel';
    panel.innerHTML = `
      <header class="officerToolbar">
        <strong>TEMAN Haramain</strong>
        <div>
          <button type="button" data-speak>${t.speak}</button>
          <button type="button" data-copy>${t.copy}</button>
          <button type="button" data-close>${t.close}</button>
        </div>
      </header>
      <div class="officerMessage">
        <p class="officerArabic" lang="ar" dir="rtl"></p>
        <p class="officerEnglish" lang="en"></p>
      </div>
    `;
    panel.querySelector('.officerArabic')!.textContent = arabic;
    panel.querySelector('.officerEnglish')!.textContent = english;
    if (facts) {
      facts.classList.add('officerFacts');
      panel.appendChild(facts);
    }
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    officerOverlay = overlay;
    document.body.classList.add('officer-mode-open');

    overlay.querySelector<HTMLButtonElement>('[data-close]')!.addEventListener('click', closeOfficerOverlay);
    overlay.querySelector<HTMLButtonElement>('[data-speak]')!.addEventListener('click', () => {
      if (!arabic || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(arabic);
      speech.lang = 'ar-SA';
      speech.rate = 0.78;
      window.speechSynthesis.speak(speech);
    });
    overlay.querySelector<HTMLButtonElement>('[data-copy]')!.addEventListener('click', async event => {
      const button = event.currentTarget as HTMLButtonElement;
      const original = t.copy;
      const text = [arabic, english, facts?.innerText || ''].filter(Boolean).join('\n\n');
      try {
        await copyText(text);
        button.textContent = t.copied;
        window.setTimeout(() => { button.textContent = original; }, 1800);
      } catch { /* no-op */ }
    });

    panel.querySelector<HTMLButtonElement>('[data-close]')?.focus();

    const wakeNavigator = navigator as NavigatorWithWakeLock;
    if (wakeNavigator.wakeLock?.request) {
      try { wakeLock = await wakeNavigator.wakeLock.request('screen'); } catch { /* optional API */ }
    }
  };

  showLarge.addEventListener('click', openOfficerOverlay);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && officerOverlay) closeOfficerOverlay();
  });

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstall = event as BeforeInstallPromptEvent;
    updateState();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstall = null;
    installBanner.hidden = true;
  });

  installBanner.querySelector<HTMLButtonElement>('[data-install]')!.addEventListener('click', async () => {
    if (!deferredInstall) return;
    await deferredInstall.prompt();
    await deferredInstall.userChoice.catch(() => null);
    deferredInstall = null;
    installBanner.hidden = true;
  });

  installBanner.querySelector<HTMLButtonElement>('[data-dismiss]')!.addEventListener('click', () => {
    installDismissed = true;
    sessionStorage.setItem('teman-install-dismissed', '1');
    installBanner.hidden = true;
  });

  document.addEventListener('input', event => {
    const target = event.target;
    if (!(target instanceof HTMLTextAreaElement) || target.id !== 'teman-notes') return;
    const value = target.value;
    if (noteTimer) window.clearTimeout(noteTimer);
    noteTimer = window.setTimeout(() => localStorage.setItem('teman-notes', value), 350);
  });

  onTemanUiRefresh(updateState);
  labels();
  window.setTimeout(updateState, 0);
}
