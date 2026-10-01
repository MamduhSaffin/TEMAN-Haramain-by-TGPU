import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initTemanUiRefresh, onTemanUiRefresh } from './ui-refresh';
import { initUxEnhancements } from './ux-enhancements';
import { initTravelReadiness } from './travel-readiness';
import { initLocationTools } from './location-tools';
import { initAccessibilityTools } from './accessibility-tools';
import { initPhraseExpansion } from './phrase-expansion';
import { initProfileBackup } from './profile-backup';
import { initSaudiEmergency } from './saudi-emergency';
import { initTemanReminders } from './teman-reminders';
import { initFamilyLink } from './family-link';
import { initFamilyLinkShortcut } from './family-link-shortcut';
import { initFamilySmsFallback } from './family-sms';
import { initOfflineEmergencyCard } from './offline-card';
import { isFamilyViewRoute, renderFamilyView } from './family-view';
import { runStorageMigrations } from './storage-migrations';
import './styles.css';
import './safe-area.css';
import './brand-logo.css';
import './ux-enhancements.css';
import './travel-readiness.css';
import './location-tools.css';
import './accessibility-tools.css';
import './phrase-expansion.css';
import './profile-backup.css';
import './saudi-emergency.css';
import './teman-reminders.css';
import './family-link.css';
import './family-link-shortcut.css';
import './family-sms.css';
import './offline-card.css';
import './offline-map.css';

const rootElement = document.getElementById('root')!;
const MAP_PACK_CACHE = 'teman-map-packs-v1';

function offlineMapLabel(loading = false) {
  const lang = document.documentElement.lang.toLowerCase();
  if (lang.startsWith('ar')) return loading ? '🗺️ جارٍ تحميل الخريطة…' : '🗺️ خريطة دون إنترنت';
  if (lang.startsWith('en')) return loading ? '🗺️ LOADING MAP…' : '🗺️ OFFLINE MAP';
  return loading ? '🗺️ MEMUAT PETA…' : '🗺️ PETA OFFLINE';
}

function initLazyOfflineMap() {
  if (document.querySelector('.temanOfflineMapTrigger')) return;

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'temanOfflineMapTrigger';
  document.body.appendChild(trigger);

  let loading = false;
  let loaded = false;

  const refreshLabel = () => {
    if (!loaded) trigger.textContent = offlineMapLabel(loading);
  };

  trigger.addEventListener('click', async () => {
    if (loading || loaded) return;
    loading = true;
    trigger.disabled = true;
    refreshLabel();

    try {
      trigger.remove();
      const { initOfflineMap } = await import('./offline-map');
      initOfflineMap();
      const realTrigger = document.querySelector<HTMLButtonElement>('.temanOfflineMapTrigger');
      if (!realTrigger) throw new Error('Offline map trigger was not created');
      loaded = true;
      realTrigger.click();
    } catch {
      loading = false;
      trigger.disabled = false;
      refreshLabel();
      if (!trigger.isConnected) document.body.appendChild(trigger);
    }
  });

  onTemanUiRefresh(refreshLabel);
  refreshLabel();
}

async function hasSavedOfflineMapPack() {
  if (!('caches' in window)) return false;
  try {
    const cache = await caches.open(MAP_PACK_CACHE);
    return Boolean(
      (await cache.match('/maps/makkah.pmtiles')) ||
      (await cache.match('/maps/madinah.pmtiles')),
    );
  } catch {
    return false;
  }
}

function warmOfflineMapEngineForSavedPacks() {
  if (!navigator.onLine) return;
  window.setTimeout(async () => {
    if (!navigator.onLine || !(await hasSavedOfflineMapPack())) return;
    void import('./offline-map').catch(() => {});
  }, 5000);
}

if (isFamilyViewRoute()) {
  renderFamilyView(rootElement);
} else {
  runStorageMigrations();

  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );

  initTemanUiRefresh();
  initUxEnhancements();
  initTravelReadiness();
  initLocationTools();
  initAccessibilityTools();
  initPhraseExpansion();
  initProfileBackup();
  initSaudiEmergency();
  initTemanReminders();
  initFamilyLink();
  initFamilyLinkShortcut();
  initFamilySmsFallback();
  initOfflineEmergencyCard();
  initLazyOfflineMap();
  warmOfflineMapEngineForSavedPacks();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
