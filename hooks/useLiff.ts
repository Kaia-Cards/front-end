import { useState, useEffect } from 'react';
import liff from '@line/liff';
import { MINI_DAPP_CONFIG } from '../config/miniDapp';

interface LiffUser {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

export const useLiff = () => {
  const [isLiffReady, setIsLiffReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [liffUser, setLiffUser] = useState<LiffUser | null>(null);
  const [isInLineApp, setIsInLineApp] = useState(false);

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        await liff.init({ liffId: MINI_DAPP_CONFIG.liffId });
        setIsLiffReady(true);
        setIsInLineApp(liff.isInClient());
        
        if (liff.isLoggedIn()) {
          setIsLoggedIn(true);
          const profile = await liff.getProfile();
          setLiffUser({
            userId: profile.userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl
          });
        }
      } catch (error) {
        console.error('LIFF initialization failed:', error);
        setIsLiffReady(true);
        setIsInLineApp(false);
      }
    };

    if (MINI_DAPP_CONFIG.liffId) {
      initializeLiff();
    } else {
      setIsLiffReady(true);
      setIsInLineApp(false);
      console.warn('LIFF_ID not configured - running in web mode');
    }
  }, []);

  const login = () => {
    if (isLiffReady) {
      liff.login();
    }
  };

  const logout = () => {
    if (isLiffReady) {
      liff.logout();
      setIsLoggedIn(false);
      setLiffUser(null);
    }
  };

  const closeWindow = () => {
    if (isLiffReady && isInLineApp) {
      liff.closeWindow();
    }
  };

  return {
    isLiffReady,
    isLoggedIn,
    liffUser,
    isInLineApp,
    login,
    logout,
    closeWindow
  };
};