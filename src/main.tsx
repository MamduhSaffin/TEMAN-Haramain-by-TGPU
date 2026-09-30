import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initUxEnhancements } from './ux-enhancements';
import './styles.css';
import './safe-area.css';
import './brand-logo.css';
import './ux-enhancements.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

initUxEnhancements();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
