import { useState } from 'react';

export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  return {
    currentLanguage,
    setCurrentLanguage,
  };
};