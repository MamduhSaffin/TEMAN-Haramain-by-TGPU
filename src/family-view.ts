type Locale = 'ms' | 'en' | 'ar';
type FamilyStatus = {
  id: string;
  status: string;
  label: string;
  createdAt: number;
  pilgrimName: string;
  hotelName?: string;
  groupCode?: string;
  busNumber?: string;
};

const COPY = {
  ms: { title:'TEMAN Family View', eyebrow:'Untuk keluarga', heading:'Status jemaah.', intro:'Halaman ini hanya menunjukkan check-in yang jemaah pilih sendiri. Live tracking tidak digunakan.', loading:'Memuat status keluarga…', missing:'Pautan Family Link tidak lengkap. Minta jemaah kongsi pautan baharu.', offline:'Peranti keluarga sedang offline. Status terakhir tidak dapat dikemas kini sehingga internet kembali.', inactive:'Pautan Family View ini tidak lagi aktif. Minta jemaah kongsi pautan baharu.', config:'Family cloud belum dikonfigurasi pada Azure.', failed:'Tidak dapat mendapatkan status Family Link.', updated:'Status dikemas kini daripada TEMAN.', none:'Belum ada check-in daripada jemaah.', staleTitle:'Status terakhir melebihi 2 jam', staleText:'Ini ialah check-in terakhir, bukan lokasi semasa. Jika perlu, hubungi jemaah atau mutawwif secara langsung.', pilgrim:'JEMAAH', status:'STATUS', time:'MASA', hotel:'HOTEL', groupBus:'KUMPULAN / BAS', refresh:'KEMAS KINI STATUS', refreshing:'MENGEMAS KINI…', privacy:'Privasi', privacyText:'TEMAN hanya memaparkan check-in yang dihantar oleh jemaah. Tiada lokasi GPS berterusan dipaparkan pada halaman ini.', online:'Online', offlineShort:'Offline' },
  en: { title:'TEMAN Family View', eyebrow:'For family', heading:'Pilgrim status.', intro:'This page only shows check-ins the pilgrim chose to send. Live tracking is not used.', loading:'Loading family status…', missing:'This Family Link is incomplete. Ask the pilgrim to share a new link.', offline:'This device is offline. The latest status cannot be refreshed until internet returns.', inactive:'This Family View link is no longer active. Ask the pilgrim to share a new link.', config:'Family cloud is not configured on Azure yet.', failed:'Family Link status could not be loaded.', updated:'Status updated from TEMAN.', none:'No check-in from the pilgrim yet.', staleTitle:'Latest status is more than 2 hours old', staleText:'This is the latest check-in, not the current location. Contact the pilgrim or mutawwif directly if needed.', pilgrim:'PILGRIM', status:'STATUS', time:'TIME', hotel:'HOTEL', groupBus:'GROUP / BUS', refresh:'REFRESH STATUS', refreshing:'REFRESHING…', privacy:'Privacy', privacyText:'TEMAN only shows check-ins sent by the pilgrim. Continuous GPS location is not displayed here.', online:'Online', offlineShort:'Offline' },
  ar: { title:'TEMAN عرض الأسرة', eyebrow:'للأسرة', heading:'حالة الحاج / المعتمر.', intro:'تعرض هذه الصفحة فقط حالات الاطمئنان التي اختار الحاج أو المعتمر إرسالها. لا يوجد تتبع مباشر.', loading:'جارٍ تحميل حالة الأسرة…', missing:'رابط الأسرة غير مكتمل. اطلب رابطًا جديدًا من الحاج أو المعتمر.', offline:'هذا الجهاز غير متصل. لا يمكن تحديث الحالة حتى عودة الإنترنت.', inactive:'رابط الأسرة هذا لم يعد فعالاً. اطلب رابطًا جديدًا.', config:'خدمة الأسرة السحابية لم تُضبط على Azure بعد.', failed:'تعذر تحميل حالة رابط الأسرة.', updated:'تم تحديث الحالة من TEMAN.', none:'لا توجد حالة مرسلة بعد.', staleTitle:'آخر حالة أقدم من ساعتين', staleText:'هذه آخر حالة مرسلة وليست الموقع الحالي. تواصل مع الحاج أو المعتمر أو المطوف عند الحاجة.', pilgrim:'الحاج / المعتمر', status:'الحالة', time:'الوقت', hotel:'الفندق', groupBus:'المجموعة / الحافلة', refresh:'تحديث الحالة', refreshing:'جارٍ التحديث…', privacy:'الخصوصية', privacyText:'يعرض TEMAN فقط الحالات التي يرسلها الحاج أو المعتمر. لا يتم عرض موقع GPS بشكل مستمر.', online:'متصل', offlineShort:'غير متصل' },
} as const;

function localeFromParams(params: URLSearchParams): Locale {
  const explicit = params.get('lang');
  if (explicit === 'ar' || explicit === 'en' || explicit === 'ms') return explicit;
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith('ar')) return 'ar';
  if (lang.startsWith('ms')) return 'ms';
  return 'en';
}
function escapeHtml(value: string) { return value.replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c] || c)); }
function formatTime(value: number, lang: Locale) { return new Date(value).toLocaleString(lang === 'ar' ? 'ar-SA' : lang === 'en' ? 'en-GB' : 'ms-MY', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }); }

