import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import en from './locales/en.json';
import ar from './locales/ar.json';
import zh from './locales/zh.json';
import nl from './locales/nl.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import he from './locales/he.json';
import it from './locales/it.json';
import pl from './locales/pl.json';
import pt from './locales/pt.json';
import ro from './locales/ro.json';
import ru from './locales/ru.json';
import es from './locales/es.json';
import tr from './locales/tr.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  zh: { translation: zh },
  nl: { translation: nl },
  fr: { translation: fr },
  de: { translation: de },
  he: { translation: he },
  it: { translation: it },
  pl: { translation: pl },
  pt: { translation: pt },
  ro: { translation: ro },
  ru: { translation: ru },
  es: { translation: es },
  tr: { translation: tr }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
