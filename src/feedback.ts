const SUPABASE_URL = 'https://mpidjwjghtpeybedmbkd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_LUGX_-Co3zolt94Qaj9AQg_m2zidH68';
const APP_VERSION = 'teman-v10-feedback-mobile-2026-10-07';
const QUEUE_KEY = 'tgpu_feedback_queue_v1';

type Lang = 'ms' | 'en' | 'ar';
type FeedbackPayload = {
  client_submission_id: string;
  app_name: 'teman';
  category: string;
  message: string;
  name_optional: string | null;
  contact_optional: string | null;
  language: Lang;
  device_info: string;
  browser: string;
  os: string;
  page_url: string;
  route: string;
  app_version: string;
  location_context_optional: 'makkah' | 'madinah' | 'jeddah' | 'malaysia' | 'other' | null;
  rating_optional: number | null;
  context: Record<string, unknown>;
};

const COPY = {
  ms: {
    trigger: 'Maklum Balas', title: 'Kongsi Maklum Balas',
    intro: 'Bantu kami memperbaiki TEMAN. Maklumat hubungan adalah pilihan.',
    emergency: 'Ini bukan saluran kecemasan. Untuk bantuan segera, gunakan fungsi SOS / bantuan TEMAN.',
    category: 'Jenis maklum balas', message: 'Maklum balas', messagePh: 'Beritahu kami apa yang membantu, mengelirukan atau tidak berfungsi…',
    name: 'Nama (pilihan)', contact: 'E-mel / WhatsApp (pilihan)', contactHint: 'Isi hanya jika anda mahu kami menghubungi anda.',
    inSaudi: 'Saya sedang menggunakan TEMAN di Makkah/Madinah', place: 'Lokasi semasa', feature: 'Fungsi yang dicuba (pilihan)',
    submit: 'Hantar', sending: 'Menghantar…', close: 'Tutup',
    needMessage: 'Sila tulis maklum balas anda.',
    success: 'Terima kasih. Maklum balas anda telah diterima dan akan membantu kami memperbaiki TEMAN.',
    queued: 'Maklum balas disimpan pada peranti dan akan cuba dihantar apabila sambungan internet tersedia.',
    retry: 'Maklum balas belum dapat dihantar. Ia disimpan pada peranti dan akan dicuba semula.'
  },
  en: {
    trigger: 'Feedback', title: 'Share Feedback',
    intro: 'Help us improve TEMAN. Contact details are optional.',
    emergency: 'This is not an emergency channel. For urgent help, use TEMAN’s SOS / help features.',
    category: 'Feedback type', message: 'Feedback', messagePh: 'Tell us what helped, what was confusing, or what did not work…',
    name: 'Name (optional)', contact: 'Email / WhatsApp (optional)', contactHint: 'Only provide this if you would like us to contact you.',
    inSaudi: 'I am currently using TEMAN in Makkah/Madinah', place: 'Current location', feature: 'Feature tried (optional)',
    submit: 'Submit', sending: 'Sending…', close: 'Close',
    needMessage: 'Please enter your feedback.',
    success: 'Thank you. Your feedback has been received and will help us improve TEMAN.',
    queued: 'Feedback is saved on this device and will retry when internet is available.',
    retry: 'Feedback could not be sent yet. It is saved on this device and will retry.'
  },
  ar: {
    trigger: 'ملاحظات', title: 'شارك ملاحظاتك',
    intro: 'ساعدنا في تحسين TEMAN. معلومات التواصل اختيارية.',
    emergency: 'هذه ليست قناة للطوارئ. للمساعدة العاجلة استخدم وظائف SOS / المساعدة في TEMAN.',
    category: 'نوع الملاحظة', message: 'ملاحظاتك', messagePh: 'أخبرنا بما كان مفيدًا أو غير واضح أو لم يعمل…',
    name: 'الاسم (اختياري)', contact: 'البريد الإلكتروني / واتساب (اختياري)', contactHint: 'أدخلها فقط إذا رغبت أن نتواصل معك.',
    inSaudi: 'أستخدم TEMAN الآن في مكة/المدينة', place: 'الموقع الحالي', feature: 'الميزة التي استخدمتها (اختياري)',
    submit: 'إرسال', sending: 'جارٍ الإرسال…', close: 'إغلاق',
    needMessage: 'يرجى كتابة ملاحظاتك.',
    success: 'شكرًا لك. تم استلام ملاحظاتك وستساعدنا في تحسين TEMAN.',
    queued: 'تم حفظ الملاحظات على الجهاز وستُرسل عند توفر الإنترنت.',
    retry: 'تعذر إرسال الملاحظات الآن. تم حفظها على الجهاز وستتم إعادة المحاولة.'
  }
} as const;

