import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, Building2, Bus, Languages, MapPin, Phone, ShieldCheck, UserRound, UsersRound, Volume2 } from 'lucide-react';

type Locale = 'ms' | 'ar' | 'en';
type Page = 'home' | 'setup' | 'emergency' | 'translate' | 'ibadah';
type Profile = {
  pilgrimName: string;
  preferredName: string;
  hotelMakkah: string;
  hotelMadinah: string;
  hotelAddress: string;
  groupCode: string;
  busNumber: string;
  mutawwifName: string;
  mutawwifPhone: string;
  familyName: string;
  familyPhone: string;
};

const EMPTY: Profile = {
  pilgrimName: '', preferredName: '', hotelMakkah: '', hotelMadinah: '', hotelAddress: '', groupCode: '', busNumber: '',
  mutawwifName: '', mutawwifPhone: '', familyName: '', familyPhone: '',
};

const COPY = {
  ms: {
    subtitle: 'Keselamatan jemaah • Mesra warga emas', hello: 'Assalamualaikum', need: 'Apa yang anda perlukan?',
    hint: 'Tekan satu butang sahaja. Maklumat penting disimpan pada telefon ini.', help: 'BANTU SAYA SEKARANG',
    helpHint: 'Sesat, sakit, terpisah atau perlukan bantuan', hotel: 'BALIK KE HOTEL', hotelHint: 'Tunjuk hotel dan alamat tersimpan',
    group: 'CARI KUMPULAN SAYA', groupHint: 'Kumpulan, bas dan mutawwif', translate: 'CAKAP & TERJEMAH', translateHint: 'Bahasa Melayu ⇄ العربية ⇄ English',
    ibadah: 'PANDUAN IBADAH', ibadahHint: 'Panduan ringkas Umrah / Haji', setup: 'SEDIAKAN PROFIL JEMAAH', setupHint: 'Anak / keluarga isi sebelum berlepas',
    saved: 'Profil disimpan pada peranti', notReady: 'Profil belum lengkap', ready: 'PROFIL KESELAMATAN SEDIA', back: 'Kembali', save: 'Simpan Profil',
    setupTitle: 'Sediakan TEMAN untuk Ayah / Ibu', setupIntro: 'Isi maklumat yang akan membantu jika jemaah sesat, terpisah atau perlukan bantuan.',
    name: 'Nama penuh jemaah', preferred: 'Nama panggilan', makkah: 'Hotel Makkah', madinah: 'Hotel Madinah', address: 'Alamat / lokasi hotel',
    groupCode: 'Kod kumpulan', bus: 'Nombor bas', mutawwif: 'Nama mutawwif', mutawwifPhone: 'Telefon mutawwif', family: 'Nama ahli keluarga', familyPhone: 'Telefon keluarga',
    crisis: 'Apa yang berlaku?', lost: 'SAYA SESAT', lostHint: 'Tunjukkan skrin bantuan kepada petugas', unwell: 'SAYA TAK SIHAT', unwellHint: 'Hubungi bantuan / mutawwif / keluarga',
    busLost: 'SAYA TAK JUMPA BAS', callGuide: 'HUBUNGI MUTAWWIF', callFamily: 'HUBUNGI KELUARGA', showCard: 'TUNJUKKAN SKRIN INI',
    arabicHelp: 'أنا حاج أو معتمر من ماليزيا وقد ضللت عن مجموعتي. الرجاء مساعدتي في العودة إلى فندقي والتواصل مع مسؤول مجموعتي.',
    englishHelp: 'I am a Malaysian pilgrim and I am separated from my group. Please help me return to my hotel and contact my group leader.',
    openMap: 'BUKA LOKASI HOTEL', speakArabic: 'MAIN ARABIC', translateTitle: 'Cakap. TEMAN bantu terjemah.',
    translateIntro: 'Versi MVP menggunakan frasa kecemasan yang telah disediakan. Terjemahan suara langsung akan ditambah selepas asas keselamatan stabil.',
    choosePhrase: 'Pilih frasa', phraseLost: 'Saya sesat dan mahu balik ke hotel.', phraseBus: 'Saya tidak jumpa bas kumpulan saya.', phraseSick: 'Saya tidak sihat dan perlukan bantuan.', phraseGuide: 'Tolong hubungi mutawwif saya.',
    guideTitle: 'Panduan Ibadah Ringkas', guideNote: 'Kandungan ini ialah struktur MVP. Versi seterusnya akan menggunakan kandungan yang disemak dan berautoriti.',
  },
  en: {
    subtitle: 'Pilgrim safety • Senior friendly', hello: 'Welcome', need: 'What do you need?',
    hint: 'Tap one large button. Important information stays on this phone.', help: 'HELP ME NOW', helpHint: 'Lost, unwell, separated, or need assistance',
    hotel: 'RETURN TO HOTEL', hotelHint: 'Show saved hotel and address', group: 'FIND MY GROUP', groupHint: 'Group, bus, and mutawwif',
    translate: 'SPEAK & TRANSLATE', translateHint: 'Bahasa Melayu ⇄ العربية ⇄ English', ibadah: 'IBADAH GUIDE', ibadahHint: 'Simple Umrah / Hajj guidance',
    setup: 'PREPARE PILGRIM PROFILE', setupHint: 'Family completes this before travel', saved: 'Profile saved on this device', notReady: 'Profile is incomplete', ready: 'SAFETY PROFILE READY',
    back: 'Back', save: 'Save Profile', setupTitle: 'Prepare TEMAN for Mum / Dad', setupIntro: 'Add information that can help if the pilgrim is lost, separated, or needs assistance.',
    name: 'Pilgrim full name', preferred: 'Preferred name', makkah: 'Makkah hotel', madinah: 'Madinah hotel', address: 'Hotel address / location', groupCode: 'Group code', bus: 'Bus number',
    mutawwif: 'Mutawwif name', mutawwifPhone: 'Mutawwif phone', family: 'Family contact name', familyPhone: 'Family phone', crisis: 'What happened?',
    lost: 'I AM LOST', lostHint: 'Show the help screen to an officer', unwell: 'I FEEL UNWELL', unwellHint: 'Contact assistance / mutawwif / family', busLost: 'I CANNOT FIND MY BUS',
    callGuide: 'CALL MUTAWWIF', callFamily: 'CALL FAMILY', showCard: 'SHOW THIS SCREEN', arabicHelp: 'أنا حاج أو معتمر من ماليزيا وقد ضللت عن مجموعتي. الرجاء مساعدتي في العودة إلى فندقي والتواصل مع مسؤول مجموعتي.',
    englishHelp: 'I am a Malaysian pilgrim and I am separated from my group. Please help me return to my hotel and contact my group leader.', openMap: 'OPEN HOTEL LOCATION', speakArabic: 'PLAY ARABIC',
    translateTitle: 'Speak. TEMAN helps translate.', translateIntro: 'The MVP uses prepared emergency phrases. Live voice translation will be added after the core safety flow is stable.', choosePhrase: 'Choose a phrase',
    phraseLost: 'I am lost and want to return to my hotel.', phraseBus: 'I cannot find my group bus.', phraseSick: 'I feel unwell and need help.', phraseGuide: 'Please contact my mutawwif.',
    guideTitle: 'Simple Ibadah Guide', guideNote: 'This is the MVP structure. The next version will use reviewed, authoritative content.',
  },
  ar: {
    subtitle: 'سلامة الحجاج والمعتمرين • مناسب لكبار السن', hello: 'السلام عليكم', need: 'ماذا تحتاج؟', hint: 'اضغط على زر واحد فقط. المعلومات المهمة محفوظة على هذا الهاتف.',
    help: 'ساعدني الآن', helpHint: 'ضائع أو مريض أو منفصل عن المجموعة أو تحتاج إلى مساعدة', hotel: 'العودة إلى الفندق', hotelHint: 'عرض الفندق والعنوان المحفوظ', group: 'العثور على مجموعتي',
    groupHint: 'المجموعة والحافلة والمطوف', translate: 'تحدث وترجم', translateHint: 'Bahasa Melayu ⇄ العربية ⇄ English', ibadah: 'دليل العبادة', ibadahHint: 'إرشادات مبسطة للعمرة والحج',
    setup: 'إعداد ملف الحاج / المعتمر', setupHint: 'تقوم الأسرة بإكماله قبل السفر', saved: 'تم حفظ الملف على هذا الجهاز', notReady: 'الملف غير مكتمل', ready: 'ملف السلامة جاهز',
    back: 'رجوع', save: 'حفظ الملف', setupTitle: 'إعداد TEMAN للوالد / الوالدة', setupIntro: 'أدخل المعلومات التي تساعد عند الضياع أو الانفصال عن المجموعة أو الحاجة إلى مساعدة.',
    name: 'الاسم الكامل', preferred: 'الاسم المفضل', makkah: 'فندق مكة', madinah: 'فندق المدينة', address: 'عنوان / موقع الفندق', groupCode: 'رمز المجموعة', bus: 'رقم الحافلة', mutawwif: 'اسم المطوف',
    mutawwifPhone: 'هاتف المطوف', family: 'اسم فرد الأسرة', familyPhone: 'هاتف الأسرة', crisis: 'ماذا حدث؟', lost: 'أنا ضائع', lostHint: 'اعرض شاشة المساعدة للموظف', unwell: 'أنا مريض',
    unwellHint: 'اتصل بالمساعدة أو المطوف أو الأسرة', busLost: 'لا أجد الحافلة', callGuide: 'اتصل بالمطوف', callFamily: 'اتصل بالأسرة', showCard: 'اعرض هذه الشاشة',
    arabicHelp: 'أنا حاج أو معتمر من ماليزيا وقد ضللت عن مجموعتي. الرجاء مساعدتي في العودة إلى فندقي والتواصل مع مسؤول مجموعتي.', englishHelp: 'I am a Malaysian pilgrim and I am separated from my group. Please help me return to my hotel and contact my group leader.',
    openMap: 'افتح موقع الفندق', speakArabic: 'تشغيل العربية', translateTitle: 'تحدث. TEMAN يساعد في الترجمة.', translateIntro: 'تستخدم النسخة الأولية عبارات طوارئ جاهزة. ستضاف الترجمة الصوتية المباشرة بعد استقرار وظائف السلامة الأساسية.',
    choosePhrase: 'اختر العبارة', phraseLost: 'أنا ضائع وأريد العودة إلى الفندق.', phraseBus: 'لا أجد حافلة مجموعتي.', phraseSick: 'أنا مريض وأحتاج إلى مساعدة.', phraseGuide: 'يرجى الاتصال بالمطوف.',
    guideTitle: 'دليل عبادة مبسط', guideNote: 'هذه بنية النسخة الأولية. ستستخدم النسخة القادمة محتوى مراجَعًا وموثوقًا.',
  },
} as const;

