import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, Building2, Bus, Languages, MapPin, Phone, ShieldCheck, UserRound, UsersRound, Volume2 } from 'lucide-react';

type Locale = 'ms' | 'ar' | 'en';
type Page = 'home' | 'setup' | 'emergency' | 'translate' | 'ibadah';
type City = 'makkah' | 'madinah';
type EmergencyKind = 'lost' | 'unwell' | 'bus';
type Profile = {
  pilgrimName: string;
  preferredName: string;
  hotelMakkah: string;
  hotelMadinah: string;
  hotelAddress: string;
  hotelAddressMakkah: string;
  hotelAddressMadinah: string;
  groupCode: string;
  busNumber: string;
  mutawwifName: string;
  mutawwifPhone: string;
  familyName: string;
  familyPhone: string;
};

const EMPTY: Profile = {
  pilgrimName: '', preferredName: '', hotelMakkah: '', hotelMadinah: '', hotelAddress: '', hotelAddressMakkah: '', hotelAddressMadinah: '',
  groupCode: '', busNumber: '', mutawwifName: '', mutawwifPhone: '', familyName: '', familyPhone: '',
};

const COPY = {
  ms: {
    subtitle: 'Keselamatan jemaah • Mesra warga emas', hello: 'Assalamualaikum', need: 'Apa yang anda perlukan?',
    hint: 'Tekan satu butang sahaja. Maklumat penting disimpan pada telefon ini.', help: 'BANTU SAYA SEKARANG',
    helpHint: 'Sesat, sakit, terpisah atau perlukan bantuan', hotel: 'BALIK KE HOTEL', hotelHint: 'Belum ada hotel untuk bandar ini',
    group: 'CARI KUMPULAN SAYA', groupHint: 'Kumpulan, bas dan mutawwif', translate: 'CAKAP & TERJEMAH', translateHint: 'Bahasa Melayu ⇄ العربية ⇄ English',
    ibadah: 'PANDUAN IBADAH', ibadahHint: 'Panduan ringkas Umrah / Haji', setup: 'SEDIAKAN PROFIL JEMAAH', setupHint: 'Anak / keluarga isi sebelum berlepas',
    saved: 'Profil disimpan pada peranti', notReady: 'Profil belum lengkap', ready: 'PROFIL KESELAMATAN SEDIA', back: 'Kembali', save: 'Simpan Profil',
    setupTitle: 'Sediakan TEMAN untuk Ayah / Ibu', setupIntro: 'Isi maklumat yang akan membantu jika jemaah sesat, terpisah atau perlukan bantuan.',
    name: 'Nama penuh jemaah', preferred: 'Nama panggilan', makkah: 'Hotel Makkah', madinah: 'Hotel Madinah', makkahAddress: 'Alamat / lokasi hotel Makkah', madinahAddress: 'Alamat / lokasi hotel Madinah',
    groupCode: 'Kod kumpulan', bus: 'Nombor bas', mutawwif: 'Nama mutawwif', mutawwifPhone: 'Telefon mutawwif', family: 'Nama ahli keluarga', familyPhone: 'Telefon keluarga',
    crisis: 'Apa yang berlaku?', lost: 'SAYA SESAT', lostHint: 'Tunjukkan skrin bantuan kepada petugas', unwell: 'SAYA TAK SIHAT', unwellHint: 'Minta bantuan perubatan dan hubungi orang dipercayai',
    busLost: 'SAYA TAK JUMPA BAS', busLostHint: 'Tunjukkan nombor bas, kumpulan dan mutawwif', callGuide: 'HUBUNGI MUTAWWIF', callFamily: 'HUBUNGI KELUARGA', showCard: 'TUNJUKKAN SKRIN INI',
    openMap: 'BUKA LOKASI HOTEL', speakArabic: 'MAIN ARABIC', translateTitle: 'Cakap. TEMAN bantu terjemah.',
    translateIntro: 'Pilih frasa penting dan mainkan versi Arab dengan kuat kepada petugas atau orang berdekatan.',
    choosePhrase: 'Pilih frasa', phraseLost: 'Saya sesat dan mahu balik ke hotel.', phraseBus: 'Saya tidak jumpa bas kumpulan saya.', phraseSick: 'Saya tidak sihat dan perlukan bantuan.', phraseGuide: 'Tolong hubungi mutawwif saya.',
    guideTitle: 'Panduan Ibadah Ringkas', guideNote: 'Rujukan ringkas untuk membantu ingatan. Ikuti bimbingan mutawwif dan pihak berautoriti bagi persoalan ibadah.',
    currentCity: 'LOKASI SEMASA', makkahCity: 'Makkah', madinahCity: 'Madinah', locationHint: 'Pilih bandar anda sekarang supaya TEMAN tunjuk hotel yang betul.',
    editProfile: 'Lengkapkan profil dahulu untuk menggunakan fungsi ini.', selectedIssue: 'Bantuan dipilih',
  },
  en: {
    subtitle: 'Pilgrim safety • Senior friendly', hello: 'Welcome', need: 'What do you need?',
    hint: 'Tap one large button. Important information stays on this phone.', help: 'HELP ME NOW', helpHint: 'Lost, unwell, separated, or need assistance',
    hotel: 'RETURN TO HOTEL', hotelHint: 'No hotel saved for this city', group: 'FIND MY GROUP', groupHint: 'Group, bus, and mutawwif',
    translate: 'SPEAK & TRANSLATE', translateHint: 'Bahasa Melayu ⇄ العربية ⇄ English', ibadah: 'IBADAH GUIDE', ibadahHint: 'Simple Umrah / Hajj guidance',
    setup: 'PREPARE PILGRIM PROFILE', setupHint: 'Family completes this before travel', saved: 'Profile saved on this device', notReady: 'Profile is incomplete', ready: 'SAFETY PROFILE READY',
    back: 'Back', save: 'Save Profile', setupTitle: 'Prepare TEMAN for Mum / Dad', setupIntro: 'Add information that can help if the pilgrim is lost, separated, or needs assistance.',
    name: 'Pilgrim full name', preferred: 'Preferred name', makkah: 'Makkah hotel', madinah: 'Madinah hotel', makkahAddress: 'Makkah hotel address / location', madinahAddress: 'Madinah hotel address / location',
    groupCode: 'Group code', bus: 'Bus number', mutawwif: 'Mutawwif name', mutawwifPhone: 'Mutawwif phone', family: 'Family contact name', familyPhone: 'Family phone', crisis: 'What happened?',
    lost: 'I AM LOST', lostHint: 'Show the help screen to an officer', unwell: 'I FEEL UNWELL', unwellHint: 'Ask for medical help and contact someone you trust', busLost: 'I CANNOT FIND MY BUS', busLostHint: 'Show your bus, group, and mutawwif details',
    callGuide: 'CALL MUTAWWIF', callFamily: 'CALL FAMILY', showCard: 'SHOW THIS SCREEN', openMap: 'OPEN HOTEL LOCATION', speakArabic: 'PLAY ARABIC',
    translateTitle: 'Speak. TEMAN helps translate.', translateIntro: 'Choose an important phrase and play the Arabic version aloud to an officer or someone nearby.', choosePhrase: 'Choose a phrase',
    phraseLost: 'I am lost and want to return to my hotel.', phraseBus: 'I cannot find my group bus.', phraseSick: 'I feel unwell and need help.', phraseGuide: 'Please contact my mutawwif.',
    guideTitle: 'Simple Ibadah Guide', guideNote: 'A simple memory aid. Follow your mutawwif and relevant religious authorities for ibadah questions.',
    currentCity: 'CURRENT LOCATION', makkahCity: 'Makkah', madinahCity: 'Madinah', locationHint: 'Choose where you are now so TEMAN shows the correct hotel.',
    editProfile: 'Complete the pilgrim profile first to use this function.', selectedIssue: 'Selected assistance',
  },
  ar: {
    subtitle: 'سلامة الحجاج والمعتمرين • مناسب لكبار السن', hello: 'السلام عليكم', need: 'ماذا تحتاج؟', hint: 'اضغط على زر واحد فقط. المعلومات المهمة محفوظة على هذا الهاتف.',
    help: 'ساعدني الآن', helpHint: 'ضائع أو مريض أو منفصل عن المجموعة أو تحتاج إلى مساعدة', hotel: 'العودة إلى الفندق', hotelHint: 'لا يوجد فندق محفوظ لهذه المدينة', group: 'العثور على مجموعتي',
    groupHint: 'المجموعة والحافلة والمطوف', translate: 'تحدث وترجم', translateHint: 'Bahasa Melayu ⇄ العربية ⇄ English', ibadah: 'دليل العبادة', ibadahHint: 'إرشادات مبسطة للعمرة والحج',
    setup: 'إعداد ملف الحاج / المعتمر', setupHint: 'تقوم الأسرة بإكماله قبل السفر', saved: 'تم حفظ الملف على هذا الجهاز', notReady: 'الملف غير مكتمل', ready: 'ملف السلامة جاهز',
    back: 'رجوع', save: 'حفظ الملف', setupTitle: 'إعداد TEMAN للوالد / الوالدة', setupIntro: 'أدخل المعلومات التي تساعد عند الضياع أو الانفصال عن المجموعة أو الحاجة إلى مساعدة.',
    name: 'الاسم الكامل', preferred: 'الاسم المفضل', makkah: 'فندق مكة', madinah: 'فندق المدينة', makkahAddress: 'عنوان / موقع فندق مكة', madinahAddress: 'عنوان / موقع فندق المدينة',
    groupCode: 'رمز المجموعة', bus: 'رقم الحافلة', mutawwif: 'اسم المطوف', mutawwifPhone: 'هاتف المطوف', family: 'اسم فرد الأسرة', familyPhone: 'هاتف الأسرة', crisis: 'ماذا حدث؟',
    lost: 'أنا ضائع', lostHint: 'اعرض شاشة المساعدة للموظف', unwell: 'أنا مريض', unwellHint: 'اطلب مساعدة طبية وتواصل مع شخص موثوق', busLost: 'لا أجد الحافلة', busLostHint: 'اعرض رقم الحافلة والمجموعة وبيانات المطوف',
    callGuide: 'اتصل بالمطوف', callFamily: 'اتصل بالأسرة', showCard: 'اعرض هذه الشاشة', openMap: 'افتح موقع الفندق', speakArabic: 'تشغيل العربية',
    translateTitle: 'تحدث. TEMAN يساعد في الترجمة.', translateIntro: 'اختر عبارة مهمة وشغّل النسخة العربية بصوت مرتفع للموظف أو لمن حولك.', choosePhrase: 'اختر العبارة',
    phraseLost: 'أنا ضائع وأريد العودة إلى الفندق.', phraseBus: 'لا أجد حافلة مجموعتي.', phraseSick: 'أنا مريض وأحتاج إلى مساعدة.', phraseGuide: 'يرجى الاتصال بالمطوف.',
    guideTitle: 'دليل عبادة مبسط', guideNote: 'مرجع مختصر للتذكير. اتبع إرشادات المطوف والجهات الشرعية الموثوقة في مسائل العبادة.',
    currentCity: 'الموقع الحالي', makkahCity: 'مكة', madinahCity: 'المدينة', locationHint: 'اختر المدينة التي أنت فيها الآن ليعرض TEMAN الفندق الصحيح.',
    editProfile: 'أكمل ملف الحاج أو المعتمر أولاً لاستخدام هذه الوظيفة.', selectedIssue: 'المساعدة المختارة',
  },
} as const;

