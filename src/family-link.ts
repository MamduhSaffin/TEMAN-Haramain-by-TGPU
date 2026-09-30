import { onTemanUiRefresh } from './ui-refresh';

type Locale = 'ms' | 'en' | 'ar';
type CheckInStatus = 'safe' | 'with-group' | 'at-hotel' | 'need-contact';
type Profile = {
  pilgrimName?: string;
  preferredName?: string;
  hotelMakkah?: string;
  hotelMadinah?: string;
  groupCode?: string;
  busNumber?: string;
  familyName?: string;
  familyPhone?: string;
};
type FamilyCheckIn = {
  id: string;
  status: CheckInStatus;
  label: string;
  createdAt: number;
  pilgrimName: string;
  hotelName?: string;
  groupCode?: string;
  busNumber?: string;
  synced?: boolean;
};
type CloudLink = {
  familyId: string;
  writeToken: string;
  viewerToken: string;
  viewerUrl: string;
  createdAt: number;
  lastSyncedAt?: number;
};

const CHECKINS_KEY = 'teman.family.checkins.v1';
const CLOUD_KEY = 'teman.family.cloud.v1';

const COPY = {
  ms: {
    short: 'Family Link', title: 'TEMAN Family Link', intro: 'Beritahu keluarga dengan satu tekan. Anda sendiri memilih status yang hendak dikongsi.',
    close: 'Tutup', online: 'Online', offline: 'Offline', privacy: 'Privasi dahulu', privacyText: 'Live tracking GPS kekal OFF. Family View hanya menerima status yang anda sendiri hantar, bersama masa, hotel, kumpulan dan nombor bas.',
    cloudInactive: 'Family cloud belum aktif', cloudInactiveText: 'Check-in masih boleh disimpan dan dikongsi secara manual. Aktifkan cloud untuk menghasilkan pautan Family View peribadi.',
    activate: 'AKTIFKAN FAMILY LINK CLOUD', activating: 'MENGAKTIFKAN…', cloudActive: 'Family cloud aktif', shareLink: 'KONGSI PAUTAN FAMILY VIEW', sync: 'SYNC SEKARANG', revoke: 'MATIKAN PAUTAN KELUARGA', revoking: 'MEMPROSES…',
    safe: 'SAYA SELAMAT', safeHint: 'Hantar check-in keselamatan sekarang', withGroup: 'SAYA BERSAMA KUMPULAN', withGroupHint: 'Maklumkan bahawa anda bersama kumpulan', atHotel: 'SAYA SUDAH DI HOTEL', atHotelHint: 'Maklumkan bahawa anda telah kembali ke hotel', needContact: 'TOLONG HUBUNGI SAYA', needContactHint: 'Minta keluarga menghubungi anda',
    last: 'Status terakhir', none: 'Belum ada check-in', pilgrim: 'JEMAAH', status: 'STATUS', time: 'MASA', hotel: 'HOTEL', groupBus: 'KUMPULAN / BAS', pending: 'menunggu sync', shareStatus: 'KONGSI STATUS MANUAL', callFamily: 'TELEFON KELUARGA',
    savedOffline: 'Check-in disimpan offline. Ia akan dihantar apabila internet kembali.', savedLocal: 'Check-in disimpan pada telefon.', sent: 'Check-in berjaya dihantar ke Family View.', activationFailed: 'Tidak dapat mengaktifkan Family Link sekarang.', configRequired: 'Family cloud belum dikonfigurasi pada Azure.', linkCopied: 'Pautan Family View disalin.', statusCopied: 'Status disalin.', shareCancelled: 'Perkongsian dibatalkan.', needCloud: 'Aktifkan Family Link cloud dahulu.', needCheckin: 'Buat satu check-in dahulu.', noPhone: 'Nombor keluarga belum disimpan dalam profil TEMAN.', revoked: 'Pautan Family View lama telah dimatikan.', revokeFailed: 'Tidak dapat mematikan pautan keluarga sekarang.', connectFirst: 'Sambungkan internet untuk menggunakan Family Link cloud.',
  },
  en: {
    short: 'Family Link', title: 'TEMAN Family Link', intro: 'Tell your family with one tap. You choose exactly which status to share.',
    close: 'Close', online: 'Online', offline: 'Offline', privacy: 'Privacy first', privacyText: 'Live GPS tracking stays OFF. Family View only receives a status you send yourself, plus the time, hotel, group and bus number.',
    cloudInactive: 'Family cloud is not active', cloudInactiveText: 'Check-ins can still be saved and shared manually. Activate cloud to create a private Family View link.',
    activate: 'ACTIVATE FAMILY LINK CLOUD', activating: 'ACTIVATING…', cloudActive: 'Family cloud active', shareLink: 'SHARE FAMILY VIEW LINK', sync: 'SYNC NOW', revoke: 'DISABLE FAMILY LINK', revoking: 'PROCESSING…',
    safe: 'I AM SAFE', safeHint: 'Send a safety check-in now', withGroup: 'I AM WITH MY GROUP', withGroupHint: 'Tell family you are with your group', atHotel: 'I AM BACK AT THE HOTEL', atHotelHint: 'Tell family you have returned to the hotel', needContact: 'PLEASE CONTACT ME', needContactHint: 'Ask family to contact you',
    last: 'Latest status', none: 'No check-in yet', pilgrim: 'PILGRIM', status: 'STATUS', time: 'TIME', hotel: 'HOTEL', groupBus: 'GROUP / BUS', pending: 'waiting to sync', shareStatus: 'SHARE STATUS MANUALLY', callFamily: 'CALL FAMILY',
    savedOffline: 'Check-in saved offline. It will be sent when internet returns.', savedLocal: 'Check-in saved on this phone.', sent: 'Check-in sent to Family View.', activationFailed: 'Family Link could not be activated right now.', configRequired: 'Family cloud is not configured on Azure yet.', linkCopied: 'Family View link copied.', statusCopied: 'Status copied.', shareCancelled: 'Sharing was cancelled.', needCloud: 'Activate Family Link cloud first.', needCheckin: 'Create a check-in first.', noPhone: 'No family phone number is saved in the TEMAN profile.', revoked: 'The old Family View link has been disabled.', revokeFailed: 'Family Link could not be disabled right now.', connectFirst: 'Connect to the internet to use Family Link cloud.',
  },
  ar: {
    short: 'رابط الأسرة', title: 'TEMAN رابط الأسرة', intro: 'طمئن أسرتك بضغطة واحدة. أنت تختار بنفسك الحالة التي تريد مشاركتها.',
    close: 'إغلاق', online: 'متصل', offline: 'غير متصل', privacy: 'الخصوصية أولاً', privacyText: 'تتبع GPS المباشر متوقف. تعرض صفحة الأسرة فقط الحالة التي ترسلها بنفسك مع الوقت والفندق والمجموعة ورقم الحافلة.',
    cloudInactive: 'خدمة الأسرة السحابية غير مفعلة', cloudInactiveText: 'يمكن حفظ الحالة ومشاركتها يدويًا. فعّل الخدمة لإنشاء رابط خاص للأسرة.',
    activate: 'تفعيل رابط الأسرة', activating: 'جارٍ التفعيل…', cloudActive: 'رابط الأسرة مفعل', shareLink: 'مشاركة رابط الأسرة', sync: 'مزامنة الآن', revoke: 'إيقاف رابط الأسرة', revoking: 'جارٍ التنفيذ…',
    safe: 'أنا بخير', safeHint: 'أرسل حالة اطمئنان الآن', withGroup: 'أنا مع مجموعتي', withGroupHint: 'أخبر الأسرة أنك مع المجموعة', atHotel: 'وصلت إلى الفندق', atHotelHint: 'أخبر الأسرة أنك عدت إلى الفندق', needContact: 'يرجى الاتصال بي', needContactHint: 'اطلب من الأسرة الاتصال بك',
    last: 'آخر حالة', none: 'لا توجد حالة بعد', pilgrim: 'الحاج / المعتمر', status: 'الحالة', time: 'الوقت', hotel: 'الفندق', groupBus: 'المجموعة / الحافلة', pending: 'بانتظار المزامنة', shareStatus: 'مشاركة الحالة يدويًا', callFamily: 'الاتصال بالأسرة',
    savedOffline: 'تم حفظ الحالة دون إنترنت وسترسل عند عودة الاتصال.', savedLocal: 'تم حفظ الحالة على الهاتف.', sent: 'تم إرسال الحالة إلى صفحة الأسرة.', activationFailed: 'تعذر تفعيل رابط الأسرة الآن.', configRequired: 'خدمة الأسرة السحابية لم تُضبط على Azure بعد.', linkCopied: 'تم نسخ رابط الأسرة.', statusCopied: 'تم نسخ الحالة.', shareCancelled: 'تم إلغاء المشاركة.', needCloud: 'فعّل رابط الأسرة السحابي أولاً.', needCheckin: 'أرسل حالة أولاً.', noPhone: 'رقم الأسرة غير محفوظ في ملف TEMAN.', revoked: 'تم إيقاف رابط الأسرة القديم.', revokeFailed: 'تعذر إيقاف رابط الأسرة الآن.', connectFirst: 'اتصل بالإنترنت لاستخدام رابط الأسرة السحابي.',
  },
} as const;

