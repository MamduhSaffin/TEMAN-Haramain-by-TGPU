type Locale = 'ms' | 'en' | 'ar';

const COPY = {
  ms: {
    title: 'NOMBOR KECEMASAN SAUDI',
    intro: 'Untuk kecemasan sebenar, hubungi nombor rasmi Saudi.',
    unified: '911 • Kecemasan Bersepadu',
    unifiedHint: 'Wilayah Makkah',
    ambulance: '997 • Ambulans',
    ambulanceHint: 'Saudi Red Crescent',
    police: '999 • Polis',
    policeHint: 'Rondaan keselamatan',
    civil: '998 • Pertahanan Awam',
    civilHint: 'Kebakaran / penyelamatan',
    health: '937 • Kementerian Kesihatan',
    healthHint: 'Sokongan kesihatan',
    official: 'Nombor rasmi kerajaan Saudi',
  },
  en: {
    title: 'SAUDI EMERGENCY NUMBERS',
    intro: 'For a real emergency, call the official Saudi numbers.',
    unified: '911 • Unified Emergency',
    unifiedHint: 'Makkah Region',
    ambulance: '997 • Ambulance',
    ambulanceHint: 'Saudi Red Crescent',
    police: '999 • Police',
    policeHint: 'Security patrols',
    civil: '998 • Civil Defense',
    civilHint: 'Fire / rescue',
    health: '937 • Ministry of Health',
    healthHint: 'Health support',
    official: 'Official Saudi government numbers',
  },
  ar: {
    title: 'أرقام الطوارئ في السعودية',
    intro: 'في حالة الطوارئ الحقيقية اتصل بالأرقام الرسمية السعودية.',
    unified: '911 • الطوارئ الموحدة',
    unifiedHint: 'منطقة مكة المكرمة',
    ambulance: '997 • الإسعاف',
    ambulanceHint: 'الهلال الأحمر السعودي',
    police: '999 • الشرطة',
    policeHint: 'الدوريات الأمنية',
    civil: '998 • الدفاع المدني',
    civilHint: 'الحريق / الإنقاذ',
    health: '937 • وزارة الصحة',
    healthHint: 'الدعم الصحي',
    official: 'أرقام رسمية حكومية سعودية',
  },
} as const;

function locale(): Locale {
  const lang = document.documentElement.lang.toLowerCase();
  if (lang.startsWith('ar')) return 'ar';
  if (lang.startsWith('en')) return 'en';
  return 'ms';
}

function city() {
  return localStorage.getItem('teman-city') === 'madinah' ? 'madinah' : 'makkah';
}

function dial(number: string) {
  window.location.href = `tel:${number}`;
}

export function initSaudiEmergency() {
  const render = () => {
    const page = document.querySelector<HTMLElement>('.emergencyPage');
    const choices = page?.querySelector<HTMLElement>('.emergencyChoices');
    if (!page || !choices) return;

    let section = page.querySelector<HTMLElement>('.saudiEmergencyCard');
    if (!section) {
      section = document.createElement('section');
      section.className = 'saudiEmergencyCard';
      section.innerHTML = `
        <div class="saudiEmergencyHead"><div><strong data-title></strong><span data-intro></span></div><b aria-hidden="true">☎</b></div>
        <div class="saudiEmergencyGrid">
          <button type="button" data-number="911" data-service="unified"><strong></strong><span></span></button>
          <button type="button" data-number="997" data-service="ambulance"><strong></strong><span></span></button>
          <button type="button" data-number="999" data-service="police"><strong></strong><span></span></button>
          <button type="button" data-number="998" data-service="civil"><strong></strong><span></span></button>
          <button type="button" data-number="937" data-service="health"><strong></strong><span></span></button>
        </div>
        <small data-official></small>
      `;
      choices.insertAdjacentElement('afterend', section);
      section.querySelectorAll<HTMLButtonElement>('[data-number]').forEach(button => {
        button.addEventListener('click', () => dial(button.dataset.number || ''));
      });
    }

    const t = COPY[locale()];
    section.querySelector<HTMLElement>('[data-title]')!.textContent = t.title;
    section.querySelector<HTMLElement>('[data-intro]')!.textContent = t.intro;
    section.querySelector<HTMLElement>('[data-official]')!.textContent = t.official;

    const services = ['unified', 'ambulance', 'police', 'civil', 'health'] as const;
    services.forEach(service => {
      const button = section!.querySelector<HTMLButtonElement>(`[data-service="${service}"]`)!;
      button.querySelector('strong')!.textContent = t[service];
      button.querySelector('span')!.textContent = t[`${service}Hint` as keyof typeof t];
    });

    const unified = section.querySelector<HTMLButtonElement>('[data-service="unified"]')!;
    unified.hidden = city() !== 'makkah';
  };

  document.addEventListener('click', event => {
    const target = event.target as HTMLElement;
    if (target.closest('.citySwitch')) window.setTimeout(render, 0);
  });

  const observer = new MutationObserver(render);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['lang', 'class'] });
  window.setTimeout(render, 0);
}
