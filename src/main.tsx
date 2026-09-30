import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initTemanUiRefresh } from './ui-refresh';
import { initUxEnhancements } from './ux-enhancements';
import { initTravelReadiness } from './travel-readiness';
import { initLocationTools } from './location-tools';
import { initAccessibilityTools } from './accessibility-tools';
import { initPhraseExpansion } from './phrase-expansion';
import { initProfileBackup } from './profile-backup';
import { initSaudiEmergency } from './saudi-emergency';
import { initTemanReminders } from './teman-reminders';
import { initFamilyLink } from './family-link';
import { initFamilySmsFallback } from './family-sms';
import { initOfflineEmergencyCard } from './offline-card';
import { isFamilyViewRoute, renderFamilyView } from './family-view';
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
import './family-sms.css';
import './offline-card.css';

const rootElement = document.getElementById('root')!;

if (isFamilyViewRoute()) {
  renderFamilyView(rootElement);
} else {
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
  initFamilySmsFallback();
  initOfflineEmergencyCard();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
