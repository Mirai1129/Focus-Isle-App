import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from './locales/en.json';
import zhTW from './locales/zh-TW.json';

// Get saved language from localStorage or detect browser language
const getSavedLanguage = (): string => {
    const saved = localStorage.getItem('language');
    if (saved) return saved;

    // Detect browser language
    const browserLang = navigator.language;
    if (browserLang.startsWith('zh')) {
        return 'zh-TW';
    }
    return 'en';
};

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {translation: en},
            'zh-TW': {translation: zhTW},
        },
        lng: getSavedLanguage(),
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

// Function to change language and save preference
export const changeLanguage = (lang: string) => {
    localStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
};

export default i18n;