const PHRASES = [
  { key: 'phraseLost', ar: 'أنا ضائع وأريد العودة إلى فندقي. هل يمكنك مساعدتي؟', en: 'I am lost and want to return to my hotel. Could you help me?' },
  { key: 'phraseBus', ar: 'لم أتمكن من العثور على حافلة مجموعتي. هل يمكنك مساعدتي؟', en: 'I cannot find my group bus. Could you help me?' },
  { key: 'phraseSick', ar: 'أنا متعب ولا أشعر أنني بخير. أحتاج إلى مساعدة.', en: 'I feel unwell and need assistance.' },
  { key: 'phraseGuide', ar: 'من فضلك ساعدني في الاتصال بمسؤول مجموعتي.', en: 'Please help me contact my group leader.' },
] as const;

const EMERGENCY_MESSAGES: Record<EmergencyKind, { ar: string; en: string }> = {
  lost: {
    ar: 'أنا حاج أو معتمر من ماليزيا وقد ضللت عن مجموعتي. الرجاء مساعدتي في العودة إلى فندقي والتواصل مع مسؤول مجموعتي.',
    en: 'I am a Malaysian pilgrim and I am separated from my group. Please help me return to my hotel and contact my group leader.',
  },
  unwell: {
    ar: 'أنا حاج أو معتمر من ماليزيا وأشعر بتوعك. الرجاء مساعدتي في الحصول على مساعدة طبية والتواصل مع مسؤول مجموعتي.',
    en: 'I am a Malaysian pilgrim and I feel unwell. Please help me get medical assistance and contact my group leader.',
  },
  bus: {
    ar: 'أنا حاج أو معتمر من ماليزيا ولم أجد حافلة مجموعتي. الرجاء مساعدتي في العثور على مجموعتي والتواصل مع مسؤولها.',
    en: 'I am a Malaysian pilgrim and I cannot find my group bus. Please help me find my group and contact my group leader.',
  },
};

