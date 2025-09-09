import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import pt from './locales/pt.json';
import kimbundo from './locales/kimbundo.json';
import umbundo from './locales/umbundo.json';
import tchoque from './locales/tchoque.json';
import en from './locales/en.json';

const resources = {
  pt: { translation: pt },
  kimbundo: { translation: kimbundo },
  umbundo: { translation: umbundo },
  tchoque: { translation: tchoque },
  en: { translation: en },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
  lng: 'pt',
  fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
