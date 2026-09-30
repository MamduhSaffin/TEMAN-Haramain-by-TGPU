import { onTemanUiRefresh } from './ui-refresh';

type Locale = 'ms' | 'en' | 'ar';

const LABELS: Record<Locale, { normal: string; large: string }> = {
  ms: { normal: 'Teks biasa', large: 'Teks besar untuk lebih mudah dibaca' },
  en: { normal: 'Normal text', large: 'Larger text for easier reading' },
  ar: { normal: 'نص عادي', large: 'نص أكبر وأسهل للقراءة' },
};

function locale(): Locale {
  const lang = document.documentElement.lang.toLowerCase();
  if (lang.startsWith('ar')) return 'ar';
  if (lang.startsWith('en')) return 'en';
  return 'ms';
}

export function initAccessibilityTools() {
  let large = localStorage.getItem('teman-large-text') === '1';

  const apply = () => {
    document.body.classList.toggle('seniorTextMode', large);
    const button = document.querySelector<HTMLButtonElement>('.textSizeToggle');
    if (!button) return;
    const label = LABELS[locale()];
    button.setAttribute('aria-pressed', String(large));
    button.setAttribute('aria-label', large ? label.normal : label.large);
    button.title = large ? label.normal : label.large;
    button.classList.toggle('active', large);
  };

  const ensureButton = () => {
    const topbar = document.querySelector<HTMLElement>('.topbar');
    if (!topbar || topbar.querySelector('.textSizeToggle')) {
      apply();
      return;
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'textSizeToggle';
    button.innerHTML = '<span aria-hidden="true">A+</span>';
    button.addEventListener('click', () => {
      large = !large;
      localStorage.setItem('teman-large-text', large ? '1' : '0');
      apply();
    });
    const langs = topbar.querySelector('.langs');
    if (langs) topbar.insertBefore(button, langs);
    else topbar.appendChild(button);
    apply();
  };

  onTemanUiRefresh(ensureButton);
  window.setTimeout(ensureButton, 0);
}