function fragmentParams() {
  return new URLSearchParams(window.location.hash.replace(/^#/, ''));
}

export function isFamilyViewRoute() {
  const params = new URLSearchParams(window.location.search);
  const fragment = fragmentParams();
  return Boolean(params.get('family') || params.get('token') || fragment.get('token'));
}

export function renderFamilyView(root: HTMLElement) {
  const params = new URLSearchParams(window.location.search);
  const fragment = fragmentParams();
  const familyId = params.get('family') || '';
  const token = fragment.get('token') || params.get('token') || '';
  const lang = localeFromParams(params);

  // Backward compatibility: immediately move legacy query tokens into the
  // URL fragment so subsequent same-origin requests and referrers do not carry them.
  if (params.get('token') && token) {
    const clean = new URL(window.location.href);
    clean.searchParams.delete('token');
    clean.hash = `token=${encodeURIComponent(token)}`;
    window.history.replaceState(null, '', clean.toString());
  }
  const t = COPY[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  let latest: FamilyStatus | null = null;
  let message: string = t.loading;
  let refreshing = false;
  let inactive = false;

  function paint() {
    const stale = Boolean(latest?.createdAt && Date.now() - latest.createdAt > 2 * 60 * 60 * 1000);
    root.innerHTML = `<main class="temanFamilyView">
      <header class="familyViewHeader"><div><strong>${t.title}</strong><span> by <b>TGPU</b></span></div><div class="familyViewConnectivity ${navigator.onLine ? 'online' : 'offline'}">● ${navigator.onLine ? t.online : t.offlineShort}</div></header>
      <section class="familyViewContent">
        <div class="familyViewHero"><span>${t.eyebrow}</span><h1>${t.heading}</h1><p>${t.intro}</p></div>
        <div class="familyViewMessage">${escapeHtml(message)}</div>
        ${inactive ? `<div class="familyViewWarning"><strong>${escapeHtml(t.inactive)}</strong></div>` : ''}
        ${stale && !inactive ? `<div class="familyViewWarning"><strong>${t.staleTitle}</strong><p>${t.staleText}</p></div>` : ''}
        <section class="familyViewCard">
          <div><span>${t.pilgrim}</span><strong>${escapeHtml(latest?.pilgrimName || '—')}</strong></div>
          <div><span>${t.status}</span><strong>${escapeHtml(latest?.label || t.none)}</strong></div>
          <div><span>${t.time}</span><strong>${latest?.createdAt ? formatTime(latest.createdAt, lang) : '—'}</strong></div>
          <div><span>${t.hotel}</span><strong>${escapeHtml(latest?.hotelName || '—')}</strong></div>
          <div><span>${t.groupBus}</span><strong>${escapeHtml(latest ? `${latest.groupCode || '—'} • ${latest.busNumber || '—'}` : '—')}</strong></div>
        </section>
        <button type="button" class="familyViewRefresh" ${refreshing || !navigator.onLine || inactive ? 'disabled' : ''}>${refreshing ? t.refreshing : t.refresh}</button>
        <section class="familyViewPrivacy"><strong>🔒 ${t.privacy}</strong><p>${t.privacyText}</p></section>
      </section>
    </main>`;
    root.querySelector<HTMLButtonElement>('.familyViewRefresh')?.addEventListener('click', () => void refresh());
  }

  async function refresh() {
    if (refreshing) return;
    if (!familyId || !token) { inactive = true; message = t.missing; paint(); return; }
    if (!navigator.onLine) { message = t.offline; paint(); return; }
    refreshing = true; paint();
    try {
      const response = await fetch(`/api/family/status?family=${encodeURIComponent(familyId)}`, { cache:'no-store', headers:{'x-teman-viewer-token': token} });
      const body = await response.json().catch(() => ({})) as { latest?: FamilyStatus | null; configurationRequired?: boolean; message?: string };
      if (!response.ok) {
        if (response.status === 403 || response.status === 404) { inactive = true; message = t.inactive; }
        else message = body.configurationRequired ? t.config : (body.message || t.failed);
      } else {
        inactive = false; latest = body.latest ?? null; message = body.latest ? t.updated : t.none;
      }
    } catch { message = t.failed; }
    finally { refreshing = false; paint(); }
  }

  const refreshWhenActive = () => {
    if (document.visibilityState === 'visible' && navigator.onLine && !inactive && !refreshing) void refresh();
  };

  window.addEventListener('online', () => { paint(); refreshWhenActive(); });
  window.addEventListener('offline', () => { message = t.offline; paint(); });
  window.addEventListener('focus', refreshWhenActive);
  document.addEventListener('visibilitychange', refreshWhenActive);
  paint(); void refresh();
  window.setInterval(refreshWhenActive, 30_000);
}
