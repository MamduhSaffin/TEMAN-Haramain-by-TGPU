import { onTemanUiRefresh } from './ui-refresh';

type Locale = 'ms' | 'en' | 'ar';

const PILOT_EMAIL = 'mamduh@tgpugulf.com';

const COPY = {
  ms: {
    teaserEyebrow: 'UNTUK OPERATOR UMRAH',
    teaserTitle: 'Program Pilot Percuma TEMAN',
    teaserBody: 'Uji TEMAN bersama 10–30 jemaah sebelum sebarang keputusan komersial.',
    teaserCta: 'LIHAT PROGRAM PILOT',
    close: 'Tutup',
    eyebrow: 'TEMAN HARAMAIN • PILOT CANDIDATE v1.0',
    title: 'Pilot percuma untuk 10–30 jemaah',
    intro: 'TEMAN membantu operator memberi pengalaman perjalanan yang lebih selamat, lebih mudah untuk warga emas, dan lebih meyakinkan kepada keluarga — termasuk ketika internet lemah atau terputus.',
    primaryCta: 'MOHON PILOT PERCUMA',
    secondaryCta: 'BUKA APLIKASI JEMAAH',
    trust: ['Aplikasi berfungsi', 'BM • العربية • EN', 'Offline-ready', 'Privacy-first'],
    outcomeTitle: 'Apa yang operator dapat uji',
    outcomes: [
      ['👪', 'Ketenangan keluarga', 'Jemaah boleh menghantar status keselamatan melalui Family Link dengan satu tekan.'],
      ['👴', 'Mesra warga emas', 'Butang besar, arahan ringkas dan aliran tindakan yang mudah difahami.'],
      ['🗺️', 'Sokongan ketika internet lemah', 'Peta Makkah/Madinah, kad kecemasan dan maklumat penting kekal tersedia secara offline.'],
      ['🆘', 'Bantuan kecemasan', 'Maklumat hotel, kumpulan, bas, mutawwif dan kad QR boleh ditunjukkan dengan cepat apabila bantuan diperlukan.'],
    ],
    includeTitle: 'Apa yang termasuk dalam pilot',
    includes: ['Onboarding & persediaan profil jemaah', 'TEMAN Family Link dan Family View', 'Peta offline Makkah dan Madinah', 'Kad kecemasan offline + QR', 'Bahasa Melayu, Arab dan Inggeris', 'Pemerhatian penggunaan + sesi maklum balas selepas pilot'],
    privacyTitle: 'Privasi secara reka bentuk',
    privacyBody: 'TEMAN tidak melakukan penjejakan GPS langsung secara berterusan. Family Link hanya berkongsi status yang dipilih dan dihantar sendiri oleh jemaah, bersama maklumat perjalanan yang relevan.',
    processTitle: 'Cara pilot dijalankan',
    steps: [
      ['01', 'Selaras', 'Pilih 10–30 jemaah, tarikh perjalanan dan seorang PIC operator.'],
      ['02', 'Sediakan', 'Lengkapkan profil asas, hotel, kumpulan, bas dan kontak keluarga.'],
      ['03', 'Gunakan', 'Jemaah menggunakan TEMAN sepanjang perjalanan; operator kekal dengan proses operasi sedia ada.'],
      ['04', 'Nilai', 'Selepas perjalanan, kita semak penggunaan, isu, maklum balas dan kesesuaian untuk langkah seterusnya.'],
    ],
    commitment: 'Tiada komitmen komersial untuk pilot pertama. Fokus kami ialah menguji penggunaan sebenar dan mendapatkan maklum balas operator serta jemaah.',
    footerTitle: 'Berminat menguji TEMAN bersama kumpulan kecil?',
    footerBody: 'Hubungi TGPU Gulf Advisory untuk menyelaras pilot, demo ringkas atau sesi perbincangan operator.',
    emailLabel: 'E-MEL',
  },
  en: {
    teaserEyebrow: 'FOR UMRAH OPERATORS',
    teaserTitle: 'TEMAN Free Pilot Programme',
    teaserBody: 'Test TEMAN with 10–30 pilgrims before any commercial decision.',
    teaserCta: 'VIEW PILOT PROGRAMME',
    close: 'Close',
    eyebrow: 'TEMAN HARAMAIN • PILOT CANDIDATE v1.0',
    title: 'A free pilot for 10–30 pilgrims',
    intro: 'TEMAN helps operators deliver a safer, more senior-friendly journey while giving families greater reassurance — including when internet access is weak or unavailable.',
    primaryCta: 'REQUEST FREE PILOT',
    secondaryCta: 'OPEN PILGRIM APP',
    trust: ['Functional app', 'BM • العربية • EN', 'Offline-ready', 'Privacy-first'],
    outcomeTitle: 'What your team can test',
    outcomes: [
      ['👪', 'Family reassurance', 'Pilgrims can send a safety status through Family Link with one tap.'],
      ['👴', 'Senior-friendly use', 'Large controls, short instructions and simple action flows for older pilgrims.'],
      ['🗺️', 'Weak-connectivity support', 'Makkah/Madinah maps, emergency card and essential travel information remain available offline.'],
      ['🆘', 'Emergency assistance', 'Hotel, group, bus, mutawwif and QR emergency details can be shown quickly when help is needed.'],
    ],
    includeTitle: 'What is included in the pilot',
    includes: ['Pilgrim onboarding and profile preparation', 'TEMAN Family Link and Family View', 'Offline Makkah and Madinah maps', 'Offline emergency card + QR', 'Bahasa Melayu, Arabic and English', 'Usage observation + post-pilot feedback review'],
    privacyTitle: 'Privacy by design',
    privacyBody: 'TEMAN does not continuously live-track pilgrims. Family Link shares only a status intentionally sent by the pilgrim, together with relevant trip information.',
    processTitle: 'How the pilot works',
    steps: [
      ['01', 'Align', 'Select 10–30 pilgrims, travel dates and one operator PIC.'],
      ['02', 'Prepare', 'Complete core profile, hotel, group, bus and family contact information.'],
      ['03', 'Use', 'Pilgrims use TEMAN during the journey while the operator keeps its existing operational process.'],
      ['04', 'Review', 'After the trip, we review usage, issues, feedback and suitability for any next step.'],
    ],
    commitment: 'There is no commercial commitment for the first pilot. The purpose is to test real-world use and collect feedback from pilgrims and the operator team.',
    footerTitle: 'Interested in testing TEMAN with a small group?',
    footerBody: 'Contact TGPU Gulf Advisory to coordinate a pilot, short demo or operator discussion.',
    emailLabel: 'EMAIL',
  },
  ar: {
    teaserEyebrow: 'لِشَرِكَاتِ العُمْرَةِ',
    teaserTitle: 'بَرْنَامَجُ TEMAN التَّجْرِيبِيُّ المَجَّانِيُّ',
    teaserBody: 'جَرِّبُوا TEMAN مَعَ ١٠–٣٠ مُعْتَمِرًا قَبْلَ أَيِّ قَرَارٍ تِجَارِيٍّ.',
    teaserCta: 'عَرْضُ البَرْنَامَجِ التَّجْرِيبِيِّ',
    close: 'إِغْلَاق',
    eyebrow: 'TEMAN HARAMAIN • نُسْخَةٌ مُرَشَّحَةٌ لِلتَّجْرِبَةِ v1.0',
    title: 'تَجْرِبَةٌ مَجَّانِيَّةٌ لِـ ١٠–٣٠ مُعْتَمِرًا',
    intro: 'يُسَاعِدُ TEMAN شَرِكَاتِ العُمْرَةِ عَلَى تَقْدِيمِ رِحْلَةٍ أَكْثَرَ أَمَانًا وَسُهُولَةً لِكِبَارِ السِّنِّ، مَعَ طَمْأَنَةِ الأُسَرِ، حَتَّى عِنْدَ ضَعْفِ الإِنْتَرْنِتِ أَوِ انْقِطَاعِهِ.',
    primaryCta: 'طَلَبُ تَجْرِبَةٍ مَجَّانِيَّةٍ',
    secondaryCta: 'فَتْحُ تَطْبِيقِ المُعْتَمِرِ',
    trust: ['تَطْبِيقٌ فَعَّالٌ', 'BM • العربية • EN', 'يَعْمَلُ دُونَ إِنْتَرْنِتٍ', 'الخُصُوصِيَّةُ أَوَّلًا'],
    outcomeTitle: 'مَا الَّذِي يُمْكِنُ لِفَرِيقِكُمْ تَجْرِبَتُهُ؟',
    outcomes: [
      ['👪', 'طَمْأَنَةُ الأُسْرَةِ', 'يَسْتَطِيعُ المُعْتَمِرُ إِرْسَالَ حَالَةِ السَّلَامَةِ مِنْ خِلَالِ Family Link بِضَغْطَةٍ وَاحِدَةٍ.'],
      ['👴', 'مُنَاسِبٌ لِكِبَارِ السِّنِّ', 'أَزْرَارٌ كَبِيرَةٌ، وَتَعْلِيمَاتٌ مُخْتَصَرَةٌ، وَخُطُوَاتٌ بَسِيطَةٌ وَوَاضِحَةٌ.'],
      ['🗺️', 'دَعْمٌ عِنْدَ ضَعْفِ الشَّبَكَةِ', 'خَرَائِطُ مَكَّةَ وَالمَدِينَةِ، وَبِطَاقَةُ الطَّوَارِئِ، وَالمَعْلُومَاتُ المُهِمَّةُ تَبْقَى مُتَاحَةً دُونَ إِنْتَرْنِتٍ.'],
      ['🆘', 'مُسَاعَدَةٌ فِي الطَّوَارِئِ', 'يُمْكِنُ عَرْضُ مَعْلُومَاتِ الفُنْدُقِ وَالمَجْمُوعَةِ وَالحَافِلَةِ وَالمُطَوِّفِ وَرَمْزِ QR بِسُرْعَةٍ عِنْدَ الحَاجَةِ.'],
    ],
    includeTitle: 'مَا الَّذِي تَشْمَلُهُ التَّجْرِبَةُ؟',
    includes: ['تَجْهِيزُ المُعْتَمِرِينَ وَمِلَفَّاتِهِمْ', 'TEMAN Family Link وَFamily View', 'خَرَائِطُ مَكَّةَ وَالمَدِينَةِ دُونَ إِنْتَرْنِتٍ', 'بِطَاقَةُ طَوَارِئَ دُونَ إِنْتَرْنِتٍ + QR', 'المَلَايُويَّةُ وَالعَرَبِيَّةُ وَالإِنْجِلِيزِيَّةُ', 'مُرَاجَعَةُ الاسْتِخْدَامِ وَالمُلَاحَظَاتِ بَعْدَ التَّجْرِبَةِ'],
    privacyTitle: 'الخُصُوصِيَّةُ جُزْءٌ مِنَ التَّصْمِيمِ',
    privacyBody: 'لَا يَقُومُ TEMAN بِتَتَبُّعِ المُعْتَمِرِينَ مُبَاشَرَةً وَبِشَكْلٍ مُسْتَمِرٍّ. يَعْرِضُ Family Link فَقَطِ الحَالَةَ الَّتِي يَخْتَارُ المُعْتَمِرُ إِرْسَالَهَا، مَعَ مَعْلُومَاتِ الرِّحْلَةِ ذَاتِ الصِّلَةِ.',
    processTitle: 'كَيْفَ تُنَفَّذُ التَّجْرِبَةُ؟',
    steps: [
      ['٠١', 'التَّنْسِيقُ', 'نَخْتَارُ ١٠–٣٠ مُعْتَمِرًا، وَمَوَاعِيدَ الرِّحْلَةِ، وَمَسْؤُولًا وَاحِدًا مِنَ الشَّرِكَةِ.'],
      ['٠٢', 'الإِعْدَادُ', 'نُجَهِّزُ المِلَفَّ الأَسَاسِيَّ، وَالفُنْدُقَ، وَالمَجْمُوعَةَ، وَالحَافِلَةَ، وَبَيَانَاتِ التَّوَاصُلِ مَعَ الأُسْرَةِ.'],
      ['٠٣', 'الاِسْتِخْدَامُ', 'يَسْتَخْدِمُ المُعْتَمِرُونَ TEMAN أَثْنَاءَ الرِّحْلَةِ، مَعَ بَقَاءِ إِجْرَاءَاتِ الشَّرِكَةِ التَّشْغِيلِيَّةِ كَمَا هِيَ.'],
      ['٠٤', 'التَّقْيِيمُ', 'بَعْدَ الرِّحْلَةِ نُرَاجِعُ الاِسْتِخْدَامَ وَالمُلَاحَظَاتِ وَالمَشَاكِلَ وَإِمْكَانِيَّةَ الخُطْوَةِ التَّالِيَةِ.'],
    ],
    commitment: 'لَا يُوجَدُ أَيُّ اِلْتِزَامٍ تِجَارِيٍّ فِي التَّجْرِبَةِ الأُولَى. الهَدَفُ هُوَ اخْتِبَارُ الاِسْتِخْدَامِ الفِعْلِيِّ وَجَمْعُ مُلَاحَظَاتِ المُعْتَمِرِينَ وَفَرِيقِ الشَّرِكَةِ.',
    footerTitle: 'هَلْ تَرْغَبُونَ فِي تَجْرِبَةِ TEMAN مَعَ مَجْمُوعَةٍ صَغِيرَةٍ؟',
    footerBody: 'تَوَاصَلُوا مَعَ TGPU Gulf Advisory لِتَنْسِيقِ التَّجْرِبَةِ أَوْ عَرْضٍ تَوْضِيحِيٍّ مُخْتَصَرٍ أَوْ مُنَاقَشَةٍ مَعَ فَرِيقِ التَّشْغِيلِ.',
    emailLabel: 'البَرِيدُ الإِلِكْتُرُونِيُّ',
  },
} as const;