const GUIDE: Record<Locale, Array<{ title: string; body: string }>> = {
  ms: [
    { title: 'Ihram', body: 'Niat, pakaian ihram dan larangan ihram.' },
    { title: 'Tawaf', body: 'Tujuh pusingan mengelilingi Kaabah mengikut panduan yang betul.' },
    { title: "Sa'i", body: 'Safa ke Marwah sebanyak tujuh perjalanan.' },
    { title: 'Tahallul', body: 'Bercukur atau bergunting mengikut panduan yang sah.' },
  ],
  en: [
    { title: 'Ihram', body: 'Intention, ihram clothing, and the restrictions of ihram.' },
    { title: 'Tawaf', body: 'Seven circuits around the Kaabah following the proper guidance.' },
    { title: "Sa'i", body: 'Seven journeys between Safa and Marwah.' },
    { title: 'Tahallul', body: 'Shave or trim the hair according to the proper guidance.' },
  ],
  ar: [
    { title: 'الإحرام', body: 'النية ولباس الإحرام ومحظورات الإحرام.' },
    { title: 'الطواف', body: 'سبعة أشواط حول الكعبة وفق الإرشادات الصحيحة.' },
    { title: 'السعي', body: 'سبعة أشواط بين الصفا والمروة.' },
    { title: 'التحلل', body: 'الحلق أو التقصير وفق الإرشادات الشرعية.' },
  ],
};

