import { onTemanUiRefresh } from './ui-refresh';

type Locale = 'ms' | 'en' | 'ar';

type Phrase = { ms: string; en: string; ar: string };

const TITLES = {
  ms: { title: 'FRASA PENTING LAIN', hint: 'Tekan frasa untuk mainkan bahasa Arab.' },
  en: { title: 'MORE ESSENTIAL PHRASES', hint: 'Tap a phrase to play it in Arabic.' },
  ar: { title: 'عبارات مهمة إضافية', hint: 'اضغط على العبارة لتشغيلها بالعربية.' },
} as const;

const PHRASES: Phrase[] = [
  { ms: 'Di mana tandas?', en: 'Where is the toilet?', ar: 'أين دورة المياه؟' },
  { ms: 'Saya perlukan kerusi roda.', en: 'I need a wheelchair.', ar: 'أحتاج إلى كرسي متحرك.' },
  { ms: 'Tolong bawa saya ke klinik atau hospital terdekat.', en: 'Please take me to the nearest clinic or hospital.', ar: 'من فضلك خذني إلى أقرب عيادة أو مستشفى.' },
  { ms: 'Saya perlukan bantuan pihak keselamatan.', en: 'I need help from security.', ar: 'أحتاج إلى مساعدة من الأمن.' },
  { ms: 'Saya perlukan air.', en: 'I need water.', ar: 'أحتاج إلى ماء.' },
  { ms: 'Saya tidak bercakap bahasa Arab.', en: 'I do not speak Arabic.', ar: 'أنا لا أتحدث العربية.' },
  { ms: 'Saya dari Malaysia.', en: 'I am from Malaysia.', ar: 'أنا من ماليزيا.' },
  { ms: 'Saya tidak dapat mencari hotel saya.', en: 'I cannot find my hotel.', ar: 'لا أستطيع العثور على فندقي.' },
];

function locale(): Locale {
  const lang = document.documentElement.lang.toLowerCase();
  if (lang.startsWith('ar')) return 'ar';
  if (lang.startsWith('en')) return 'en';
  return 'ms';
}

function speakArabic(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = 'ar-SA';
  speech.rate = 0.8;
  window.speechSynthesis.speak(speech);
}

export function initPhraseExpansion() {
  const render = () => {
    const translationCard = document.querySelector<HTMLElement>('.translationCard');
    if (!translationCard) return;
    let section = document.querySelector<HTMLElement>('.extraPhraseSection');
    if (!section) {
      section = document.createElement('section');
      section.className = 'extraPhraseSection';
      section.innerHTML = '<div class="extraPhraseHead"><strong></strong><span></span></div><div class="extraPhraseGrid"></div>';
      translationCard.insertAdjacentElement('afterend', section);
      const grid = section.querySelector<HTMLElement>('.extraPhraseGrid')!;
      PHRASES.forEach((phrase, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.phraseIndex = String(index);
        button.innerHTML = '<span class="phraseMeaning"></span><strong class="phraseArabic" lang="ar" dir="rtl"></strong><b aria-hidden="true">▶</b>';
        button.querySelector<HTMLElement>('.phraseArabic')!.textContent = phrase.ar;
        button.addEventListener('click', () => speakArabic(phrase.ar));
        grid.appendChild(button);
      });
    }

    const lang = locale();
    const heading = TITLES[lang];
    section.querySelector<HTMLElement>('.extraPhraseHead strong')!.textContent = heading.title;
    section.querySelector<HTMLElement>('.extraPhraseHead span')!.textContent = heading.hint;
    section.querySelectorAll<HTMLButtonElement>('[data-phrase-index]').forEach(button => {
      const phrase = PHRASES[Number(button.dataset.phraseIndex)];
      button.querySelector<HTMLElement>('.phraseMeaning')!.textContent = phrase[lang];
    });
  };

  onTemanUiRefresh(render);
  window.setTimeout(render, 0);
}