function appLocale(): Locale {
  const lang = document.documentElement.lang.toLowerCase();
  if (lang.startsWith('ar')) return 'ar';
  if (lang.startsWith('en')) return 'en';
  return 'ms';
}

function queryPilotLocale(): Locale | null {
  const value = new URLSearchParams(window.location.search).get('pilotLang');
  return value === 'ar' || value === 'en' || value === 'ms' ? value : null;
}

function requestPilot(locale: Locale) {
  const subjects: Record<Locale, string> = {
    ms: 'TEMAN Haramain – Permohonan Pilot Percuma',
    en: 'TEMAN Haramain – Free Pilot Request',
    ar: 'TEMAN Haramain – طلب تجربة مجانية',
  };
  const bodies: Record<Locale, string> = {
    ms: 'Salam, saya berminat untuk berbincang mengenai pilot percuma TEMAN Haramain untuk kumpulan jemaah kami. Mohon hubungi saya untuk langkah seterusnya.',
    en: 'Hello, I am interested in discussing a free TEMAN Haramain pilot for our pilgrim group. Please contact me regarding the next steps.',
    ar: 'السلام عليكم، نرغب في مناقشة تجربة مجانية لتطبيق TEMAN Haramain مع مجموعة من المعتمرين لدينا. نرجو التواصل معنا بشأن الخطوات التالية.',
  };
  window.location.href = `mailto:${PILOT_EMAIL}?subject=${encodeURIComponent(subjects[locale])}&body=${encodeURIComponent(bodies[locale])}`;
}

