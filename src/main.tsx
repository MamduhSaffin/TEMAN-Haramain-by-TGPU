import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initUxEnhancements } from './ux-enhancements';
import { initTravelReadiness } from './travel-readiness';
import { initLocationTools } from './location-tools';
import './styles.css';
import './safe-area.css';
import './brand-logo.css';
import './ux-enhancements.css';
import './travel-readiness.css';
import './location-tools.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

initUxEnhancements();
initTravelReadiness();
initLocationTools();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
