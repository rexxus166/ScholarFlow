import { createContext, useContext, useState, useEffect } from 'react';
import { getStorage, setStorage } from '../utils/storage';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(() => getStorage('scholarflow_lang', 'en'));

    useEffect(() => {
        setStorage('scholarflow_lang', lang);
    }, [lang]);

    const toggleLang = () => {
        setLang(lang === 'en' ? 'id' : 'en');
    };

    const t = (key) => translations[lang][key] || key;

    return (
        <LanguageContext.Provider value={{ lang, toggleLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