export function initOperatorPilotPage() {
  if (document.querySelector('.temanOperatorOverlay')) return;

  let pilotLocale: Locale = queryPilotLocale() || appLocale();
  let teaser: HTMLElement | null = null;
  const overlay = document.createElement('section');
  overlay.className = 'temanOperatorOverlay';
  overlay.hidden = true;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  document.body.appendChild(overlay);

  const renderTeaser = () => {
    const hero = document.querySelector<HTMLElement>('.hero');
    const page = hero?.closest<HTMLElement>('main.page');
    if (!hero || !page) {
      teaser?.remove();
      teaser = null;
      return;
    }

    if (!teaser || !teaser.isConnected) {
      teaser = document.createElement('section');
      teaser.className = 'temanOperatorTeaser';
      page.appendChild(teaser);
    }

    const c = COPY[appLocale()];
    teaser.innerHTML = `
      <div class="temanOperatorTeaserCopy">
        <span>${c.teaserEyebrow}</span>
        <strong>${c.teaserTitle}</strong>
        <p>${c.teaserBody}</p>
      </div>
      <button type="button" data-open-operator-pilot>${c.teaserCta} <b aria-hidden="true">›</b></button>
    `;
    teaser.querySelector<HTMLButtonElement>('[data-open-operator-pilot]')?.addEventListener('click', openOverlay);
  };

  const renderOverlay = () => {
    const c = COPY[pilotLocale];
    overlay.dir = pilotLocale === 'ar' ? 'rtl' : 'ltr';
    overlay.lang = pilotLocale;
    overlay.innerHTML = `
      <div class="temanOperatorShell">
        <nav class="temanOperatorTopbar">
          <div class="temanOperatorBrand"><span>TGPU</span><strong>TEMAN Haramain</strong></div>
          <div class="temanOperatorNavActions">
            <div class="temanOperatorLanguages" aria-label="Language">
              <button type="button" data-pilot-lang="ms" ${pilotLocale === 'ms' ? 'data-active="true"' : ''}>BM</button>
              <button type="button" data-pilot-lang="en" ${pilotLocale === 'en' ? 'data-active="true"' : ''}>EN</button>
              <button type="button" data-pilot-lang="ar" ${pilotLocale === 'ar' ? 'data-active="true"' : ''}>العربية</button>
            </div>
            <button type="button" class="temanOperatorClose" data-close-operator aria-label="${c.close}">×</button>
          </div>
        </nav>

        <main class="temanOperatorContent">
          <section class="temanOperatorHero">
            <div class="temanOperatorHeroCopy">
              <span class="temanOperatorEyebrow">${c.eyebrow}</span>
              <h1>${c.title}</h1>
              <p>${c.intro}</p>
              <div class="temanOperatorHeroActions">
                <button type="button" class="primary" data-request-pilot>${c.primaryCta}</button>
                <button type="button" class="secondary" data-open-app>${c.secondaryCta}</button>
              </div>
            </div>
            <div class="temanOperatorTrust">
              ${c.trust.map(item => `<span>✓ ${item}</span>`).join('')}
            </div>
          </section>

          <section class="temanOperatorSection">
            <div class="temanOperatorSectionHead"><span>01</span><h2>${c.outcomeTitle}</h2></div>
            <div class="temanOperatorOutcomeGrid">
              ${c.outcomes.map(([icon, title, body]) => `<article><span class="icon">${icon}</span><h3>${title}</h3><p>${body}</p></article>`).join('')}
            </div>
          </section>

          <section class="temanOperatorSplit">
            <article class="temanOperatorInclude">
              <div class="temanOperatorSectionHead"><span>02</span><h2>${c.includeTitle}</h2></div>
              <ul>${c.includes.map(item => `<li><b>✓</b><span>${item}</span></li>`).join('')}</ul>
            </article>
            <article class="temanOperatorPrivacy">
              <span class="lock">🔒</span>
              <h2>${c.privacyTitle}</h2>
              <p>${c.privacyBody}</p>
            </article>
          </section>

          <section class="temanOperatorSection">
            <div class="temanOperatorSectionHead"><span>03</span><h2>${c.processTitle}</h2></div>
            <div class="temanOperatorSteps">
              ${c.steps.map(([number, title, body]) => `<article><span>${number}</span><div><h3>${title}</h3><p>${body}</p></div></article>`).join('')}
            </div>
            <p class="temanOperatorCommitment">${c.commitment}</p>
          </section>

          <section class="temanOperatorFooterCta">
            <div><span>TGPU Gulf Advisory</span><h2>${c.footerTitle}</h2><p>${c.footerBody}</p></div>
            <div class="temanOperatorFooterActions">
              <button type="button" data-request-pilot>${c.primaryCta}</button>
              <a href="mailto:${PILOT_EMAIL}">${c.emailLabel}: ${PILOT_EMAIL}</a>
            </div>
          </section>
        </main>
      </div>
    `;

    overlay.querySelector<HTMLButtonElement>('[data-close-operator]')?.addEventListener('click', closeOverlay);
    overlay.querySelector<HTMLButtonElement>('[data-open-app]')?.addEventListener('click', closeOverlay);
    overlay.querySelectorAll<HTMLButtonElement>('[data-request-pilot]').forEach(button => button.addEventListener('click', () => requestPilot(pilotLocale)));
    overlay.querySelectorAll<HTMLButtonElement>('[data-pilot-lang]').forEach(button => button.addEventListener('click', () => {
      const next = button.dataset.pilotLang as Locale;
      if (!['ms', 'en', 'ar'].includes(next)) return;
      pilotLocale = next;
      const url = new URL(window.location.href);
      url.searchParams.set('pilotLang', next);
      history.replaceState({}, '', url);
      renderOverlay();
    }));
  };

  function openOverlay() {
    pilotLocale = queryPilotLocale() || appLocale();
    renderOverlay();
    overlay.hidden = false;
    document.body.classList.add('teman-operator-open');
    overlay.scrollTop = 0;
    overlay.querySelector<HTMLButtonElement>('[data-close-operator]')?.focus();
  }

  function closeOverlay() {
    overlay.hidden = true;
    document.body.classList.remove('teman-operator-open');
    teaser?.querySelector<HTMLButtonElement>('[data-open-operator-pilot]')?.focus();
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !overlay.hidden) closeOverlay();
  });

  onTemanUiRefresh(() => {
    renderTeaser();
    if (!overlay.hidden && !queryPilotLocale()) {
      pilotLocale = appLocale();
      renderOverlay();
    }
  });

  renderTeaser();
  window.setTimeout(renderTeaser, 150);
  window.setTimeout(renderTeaser, 600);

  if (new URLSearchParams(window.location.search).get('pilot') === '1') {
    window.setTimeout(openOverlay, 180);
  }
}
