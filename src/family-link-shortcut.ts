import { onTemanUiRefresh } from './ui-refresh';

type Locale = 'ms' | 'en' | 'ar';

const COPY = {
  ms: {
    title: 'FAMILY LINK',
    subtitle: 'Beritahu keluarga anda selamat dengan satu tekan',
  },
  en: {
    title: 'FAMILY LINK',
    subtitle: 'Tell your family you are safe with one tap',
  },
  ar: {
    title: 'رابط الأسرة',
    subtitle: 'طمئن أسرتك بضغطة واحدة',
  },
} as const;

function locale(): Locale {
  const lang = document.documentElement.lang.toLowerCase();
  if (lang.startsWith('ar')) return 'ar';
  if (lang.startsWith('en')) return 'en';
  return 'ms';
}

export function initFamilyLinkShortcut() {
  let card: HTMLElement | null = null;

  const render = () => {
    const hero = document.querySelector<HTMLElement>('.hero');
    if (!hero) {
      card?.remove();
      card = null;
      return;
    }

    if (!card || !card.isConnected) {
      card = document.createElement('section');
      card.className = 'temanFamilyShortcutCard';
      card.innerHTML = `
        <button type="button" class="temanFamilyShortcutButton" aria-label="Family Link">
          <span class="temanFamilyShortcutIcon" aria-hidden="true">👪</span>
          <span class="temanFamilyShortcutCopy">
            <strong data-family-shortcut-title></strong>
            <small data-family-shortcut-subtitle></small>
          </span>
          <span class="temanFamilyShortcutArrow" aria-hidden="true">›</span>
        </button>
      `;
      const primaryActions = document.querySelector<HTMLElement>('.two');
      (primaryActions || hero).insertAdjacentElement('afterend', card);

      card.querySelector<HTMLButtonElement>('.temanFamilyShortcutButton')?.addEventListener('click', () => {
        document.querySelector<HTMLButtonElement>('.temanFamilyTrigger')?.click();
      });
    }

    const copy = COPY[locale()];
    const title = card.querySelector<HTMLElement>('[data-family-shortcut-title]');
    const subtitle = card.querySelector<HTMLElement>('[data-family-shortcut-subtitle]');
    if (title) title.textContent = copy.title;
    if (subtitle) subtitle.textContent = copy.subtitle;
  };

  onTemanUiRefresh(render);
  render();
  window.setTimeout(render, 120);
  window.setTimeout(render, 500);
}