function locale(): Locale {
  const lang = document.documentElement.lang.toLowerCase();
  if (lang.startsWith('ar')) return 'ar';
  if (lang.startsWith('en')) return 'en';
  return 'ms';
}

function readJson<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || '') as T; } catch { return fallback; }
}
function writeJson(key: string, value: unknown) { localStorage.setItem(key, JSON.stringify(value)); }
function profile(): Profile { return readJson<Profile>('teman-profile', {}); }
function currentCity() { return localStorage.getItem('teman-city') === 'madinah' ? 'madinah' : 'makkah'; }
function escapeHtml(value: string) { return value.replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c] || c)); }
function formatTime(value?: number) {
  if (!value) return '—';
  const lang = locale() === 'ar' ? 'ar-SA' : locale() === 'en' ? 'en-GB' : 'ms-MY';
  return new Date(value).toLocaleString(lang, { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return; }
  const area = document.createElement('textarea');
  area.value = text; area.style.position = 'fixed'; area.style.opacity = '0'; document.body.appendChild(area); area.select(); document.execCommand('copy'); area.remove();
}

export function initFamilyLink() {
  if (document.querySelector('.temanFamilyTrigger')) return;

  const trigger = document.createElement('button');
  trigger.type = 'button'; trigger.className = 'temanFamilyTrigger'; trigger.hidden = true; document.body.appendChild(trigger);

  const overlay = document.createElement('section');
  overlay.className = 'temanFamilyOverlay'; overlay.hidden = true; overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); document.body.appendChild(overlay);

  let checkIns = readJson<FamilyCheckIn[]>(CHECKINS_KEY, []);
  let cloud = readJson<CloudLink | null>(CLOUD_KEY, null);
  let message = '';
  let busy = false;

  const saveCheckIns = () => { writeJson(CHECKINS_KEY, checkIns.slice(0, 20)); };
  const saveCloud = () => { if (cloud) writeJson(CLOUD_KEY, cloud); else localStorage.removeItem(CLOUD_KEY); };
  const pendingCount = () => checkIns.filter(item => !item.synced).length;

  const t = () => COPY[locale()];
  const hotelName = (p = profile()) => currentCity() === 'madinah' ? p.hotelMadinah || '' : p.hotelMakkah || '';

  async function sendToCloud(item: FamilyCheckIn): Promise<boolean> {
    if (!cloud || !navigator.onLine) return false;
    try {
      const response = await fetch('/api/family/checkin', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ familyId:cloud.familyId, writeToken:cloud.writeToken, checkIn:item }) });
      return response.ok;
    } catch { return false; }
  }

  async function flushPending() {
    if (!cloud || !navigator.onLine) return;
    let changed = false;
    for (const item of checkIns.filter(x => !x.synced).reverse()) {
      if (!(await sendToCloud(item))) break;
      const found = checkIns.find(x => x.id === item.id);
      if (found) found.synced = true;
      changed = true;
    }
    if (changed) {
      cloud.lastSyncedAt = Date.now(); saveCloud(); saveCheckIns();
      if (!overlay.hidden) renderOverlay();
    }
  }

  async function saveCheckIn(status: CheckInStatus) {
    const p = profile();
    const labels: Record<CheckInStatus, string> = { safe:t().safe, 'with-group':t().withGroup, 'at-hotel':t().atHotel, 'need-contact':t().needContact };
    const item: FamilyCheckIn = {
      id:`checkin-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      status, label:labels[status], createdAt:Date.now(), pilgrimName:p.pilgrimName || p.preferredName || 'TEMAN Pilgrim',
      hotelName:hotelName(p), groupCode:p.groupCode, busNumber:p.busNumber, synced:false,
    };
    checkIns = [item, ...checkIns].slice(0,20); saveCheckIns();
    if (cloud && navigator.onLine && await sendToCloud(item)) {
      item.synced = true; cloud.lastSyncedAt = Date.now(); saveCloud(); saveCheckIns(); message = t().sent;
    } else message = navigator.onLine ? t().savedLocal : t().savedOffline;
    renderOverlay(); renderTrigger();
  }

  async function activateCloud() {
    if (!navigator.onLine) { message = t().connectFirst; renderOverlay(); return; }
    busy = true; renderOverlay();
    try {
      const response = await fetch('/api/family/pair', { method:'POST' });
      const body = await response.json().catch(() => ({})) as { familyId?:string; writeToken?:string; viewerToken?:string; configurationRequired?:boolean; message?:string };
      if (!response.ok || !body.familyId || !body.writeToken || !body.viewerToken) {
        message = body.configurationRequired ? t().configRequired : (body.message || t().activationFailed); return;
      }
      const lang = locale();
      cloud = {
        familyId:body.familyId, writeToken:body.writeToken, viewerToken:body.viewerToken,
        viewerUrl:`${window.location.origin}/?family=${encodeURIComponent(body.familyId)}&token=${encodeURIComponent(body.viewerToken)}&lang=${lang}`,
        createdAt:Date.now(),
      };
      saveCloud(); message = t().cloudActive; await flushPending();
    } catch { message = t().activationFailed; }
    finally { busy = false; renderOverlay(); renderTrigger(); }
  }

  async function revokeCloud() {
    if (!cloud) return;
    if (!navigator.onLine) { message = t().connectFirst; renderOverlay(); return; }
    if (!window.confirm(t().revoke)) return;
    busy = true; renderOverlay();
    try {
      const response = await fetch('/api/family/link', { method:'DELETE', headers:{'content-type':'application/json'}, body:JSON.stringify({ familyId:cloud.familyId, writeToken:cloud.writeToken }) });
      if (response.ok || response.status === 404) { cloud = null; saveCloud(); message = t().revoked; }
      else message = t().revokeFailed;
    } catch { message = t().revokeFailed; }
    finally { busy = false; renderOverlay(); renderTrigger(); }
  }

  async function shareFamilyLink() {
    if (!cloud) { message = t().needCloud; renderOverlay(); return; }
    try {
      if (navigator.share) await navigator.share({ title:'TEMAN Family View', text:'TEMAN Family View', url:cloud.viewerUrl });
      else { await copyText(cloud.viewerUrl); message = t().linkCopied; renderOverlay(); }
    } catch { message = t().shareCancelled; renderOverlay(); }
  }

  async function shareLatest() {
    const latest = checkIns[0];
    if (!latest) { message = t().needCheckin; renderOverlay(); return; }
    const text = [`TEMAN Family Link — ${latest.pilgrimName}`, `${t().status}: ${latest.label}`, `${t().time}: ${formatTime(latest.createdAt)}`, latest.hotelName ? `${t().hotel}: ${latest.hotelName}` : '', latest.groupCode || latest.busNumber ? `${t().groupBus}: ${latest.groupCode || '—'} • ${latest.busNumber || '—'}` : ''].filter(Boolean).join('\n');
    try {
      if (navigator.share) await navigator.share({ title:'TEMAN Family Link', text });
      else { await copyText(text); message = t().statusCopied; renderOverlay(); }
    } catch { message = t().shareCancelled; renderOverlay(); }
  }

  function callFamily() {
    const phone = profile().familyPhone?.replace(/[^\d+]/g,'');
    if (!phone) { message = t().noPhone; renderOverlay(); return; }
    window.location.href = `tel:${phone}`;
  }

  function closeOverlay() { overlay.hidden = true; document.body.classList.remove('teman-family-open'); trigger.focus(); }

  function renderTrigger() {
    const onHome = Boolean(document.querySelector('.hero'));
    trigger.hidden = !onHome;
    if (!onHome) return;
    trigger.textContent = `👪 ${t().short}${pendingCount() ? ` • ${pendingCount()}` : ''}`;
  }

  function renderOverlay() {
    const c = t(); const latest = checkIns[0]; const p = profile(); const pending = pendingCount();
    overlay.innerHTML = `<div class="temanFamilyPanel">
      <header><div><span class="familyEyebrow">TEMAN Haramain</span><h2>${c.title}</h2><p>${c.intro}</p></div><button type="button" data-close aria-label="${c.close}">×</button></header>
      <div class="temanFamilyBody">
        <div class="familyConnectivity ${navigator.onLine ? 'online' : 'offline'}">${navigator.onLine ? '● '+c.online : '● '+c.offline}</div>
        ${message ? `<div class="familyMessage">${escapeHtml(message)}</div>` : ''}
        ${cloud ? `<section class="familyCloud active"><strong>${c.cloudActive}</strong><span>${pending} ${c.pending}</span><small>${cloud.lastSyncedAt ? formatTime(cloud.lastSyncedAt) : '—'}</small><button type="button" data-share-link>${c.shareLink}</button><button type="button" class="secondary" data-sync>${c.sync}</button><button type="button" class="danger" data-revoke>${busy ? c.revoking : c.revoke}</button></section>` : `<section class="familyCloud"><strong>${c.cloudInactive}</strong><p>${c.cloudInactiveText}</p><button type="button" data-activate ${busy ? 'disabled' : ''}>${busy ? c.activating : c.activate}</button></section>`}
        <div class="familyActionGrid">
          <button type="button" class="safe" data-checkin="safe"><b>✓ ${c.safe}</b><span>${c.safeHint}</span></button>
          <button type="button" data-checkin="with-group"><b>👥 ${c.withGroup}</b><span>${c.withGroupHint}</span></button>
          <button type="button" data-checkin="at-hotel"><b>🏨 ${c.atHotel}</b><span>${c.atHotelHint}</span></button>
          <button type="button" class="contact" data-checkin="need-contact"><b>☎ ${c.needContact}</b><span>${c.needContactHint}</span></button>
        </div>
        <h3>${c.last}</h3>
        <section class="familyStatusCard">
          <div><span>${c.pilgrim}</span><strong>${escapeHtml(latest?.pilgrimName || p.pilgrimName || c.none)}</strong></div>
          <div><span>${c.status}</span><strong>${escapeHtml(latest?.label || c.none)}</strong></div>
          <div><span>${c.time}</span><strong>${latest ? formatTime(latest.createdAt) : '—'}</strong></div>
          <div><span>${c.hotel}</span><strong>${escapeHtml(latest?.hotelName || hotelName(p) || '—')}</strong></div>
          <div><span>${c.groupBus}</span><strong>${escapeHtml(`${latest?.groupCode || p.groupCode || '—'} • ${latest?.busNumber || p.busNumber || '—'}`)}</strong></div>
        </section>
        <div class="familySecondaryActions"><button type="button" data-share-status>${c.shareStatus}</button><button type="button" data-call>${c.callFamily}</button></div>
        <section class="familyPrivacy"><strong>🔒 ${c.privacy}</strong><p>${c.privacyText}</p></section>
      </div>
    </div>`;

    overlay.querySelector<HTMLButtonElement>('[data-close]')?.addEventListener('click', closeOverlay);
    overlay.querySelector<HTMLButtonElement>('[data-activate]')?.addEventListener('click', () => void activateCloud());
    overlay.querySelector<HTMLButtonElement>('[data-share-link]')?.addEventListener('click', () => void shareFamilyLink());
    overlay.querySelector<HTMLButtonElement>('[data-sync]')?.addEventListener('click', () => void flushPending());
    overlay.querySelector<HTMLButtonElement>('[data-revoke]')?.addEventListener('click', () => void revokeCloud());
    overlay.querySelector<HTMLButtonElement>('[data-share-status]')?.addEventListener('click', () => void shareLatest());
    overlay.querySelector<HTMLButtonElement>('[data-call]')?.addEventListener('click', callFamily);
    overlay.querySelectorAll<HTMLButtonElement>('[data-checkin]').forEach(button => button.addEventListener('click', () => void saveCheckIn(button.dataset.checkin as CheckInStatus)));
  }

  trigger.addEventListener('click', () => { message = ''; renderOverlay(); overlay.hidden = false; document.body.classList.add('teman-family-open'); overlay.querySelector<HTMLButtonElement>('[data-close]')?.focus(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !overlay.hidden) closeOverlay(); });
  window.addEventListener('online', () => { renderTrigger(); if (!overlay.hidden) renderOverlay(); void flushPending(); });
  window.addEventListener('offline', () => { renderTrigger(); if (!overlay.hidden) renderOverlay(); });
  window.addEventListener('storage', event => { if ([CHECKINS_KEY, CLOUD_KEY, 'teman-profile', 'teman-city'].includes(event.key || '')) { checkIns = readJson<FamilyCheckIn[]>(CHECKINS_KEY, []); cloud = readJson<CloudLink | null>(CLOUD_KEY, null); renderTrigger(); if (!overlay.hidden) renderOverlay(); } });
  onTemanUiRefresh(() => { renderTrigger(); });

  renderTrigger();
  if (navigator.onLine) void flushPending();
}