function getLang(): Lang {
  const l = (document.documentElement.lang || 'ms').toLowerCase();
  return l.startsWith('ar') ? 'ar' : l.startsWith('en') ? 'en' : 'ms';
}

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function browserName() {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return 'Edge';
  if (/SamsungBrowser\//.test(ua)) return 'Samsung Internet';
  if (/Chrome\//.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return 'Safari';
  if (/Firefox\//.test(ua)) return 'Firefox';
  return 'Other';
}

function osName() {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS/iPadOS';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Macintosh/i.test(ua)) return 'macOS';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Other';
}

async function insertFeedback(payload: FeedbackPayload) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/feedback_submissions`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`feedback_http_${res.status}`);
}

function readQueue(): FeedbackPayload[] {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') as FeedbackPayload[]; } catch { return []; }
}
function writeQueue(items: FeedbackPayload[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items.slice(-20)));
}
function queueFeedback(payload: FeedbackPayload) {
  const q = readQueue();
  if (!q.some(x => x.client_submission_id === payload.client_submission_id)) q.push(payload);
  writeQueue(q);
}
async function flushQueue() {
  if (!navigator.onLine) return;
  const q = readQueue();
  if (!q.length) return;
  const remaining: FeedbackPayload[] = [];
  for (const item of q) {
    try { await insertFeedback(item); } catch { remaining.push(item); }
  }
  writeQueue(remaining);
}

function categoryOptions(lang: Lang) {
  const labels: Record<Lang, Record<string,string>> = {
    ms: {
      general_feedback:'Maklum balas umum', technical_problem:'Masalah teknikal', suggestion:'Cadangan',
      language_translation:'Bahasa / terjemahan', location_navigation:'Lokasi / navigasi', sos_help_feature:'Fungsi SOS / bantuan',
      audio_phrase:'Audio / frasa', senior_usability:'Kesukaran warga emas', hotel_group_bus_info:'Maklumat hotel / kumpulan / bas', other:'Lain-lain'
    },
    en: {
      general_feedback:'General feedback', technical_problem:'Technical problem', suggestion:'Suggestion',
      language_translation:'Language / translation', location_navigation:'Location / navigation', sos_help_feature:'SOS / help feature',
      audio_phrase:'Audio / phrase', senior_usability:'Senior usability', hotel_group_bus_info:'Hotel / group / bus information', other:'Other'
    },
    ar: {
      general_feedback:'ملاحظات عامة', technical_problem:'مشكلة تقنية', suggestion:'اقتراح',
      language_translation:'اللغة / الترجمة', location_navigation:'الموقع / الملاحة', sos_help_feature:'ميزة SOS / المساعدة',
      audio_phrase:'الصوت / العبارات', senior_usability:'سهولة الاستخدام لكبار السن', hotel_group_bus_info:'الفندق / المجموعة / الحافلة', other:'أخرى'
    }
  };
  return Object.entries(labels[lang]).map(([v,t]) => `<option value="${v}">${t}</option>`).join('');
}

function placeOptions(lang: Lang) {
  const l = {
    ms: [['makkah','Makkah'],['madinah','Madinah'],['jeddah','Jeddah'],['other','Lain-lain']],
    en: [['makkah','Makkah'],['madinah','Madinah'],['jeddah','Jeddah'],['other','Other']],
    ar: [['makkah','مكة'],['madinah','المدينة'],['jeddah','جدة'],['other','أخرى']]
  }[lang];
  return l.map(([v,t]) => `<option value="${v}">${t}</option>`).join('');
}

function openFeedback() {
  if (document.querySelector('[data-teman-feedback-modal]')) return;
  const lang = getLang();
  const t = COPY[lang];
  const overlay = document.createElement('div');
  overlay.className = 'temanFeedbackOverlay';
  overlay.dataset.temanFeedbackModal = 'true';
  overlay.dir = lang === 'ar' ? 'rtl' : 'ltr';
  overlay.innerHTML = `<div class="temanFeedbackModal" role="dialog" aria-modal="true" aria-labelledby="teman-feedback-title">
    <button type="button" class="temanFeedbackClose" data-teman-feedback-close aria-label="${t.close}">×</button>
    <h2 id="teman-feedback-title">${t.title}</h2>
    <p class="temanFeedbackIntro">${t.intro}</p>
    <p class="temanFeedbackEmergency">${t.emergency}</p>
    <form data-teman-feedback-form novalidate>
      <label>${t.category}<select name="category" required>${categoryOptions(lang)}</select></label>
      <label class="temanFeedbackCheck"><input type="checkbox" name="in_saudi"> <span>${t.inSaudi}</span></label>
      <div data-teman-location hidden>
        <label>${t.place}<select name="location_context_optional">${placeOptions(lang)}</select></label>
      </div>
      <label>${t.feature}<input name="feature_tried" maxlength="120"></label>
      <label>${t.message}<textarea name="message" minlength="3" maxlength="3000" required placeholder="${t.messagePh}"></textarea></label>
      <label>${t.name}<input name="name_optional" maxlength="120" autocomplete="name"></label>
      <label>${t.contact}<input name="contact_optional" maxlength="240"><small>${t.contactHint}</small></label>
      <input class="temanFeedbackHp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="temanFeedbackStatus" data-teman-feedback-status role="status" aria-live="polite"></div>
      <button type="submit" class="temanFeedbackSubmit">${t.submit}</button>
    </form>
  </div>`;
  document.body.appendChild(overlay);
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  const closeFeedback = () => {
    overlay.remove();
    document.body.style.overflow = previousOverflow;
  };

  const form = overlay.querySelector<HTMLFormElement>('[data-teman-feedback-form]')!;
  const inSaudi = form.elements.namedItem('in_saudi') as HTMLInputElement;
  const locationBox = overlay.querySelector<HTMLElement>('[data-teman-location]')!;
  const syncLocation = () => { locationBox.hidden = !inSaudi.checked; };
  inSaudi.addEventListener('change', syncLocation); syncLocation();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const status = overlay.querySelector<HTMLElement>('[data-teman-feedback-status]')!;
    const submit = overlay.querySelector<HTMLButtonElement>('.temanFeedbackSubmit')!;
    if (fd.get('website')) { status.textContent = 'Thank you.'; form.reset(); return; }
    const message = String(fd.get('message') || '').trim();
    if (message.length < 3) { status.textContent = t.needMessage; return; }

    const locationContext = inSaudi.checked ? String(fd.get('location_context_optional') || 'other') : null;
    const payload: FeedbackPayload = {
      client_submission_id: uuid(),
      app_name: 'teman',
      category: String(fd.get('category') || 'other'),
      message,
      name_optional: String(fd.get('name_optional') || '').trim() || null,
      contact_optional: String(fd.get('contact_optional') || '').trim() || null,
      language: lang,
      device_info: navigator.userAgent.slice(0, 500),
      browser: browserName(),
      os: osName(),
      page_url: `${location.origin}${location.pathname}`,
      route: location.pathname,
      app_version: APP_VERSION,
      location_context_optional: locationContext as FeedbackPayload['location_context_optional'],
      rating_optional: null,
      context: {
        current_pilgrim: inSaudi.checked,
        feature_tried: String(fd.get('feature_tried') || '').trim() || null,
        display_mode: matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'
      }
    };

    submit.disabled = true;
    status.textContent = t.sending;
    if (!navigator.onLine) {
      queueFeedback(payload);
      status.textContent = t.queued;
      submit.disabled = false;
      form.reset(); syncLocation(); return;
    }
    try {
      await insertFeedback(payload);
      status.textContent = t.success;
      form.reset(); syncLocation();
    } catch {
      queueFeedback(payload);
      status.textContent = t.retry;
    } finally {
      submit.disabled = false;
    }
  });
}

function refreshTrigger(trigger: HTMLButtonElement) {
  trigger.textContent = `✦ ${COPY[getLang()].trigger}`;
  trigger.setAttribute('aria-label', COPY[getLang()].title);
}

export function initTemanFeedback() {
  if (document.querySelector('.temanFeedbackTrigger')) return;
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'temanFeedbackTrigger';
  trigger.addEventListener('click', openFeedback);
  document.body.appendChild(trigger);
  refreshTrigger(trigger);

  const observer = new MutationObserver(() => refreshTrigger(trigger));
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang','dir'] });

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-teman-feedback-close]') || target.matches('[data-teman-feedback-modal]')) {
      document.querySelector<HTMLElement>('[data-teman-feedback-modal]')?.remove();
      document.body.style.overflow = '';
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelector<HTMLElement>('[data-teman-feedback-modal]')?.remove();
      document.body.style.overflow = '';
    }
  });

  window.addEventListener('online', flushQueue);
  void flushQueue();
}
