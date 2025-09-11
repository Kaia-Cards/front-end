import { useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../config/miniDapp';

export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState(DEFAULT_LANGUAGE);

  useEffect(() => {
    const detectLanguage = () => {
      const browserLang = navigator.language.toLowerCase();
      
      if (browserLang.startsWith('ja')) {
        return 'ja';
      } else if (browserLang.startsWith('ko')) {
        return 'ko';
      } else {
        return 'en';
      }
    };

    const savedLanguage = localStorage.getItem('kaiacards-language');
    const detectedLanguage = detectLanguage();
    
    const language = savedLanguage || detectedLanguage;
    
    if (SUPPORTED_LANGUAGES.includes(language)) {
      setCurrentLanguage(language);
    } else {
      setCurrentLanguage(DEFAULT_LANGUAGE);
    }
  }, []);

  const changeLanguage = (lang: string) => {
    if (SUPPORTED_LANGUAGES.includes(lang)) {
      setCurrentLanguage(lang);
      localStorage.setItem('kaiacards-language', lang);
    }
  };

  return {
    currentLanguage,
    changeLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES
  };
};