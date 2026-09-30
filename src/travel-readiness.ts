import { onTemanUiRefresh } from './ui-refresh';

type ReadinessLocale = 'ms' | 'en' | 'ar';

type SavedProfile = {
  hotelMakkah?: string;
  hotelMadinah?: string;
  mutawwifPhone?: string;
  familyPhone?: string;
  groupCode?: string;
  busNumber?: string;
};

type ReadinessItem = {
  key: string;
  label: string;
  detail: string;
  complete: boolean;
  action?: 'profile' | 'offline' | 'emergency';
};

const READINESS_COPY = {
  ms: {
    short: 'Persediaan',
    title: 'Sedia Sebelum Berlepas',
    intro: 'Pastikan telefon Ayah / Ibu benar-benar bersedia sebelum perjalanan. Semua semakan ini dibuat pada peranti ini sahaja.',
    complete: 'TEMAN sudah bersedia untuk perjalanan',
    incomplete: 'Lengkapkan perkara yang masih belum selesai',
    hotel: 'Hotel disimpan', hotelDetail: 'Sekurang-kurangnya satu hotel Makkah atau Madinah.',
    mutawwif: 'Telefon mutawwif disimpan', mutawwifDetail: 'Nombor yang boleh terus ditekan ketika kecemasan.',
    family: 'Telefon keluarga disimpan', familyDetail: 'Hubungan keluarga yang mudah dicapai.',
    group: 'Kumpulan / bas disimpan', groupDetail: 'Kod kumpulan atau nombor bas untuk bantu cari semula kumpulan.',
    offline: 'TEMAN tersedia offline', offlineDetail: 'Aplikasi atau cache offline sudah sedia pada telefon.',
    emergency: 'Kad kecemasan sudah diuji', emergencyDetail: 'Buka SOS dan cuba mod TUNJUK BESAR sekurang-kurangnya sekali.',
    fix: 'Lengkapkan', test: 'Uji sekarang', checkOffline: 'Sediakan offline', done: 'Selesai', close: 'Tutup',
  },
  en: {
    short: 'Travel Ready',
    title: 'Ready Before Departure',
    intro: 'Make sure Mum / Dad’s phone is fully prepared before travel. These checks stay on this device.',
    complete: 'TEMAN is ready for the journey',
    incomplete: 'Complete the remaining items before departure',
    hotel: 'Hotel saved', hotelDetail: 'At least one Makkah or Madinah hotel is saved.',
    mutawwif: 'Mutawwif phone saved', mutawwifDetail: 'A number that can be called immediately in an emergency.',
    family: 'Family phone saved', familyDetail: 'A family contact that is easy to reach.',
    group: 'Group / bus saved', groupDetail: 'A group code or bus number to help find the group again.',
    offline: 'TEMAN available offline', offlineDetail: 'The app or offline cache is ready on this phone.',
    emergency: 'Emergency card tested', emergencyDetail: 'Open SOS and try SHOW LARGE at least once.',
    fix: 'Complete', test: 'Test now', checkOffline: 'Prepare offline', done: 'Done', close: 'Close',
  },
  ar: {
    short: 'جاهزية السفر',
    title: 'جاهز قبل السفر',
    intro: 'تأكد من تجهيز هاتف الوالد أو الوالدة قبل السفر. تبقى هذه الفحوصات على هذا الجهاز فقط.',
    complete: 'TEMAN جاهز للرحلة',
    incomplete: 'أكمل العناصر المتبقية قبل السفر',
    hotel: 'تم حفظ الفندق', hotelDetail: 'تم حفظ فندق واحد على الأقل في مكة أو المدينة.',
    mutawwif: 'تم حفظ هاتف المطوف', mutawwifDetail: 'رقم يمكن الاتصال به مباشرة عند الحاجة.',
    family: 'تم حفظ هاتف الأسرة', familyDetail: 'جهة اتصال عائلية يسهل الوصول إليها.',
    group: 'تم حفظ المجموعة / الحافلة', groupDetail: 'رمز المجموعة أو رقم الحافلة للمساعدة في العثور عليها.',
    offline: 'TEMAN متاح دون إنترنت', offlineDetail: 'التطبيق أو التخزين دون اتصال جاهز على الهاتف.',
    emergency: 'تم اختبار بطاقة الطوارئ', emergencyDetail: 'افتح SOS وجرّب وضع العرض الكبير مرة واحدة على الأقل.',
    fix: 'إكمال', test: 'اختبر الآن', checkOffline: 'تجهيز دون إنترنت', done: 'مكتمل', close: 'إغلاق',
  },
} as const;

