import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();

  const languageNames = {
    en: 'English',
    ja: '日本語',
    ko: '한국어'
  };

  return (
    <div className="language-selector">
      <select 
        value={currentLanguage} 
        onChange={(e) => changeLanguage(e.target.value)}
        className="language-select"
      >
        {supportedLanguages.map(lang => (
          <option key={lang} value={lang}>
            {languageNames[lang as keyof typeof languageNames]}
          </option>
        ))}
      </select>
    </div>
  );
};