const PHRASES = [
  { key: 'phraseLost', ar: 'أنا ضائع وأريد العودة إلى فندقي. هل يمكنك مساعدتي؟', en: 'I am lost and want to return to my hotel. Could you help me?' },
  { key: 'phraseBus', ar: 'لم أتمكن من العثور على حافلة مجموعتي. هل يمكنك مساعدتي؟', en: 'I cannot find my group bus. Could you help me?' },
  { key: 'phraseSick', ar: 'أنا متعب ولا أشعر أنني بخير. أحتاج إلى مساعدة.', en: 'I feel unwell and need assistance.' },
  { key: 'phraseGuide', ar: 'من فضلك ساعدني في الاتصال بمسؤول مجموعتي.', en: 'Please help me contact my group leader.' },
] as const;

function loadProfile(): Profile {
  try { return { ...EMPTY, ...JSON.parse(localStorage.getItem('teman-profile') || '{}') }; } catch { return EMPTY; }
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(() => (localStorage.getItem('teman-locale') as Locale) || 'ms');
  const [page, setPage] = useState<Page>('home');
  const [profile, setProfile] = useState<Profile>(loadProfile);
  const [draft, setDraft] = useState<Profile>(profile);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const t = COPY[locale];
  const rtl = locale === 'ar';
  const hotel = profile.hotelMakkah || profile.hotelMadinah;
  const ready = Boolean(profile.pilgrimName && hotel && profile.mutawwifPhone && profile.familyPhone);
  const selectedPhrase = PHRASES[phraseIndex];

  const setLang = (next: Locale) => { setLocale(next); localStorage.setItem('teman-locale', next); };
  const saveProfile = () => { setProfile(draft); localStorage.setItem('teman-profile', JSON.stringify(draft)); setPage('home'); };
  const speak = (text: string, lang = 'ar-SA') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = lang; u.rate = 0.86; window.speechSynthesis.speak(u);
  };
  const phone = (number: string) => { if (number) window.location.href = `tel:${number.replace(/\s/g, '')}`; };
  const openHotel = () => {
    const query = [hotel, profile.hotelAddress].filter(Boolean).join(' ');
    if (query) window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
  };

  const field = (key: keyof Profile, label: string, placeholder = '') => (
    <label className="field"><span>{label}</span><input value={draft[key]} placeholder={placeholder} onChange={e => setDraft({ ...draft, [key]: e.target.value })} /></label>
  );

  const back = <button className="back" onClick={() => setPage('home')}><ArrowLeft size={22} /> {t.back}</button>;

  return <div className="shell" dir={rtl ? 'rtl' : 'ltr'}>
    <header className="topbar">
      <div className="brand"><div className="mark">T</div><div><strong>TEMAN Haramain</strong><span>by TGPU</span></div></div>
      <div className="langs" aria-label="Language selector">
        <button className={locale === 'ms' ? 'active' : ''} onClick={() => setLang('ms')}>BM</button>
        <button className={locale === 'ar' ? 'active' : ''} onClick={() => setLang('ar')}>العربية</button>
        <button className={locale === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
      </div>
    </header>

    {page === 'home' && <main className="page">
      <section className="hero"><span className="eyebrow">{t.subtitle}</span><h1>{t.hello}{profile.preferredName ? `, ${profile.preferredName}` : ''}</h1><h2>{t.need}</h2><p>{t.hint}</p></section>
      <div className={ready ? 'readiness ready' : 'readiness'}><ShieldCheck size={22}/><div><strong>{ready ? t.ready : t.notReady}</strong><span>{ready ? t.saved : t.setupHint}</span></div></div>
      <button className="action emergency" onClick={() => setPage('emergency')}><AlertTriangle size={32}/><div><strong>{t.help}</strong><span>{t.helpHint}</span></div><b>→</b></button>
      <div className="two">
        <button className="action" onClick={openHotel}><Building2 size={28}/><div><strong>{t.hotel}</strong><span>{hotel || t.hotelHint}</span></div><b>→</b></button>
        <button className="action" onClick={() => setPage('emergency')}><UsersRound size={28}/><div><strong>{t.group}</strong><span>{profile.groupCode || profile.busNumber || t.groupHint}</span></div><b>→</b></button>
      </div>
      <div className="grid">
        <button onClick={() => setPage('translate')}><Languages/><strong>{t.translate}</strong><span>{t.translateHint}</span></button>
        <button onClick={() => setPage('ibadah')}><UserRound/><strong>{t.ibadah}</strong><span>{t.ibadahHint}</span></button>
        <button onClick={() => { setDraft(profile); setPage('setup'); }}><ShieldCheck/><strong>{t.setup}</strong><span>{t.setupHint}</span></button>
      </div>
    </main>}

    {page === 'setup' && <main className="page">{back}<section className="sectionHead"><h1>{t.setupTitle}</h1><p>{t.setupIntro}</p></section>
      <div className="form">{field('pilgrimName', t.name)}{field('preferredName', t.preferred)}{field('hotelMakkah', t.makkah)}{field('hotelMadinah', t.madinah)}{field('hotelAddress', t.address)}{field('groupCode', t.groupCode)}{field('busNumber', t.bus)}{field('mutawwifName', t.mutawwif)}{field('mutawwifPhone', t.mutawwifPhone, '+966...')}{field('familyName', t.family)}{field('familyPhone', t.familyPhone, '+60...')}</div>
      <button className="primary" onClick={saveProfile}>{t.save} →</button>
    </main>}

    {page === 'emergency' && <main className="page">{back}<section className="sectionHead"><h1>{t.crisis}</h1><p>{t.helpHint}</p></section>
      <button className="action emergency"><MapPin size={32}/><div><strong>{t.lost}</strong><span>{t.lostHint}</span></div><b>→</b></button>
      <button className="action"><AlertTriangle size={30}/><div><strong>{t.unwell}</strong><span>{t.unwellHint}</span></div><b>→</b></button>
      <button className="action"><Bus size={30}/><div><strong>{t.busLost}</strong><span>{profile.busNumber || profile.groupCode || '—'}</span></div><b>→</b></button>
      <div className="contactRow"><button disabled={!profile.mutawwifPhone} onClick={() => phone(profile.mutawwifPhone)}><Phone/> {t.callGuide}</button><button disabled={!profile.familyPhone} onClick={() => phone(profile.familyPhone)}><Phone/> {t.callFamily}</button></div>
      <section className="helpCard">
        <span className="cardLabel">{t.showCard}</span><p className="arabic">{t.arabicHelp}</p><p>{t.englishHelp}</p>
        <div className="facts"><div><span>HOTEL / الفندق</span><strong>{hotel || '—'}</strong></div><div><span>GROUP / المجموعة</span><strong>{profile.groupCode || '—'} {profile.busNumber ? `• Bus ${profile.busNumber}` : ''}</strong></div><div><span>MUTAWWIF / مسؤول المجموعة</span><strong>{profile.mutawwifName || '—'} {profile.mutawwifPhone}</strong></div></div>
        <div className="contactRow"><button onClick={() => speak(t.arabicHelp)}><Volume2/> {t.speakArabic}</button><button onClick={openHotel}><MapPin/> {t.openMap}</button></div>
      </section>
    </main>}

    {page === 'translate' && <main className="page">{back}<section className="sectionHead"><h1>{t.translateTitle}</h1><p>{t.translateIntro}</p></section>
      <div className="phraseList"><span>{t.choosePhrase}</span>{PHRASES.map((p, i) => <button key={p.key} className={i === phraseIndex ? 'selected' : ''} onClick={() => setPhraseIndex(i)}>{t[p.key]}</button>)}</div>
      <section className="translationCard"><span>العربية</span><p className="arabic">{selectedPhrase.ar}</p><button className="primary" onClick={() => speak(selectedPhrase.ar)}><Volume2/> {t.speakArabic}</button><span>English</span><p>{selectedPhrase.en}</p></section>
    </main>}

    {page === 'ibadah' && <main className="page">{back}<section className="sectionHead"><h1>{t.guideTitle}</h1><p>{t.guideNote}</p></section>
      <div className="guide"><article><b>1</b><div><h3>Ihram</h3><p>Niat, pakaian ihram dan larangan ihram.</p></div></article><article><b>2</b><div><h3>Tawaf</h3><p>Tujuh pusingan dengan panduan ringkas dan jelas.</p></div></article><article><b>3</b><div><h3>Sa'i</h3><p>Safa ke Marwah sebanyak tujuh perjalanan.</p></div></article><article><b>4</b><div><h3>Tahallul</h3><p>Bercukur atau bergunting mengikut panduan yang sah.</p></div></article></div>
    </main>}
  </div>;
}