function readinessLocale(): ReadinessLocale {
  const lang = document.documentElement.lang.toLowerCase();
  if (lang.startsWith('ar')) return 'ar';
  if (lang.startsWith('en')) return 'en';
  return 'ms';
}

function savedProfile(): SavedProfile {
  try {
    return JSON.parse(localStorage.getItem('teman-profile') || '{}') as SavedProfile;
  } catch {
    return {};
  }
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

function offlineReady() {
  return isStandalone() || Boolean(navigator.serviceWorker?.controller);
}

function profileAction() {
  const direct = document.querySelector<HTMLButtonElement>('.profileFeature');
  if (direct) {
    direct.click();
    return;
  }
  document.querySelector<HTMLButtonElement>('button.back')?.click();
  window.setTimeout(() => document.querySelector<HTMLButtonElement>('.profileFeature')?.click(), 90);
}

function emergencyAction() {
  const direct = document.querySelector<HTMLButtonElement>('.action.emergency');
  if (direct) {
    direct.click();
    return;
  }
  document.querySelector<HTMLButtonElement>('button.back')?.click();
  window.setTimeout(() => document.querySelector<HTMLButtonElement>('.action.emergency')?.click(), 90);
}

export function initTravelReadiness() {
  if (document.querySelector('.travelReadinessTrigger')) return;

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'travelReadinessTrigger';
  trigger.hidden = true;
  document.body.appendChild(trigger);

  const overlay = document.createElement('section');
  overlay.className = 'travelReadinessOverlay';
  overlay.hidden = true;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  document.body.appendChild(overlay);

  let serviceWorkerReady = offlineReady();

  const items = (): ReadinessItem[] => {
    const t = READINESS_COPY[readinessLocale()];
    const profile = savedProfile();
    return [
      { key: 'hotel', label: t.hotel, detail: t.hotelDetail, complete: Boolean(profile.hotelMakkah || profile.hotelMadinah), action: 'profile' },
      { key: 'mutawwif', label: t.mutawwif, detail: t.mutawwifDetail, complete: Boolean(profile.mutawwifPhone), action: 'profile' },
      { key: 'family', label: t.family, detail: t.familyDetail, complete: Boolean(profile.familyPhone), action: 'profile' },
      { key: 'group', label: t.group, detail: t.groupDetail, complete: Boolean(profile.groupCode || profile.busNumber), action: 'profile' },
      { key: 'offline', label: t.offline, detail: t.offlineDetail, complete: serviceWorkerReady || offlineReady(), action: 'offline' },
      { key: 'emergency', label: t.emergency, detail: t.emergencyDetail, complete: localStorage.getItem('teman-emergency-tested') === '1', action: 'emergency' },
    ];
  };

  const renderTrigger = () => {
    const onHome = Boolean(document.querySelector('.hero'));
    trigger.hidden = !onHome;
    if (!onHome) return;
    const list = items();
    const complete = list.filter(item => item.complete).length;
    const t = READINESS_COPY[readinessLocale()];
    const next = `${complete === list.length ? '✓ ' : ''}${t.short} ${complete}/${list.length}`;
    if (trigger.textContent !== next) trigger.textContent = next;
    trigger.classList.toggle('complete', complete === list.length);
  };

  const closeOverlay = () => {
    overlay.hidden = true;
    document.body.classList.remove('travel-readiness-open');
    trigger.focus();
  };

  const renderOverlay = () => {
    const t = READINESS_COPY[readinessLocale()];
    const list = items();
    const count = list.filter(item => item.complete).length;
    const allComplete = count === list.length;

    overlay.innerHTML = '';
    const panel = document.createElement('div');
    panel.className = 'travelReadinessPanel';

    const header = document.createElement('header');
    header.innerHTML = `
      <div>
        <span class="readinessEyebrow">TEMAN Haramain</span>
        <h2>${t.title}</h2>
        <p>${t.intro}</p>
      </div>
      <button type="button" data-close aria-label="${t.close}">×</button>
    `;
    panel.appendChild(header);

    const summary = document.createElement('div');
    summary.className = allComplete ? 'readinessSummary complete' : 'readinessSummary';
    summary.innerHTML = `<strong>${count}/${list.length}</strong><div><b>${allComplete ? t.complete : t.incomplete}</b><span>${Math.round((count / list.length) * 100)}%</span></div>`;
    panel.appendChild(summary);

    const checklist = document.createElement('div');
    checklist.className = 'readinessChecklist';
    list.forEach(item => {
      const row = document.createElement('article');
      row.className = item.complete ? 'readinessItem complete' : 'readinessItem';
      row.dataset.key = item.key;
      const actionLabel = item.action === 'emergency' ? t.test : item.action === 'offline' ? t.checkOffline : t.fix;
      row.innerHTML = `
        <span class="readinessIcon" aria-hidden="true">${item.complete ? '✓' : '!'}</span>
        <div><strong>${item.label}</strong><p>${item.detail}</p></div>
        <button type="button" ${item.complete ? 'disabled' : ''}>${item.complete ? t.done : actionLabel}</button>
      `;
      const button = row.querySelector<HTMLButtonElement>('button')!;
      if (!item.complete) {
        button.addEventListener('click', async () => {
          if (item.action === 'profile') {
            closeOverlay();
            profileAction();
          } else if (item.action === 'emergency') {
            closeOverlay();
            emergencyAction();
          } else if (item.action === 'offline') {
            const installButton = document.querySelector<HTMLButtonElement>('.installTemanBanner [data-install]');
            if (installButton && !document.querySelector<HTMLElement>('.installTemanBanner')?.hidden) {
              closeOverlay();
              installButton.click();
              return;
            }
            if ('serviceWorker' in navigator) {
              try {
                await navigator.serviceWorker.ready;
                serviceWorkerReady = true;
              } catch { /* no-op */ }
            }
            renderOverlay();
            renderTrigger();
          }
        });
      }
      checklist.appendChild(row);
    });
    panel.appendChild(checklist);
    overlay.appendChild(panel);

    panel.querySelector<HTMLButtonElement>('[data-close]')!.addEventListener('click', closeOverlay);
    panel.querySelector<HTMLButtonElement>('[data-close]')!.focus();
  };

  trigger.addEventListener('click', () => {
    renderOverlay();
    overlay.hidden = false;
    document.body.classList.add('travel-readiness-open');
  });

  document.addEventListener('click', event => {
    const target = event.target as HTMLElement;
    if (target.closest('.showLargeTrigger')) {
      localStorage.setItem('teman-emergency-tested', '1');
      renderTrigger();
      if (!overlay.hidden) renderOverlay();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !overlay.hidden) closeOverlay();
  });

  window.addEventListener('appinstalled', () => {
    serviceWorkerReady = true;
    renderTrigger();
    if (!overlay.hidden) renderOverlay();
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(() => {
      serviceWorkerReady = true;
      renderTrigger();
      if (!overlay.hidden) renderOverlay();
    }).catch(() => {});
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      serviceWorkerReady = true;
      renderTrigger();
      if (!overlay.hidden) renderOverlay();
    });
  }

  onTemanUiRefresh(() => {
    renderTrigger();
    if (!overlay.hidden) renderOverlay();
  });

  renderTrigger();
}