function loadProfile(): Profile {
  try {
    const saved = { ...EMPTY, ...JSON.parse(localStorage.getItem('teman-profile') || '{}') } as Profile;
    if (saved.hotelAddress && saved.hotelMakkah && !saved.hotelAddressMakkah) saved.hotelAddressMakkah = saved.hotelAddress;
    if (saved.hotelAddress && saved.hotelMadinah && !saved.hotelAddressMadinah) saved.hotelAddressMadinah = saved.hotelAddress;
    return saved;
  } catch {
    return EMPTY;
  }
}

function loadCity(): City {
  return localStorage.getItem('teman-city') === 'madinah' ? 'madinah' : 'makkah';
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(() => (localStorage.getItem('teman-locale') as Locale) || 'ms');
  const [page, setPage] = useState<Page>('home');
  const [profile, setProfile] = useState<Profile>(loadProfile);
  const [draft, setDraft] = useState<Profile>(profile);
  const [city, setCityState] = useState<City>(loadCity);
  const [emergencyKind, setEmergencyKind] = useState<EmergencyKind>('lost');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const t = COPY[locale];
  const rtl = locale === 'ar';

  const hotel = city === 'makkah' ? profile.hotelMakkah : profile.hotelMadinah;
  const hotelAddress = city === 'makkah' ? (profile.hotelAddressMakkah || profile.hotelAddress) : (profile.hotelAddressMadinah || profile.hotelAddress);
  const hasAnyHotel = Boolean(profile.hotelMakkah || profile.hotelMadinah);
  const ready = Boolean(profile.pilgrimName && hasAnyHotel && profile.mutawwifPhone && profile.familyPhone);
  const selectedPhrase = PHRASES[phraseIndex];
  const emergencyMessage = EMERGENCY_MESSAGES[emergencyKind];
  const emergencyLabel = useMemo(() => ({ lost: t.lost, unwell: t.unwell, bus: t.busLost }[emergencyKind]), [emergencyKind, t]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  }, [locale, rtl]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [page]);

  const setLang = (next: Locale) => {
    setLocale(next);
    localStorage.setItem('teman-locale', next);
  };

  const setCity = (next: City) => {
    setCityState(next);
    localStorage.setItem('teman-city', next);
  };

  const saveProfile = () => {
    const cleaned: Profile = {
      ...draft,
      pilgrimName: draft.pilgrimName.trim(),
      preferredName: draft.preferredName.trim(),
      hotelMakkah: draft.hotelMakkah.trim(),
      hotelMadinah: draft.hotelMadinah.trim(),
      hotelAddressMakkah: draft.hotelAddressMakkah.trim(),
      hotelAddressMadinah: draft.hotelAddressMadinah.trim(),
      groupCode: draft.groupCode.trim(),
      busNumber: draft.busNumber.trim(),
      mutawwifName: draft.mutawwifName.trim(),
      mutawwifPhone: draft.mutawwifPhone.trim(),
      familyName: draft.familyName.trim(),
      familyPhone: draft.familyPhone.trim(),
    };
    setProfile(cleaned);
    setDraft(cleaned);
    localStorage.setItem('teman-profile', JSON.stringify(cleaned));
    setPage('home');
  };

  const speak = (text: string, lang = 'ar-SA') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
  };

  const phone = (number: string) => {
    if (!number) return;
    const cleaned = number.trim().replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
    if (cleaned) window.location.href = `tel:${cleaned}`;
  };

  const openHotel = () => {
    const query = [hotel, hotelAddress].filter(Boolean).join(' ');
    if (!query) {
      setDraft(profile);
      setPage('setup');
      return;
    }
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
  };

  const chooseEmergency = (kind: EmergencyKind) => {
    setEmergencyKind(kind);
    window.setTimeout(() => document.getElementById('help-card')?.scrollIntoView({ block: 'start' }), 0);
  };

  const field = (key: keyof Profile, label: string, placeholder = '') => {
    const isPhone = key === 'mutawwifPhone' || key === 'familyPhone';
    return (
      <label className="field">
        <span>{label}</span>
        <input
          value={draft[key]}
          placeholder={placeholder}
          type={isPhone ? 'tel' : 'text'}
          inputMode={isPhone ? 'tel' : undefined}
          autoComplete="off"
          onChange={e => setDraft({ ...draft, [key]: e.target.value })}
        />
      </label>
    );
  };

  const citySelector = (
    <section className="cityPanel" aria-label={t.currentCity}>
      <div className="cityHeading"><div><strong>{t.currentCity}</strong><span>{t.locationHint}</span></div><MapPin size={24}/></div>
      <div className="citySwitch">
        <button type="button" className={city === 'makkah' ? 'active' : ''} aria-pressed={city === 'makkah'} onClick={() => setCity('makkah')}>{t.makkahCity}</button>
        <button type="button" className={city === 'madinah' ? 'active' : ''} aria-pressed={city === 'madinah'} onClick={() => setCity('madinah')}>{t.madinahCity}</button>
      </div>
    </section>
  );

  const back = <button type="button" className="back" onClick={() => setPage('home')}><ArrowLeft size={22} /> {t.back}</button>;

  return <div className="shell" dir={rtl ? 'rtl' : 'ltr'}>
    <header className="topbar">
      <div className="brand"><div className="mark" aria-hidden="true">T</div><div><strong>TEMAN Haramain</strong><span>by TGPU</span></div></div>
      <div className="langs" aria-label="Language selector">
        <button type="button" aria-pressed={locale === 'ms'} className={locale === 'ms' ? 'active' : ''} onClick={() => setLang('ms')}>BM</button>
        <button type="button" aria-pressed={locale === 'ar'} className={locale === 'ar' ? 'active' : ''} onClick={() => setLang('ar')}>العربية</button>
        <button type="button" aria-pressed={locale === 'en'} className={locale === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
      </div>
    </header>

    {page === 'home' && <main className="page">
      <section className="hero"><span className="eyebrow">{t.subtitle}</span><h1>{t.hello}{profile.preferredName ? `, ${profile.preferredName}` : ''}</h1><h2>{t.need}</h2><p>{t.hint}</p></section>
      <div className={ready ? 'readiness ready' : 'readiness'} role="status" aria-live="polite"><ShieldCheck size={22}/><div><strong>{ready ? t.ready : t.notReady}</strong><span>{ready ? t.saved : t.setupHint}</span></div></div>
      {citySelector}
      <button type="button" className="action emergency" onClick={() => setPage('emergency')}><AlertTriangle size={32}/><div><strong>{t.help}</strong><span>{t.helpHint}</span></div><b aria-hidden="true">→</b></button>
      <div className="two">
        <button type="button" className="action" onClick={openHotel}><Building2 size={28}/><div><strong>{t.hotel}</strong><span>{hotel || t.hotelHint}</span></div><b aria-hidden="true">→</b></button>
        <button type="button" className="action" onClick={() => { setEmergencyKind('bus'); setPage('emergency'); }}><UsersRound size={28}/><div><strong>{t.group}</strong><span>{profile.groupCode || profile.busNumber || t.groupHint}</span></div><b aria-hidden="true">→</b></button>
      </div>
      <div className="grid">
        <button type="button" onClick={() => setPage('translate')}><Languages/><strong>{t.translate}</strong><span>{t.translateHint}</span></button>
        <button type="button" onClick={() => setPage('ibadah')}><UserRound/><strong>{t.ibadah}</strong><span>{t.ibadahHint}</span></button>
        <button type="button" onClick={() => { setDraft(profile); setPage('setup'); }}><ShieldCheck/><strong>{t.setup}</strong><span>{t.setupHint}</span></button>
      </div>
    </main>}

    {page === 'setup' && <main className="page">{back}<section className="sectionHead"><h1>{t.setupTitle}</h1><p>{t.setupIntro}</p></section>
      <div className="form">
        {field('pilgrimName', t.name)}{field('preferredName', t.preferred)}
        {field('hotelMakkah', t.makkah)}{field('hotelAddressMakkah', t.makkahAddress)}
        {field('hotelMadinah', t.madinah)}{field('hotelAddressMadinah', t.madinahAddress)}
        {field('groupCode', t.groupCode)}{field('busNumber', t.bus)}{field('mutawwifName', t.mutawwif)}{field('mutawwifPhone', t.mutawwifPhone, '+966...')}{field('familyName', t.family)}{field('familyPhone', t.familyPhone, '+60...')}
      </div>
      <button type="button" className="primary" onClick={saveProfile}>{t.save} →</button>
    </main>}

    {page === 'emergency' && <main className="page">{back}<section className="sectionHead"><h1>{t.crisis}</h1><p>{t.helpHint}</p></section>
      {citySelector}
      <div className="emergencyChoices" role="group" aria-label={t.crisis}>
        <button type="button" className={`action emergencyChoice ${emergencyKind === 'lost' ? 'selected' : ''}`} aria-pressed={emergencyKind === 'lost'} onClick={() => chooseEmergency('lost')}><MapPin size={32}/><div><strong>{t.lost}</strong><span>{t.lostHint}</span></div><b aria-hidden="true">→</b></button>
        <button type="button" className={`action emergencyChoice ${emergencyKind === 'unwell' ? 'selected' : ''}`} aria-pressed={emergencyKind === 'unwell'} onClick={() => chooseEmergency('unwell')}><AlertTriangle size={30}/><div><strong>{t.unwell}</strong><span>{t.unwellHint}</span></div><b aria-hidden="true">→</b></button>
        <button type="button" className={`action emergencyChoice ${emergencyKind === 'bus' ? 'selected' : ''}`} aria-pressed={emergencyKind === 'bus'} onClick={() => chooseEmergency('bus')}><Bus size={30}/><div><strong>{t.busLost}</strong><span>{profile.busNumber || profile.groupCode || t.busLostHint}</span></div><b aria-hidden="true">→</b></button>
      </div>
      <div className="contactRow"><button type="button" disabled={!profile.mutawwifPhone} onClick={() => phone(profile.mutawwifPhone)}><Phone/> {t.callGuide}</button><button type="button" disabled={!profile.familyPhone} onClick={() => phone(profile.familyPhone)}><Phone/> {t.callFamily}</button></div>
      {!profile.mutawwifPhone && !profile.familyPhone && <p className="assistNote">{t.editProfile}</p>}
      <section className="helpCard" id="help-card" aria-live="polite">
        <div className="helpCardHead"><span className="cardLabel">{t.showCard}</span><strong>{t.selectedIssue}: {emergencyLabel}</strong></div>
        <p className="arabic">{emergencyMessage.ar}</p><p>{emergencyMessage.en}</p>
        <div className="facts">
          <div><span>CITY / المدينة</span><strong>{city === 'makkah' ? t.makkahCity : t.madinahCity}</strong></div>
          <div><span>HOTEL / الفندق</span><strong>{hotel || '—'}</strong>{hotelAddress && <small>{hotelAddress}</small>}</div>
          <div><span>GROUP / المجموعة</span><strong>{profile.groupCode || '—'} {profile.busNumber ? `• Bus ${profile.busNumber}` : ''}</strong></div>
          <div><span>MUTAWWIF / مسؤول المجموعة</span><strong>{profile.mutawwifName || '—'} {profile.mutawwifPhone}</strong></div>
        </div>
        <div className="contactRow"><button type="button" onClick={() => speak(emergencyMessage.ar)}><Volume2/> {t.speakArabic}</button><button type="button" disabled={!hotel && !hotelAddress} onClick={openHotel}><MapPin/> {t.openMap}</button></div>
      </section>
    </main>}

    {page === 'translate' && <main className="page">{back}<section className="sectionHead"><h1>{t.translateTitle}</h1><p>{t.translateIntro}</p></section>
      <div className="phraseList"><span>{t.choosePhrase}</span>{PHRASES.map((phrase, index) => <button type="button" key={phrase.key} className={index === phraseIndex ? 'selected' : ''} aria-pressed={index === phraseIndex} onClick={() => setPhraseIndex(index)}>{t[phrase.key]}</button>)}</div>
      <section className="translationCard"><span>العربية</span><p className="arabic">{selectedPhrase.ar}</p><button type="button" className="primary" onClick={() => speak(selectedPhrase.ar)}><Volume2/> {t.speakArabic}</button><span>English</span><p>{selectedPhrase.en}</p></section>
    </main>}

    {page === 'ibadah' && <main className="page">{back}<section className="sectionHead"><h1>{t.guideTitle}</h1><p>{t.guideNote}</p></section>
      <div className="guide">{GUIDE[locale].map((item, index) => <article key={item.title}><b>{index + 1}</b><div><h3>{item.title}</h3><p>{item.body}</p></div></article>)}</div>
    </main>}
  </div>;
}
