import { useState, useEffect } from 'react';
import liff from '@line/liff';

interface LiffUser {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export const useLiff = () => {
  const [isLiffReady, setIsLiffReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [liffUser, setLiffUser] = useState<LiffUser | null>(null);
  const [isInLineApp, setIsInLineApp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({
          liffId: import.meta.env.VITE_LIFF_ID || '',
          withLoginOnExternalBrowser: true,
        });

        setIsLiffReady(true);
        setIsInLineApp(liff.isInClient());

        if (liff.isLoggedIn()) {
          setIsLoggedIn(true);
          const profile = await liff.getProfile();
          setLiffUser({
            userId: profile.userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
            statusMessage: profile.statusMessage,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize LIFF');
        console.error('LIFF initialization failed:', err);
      }
    };

    initLiff();
  }, []);

  const login = async () => {
    try {
      if (!liff.isLoggedIn()) {
        liff.login();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const logout = () => {
    if (liff.isLoggedIn()) {
      liff.logout();
      window.location.reload();
    }
  };

  const openExternalBrowser = (url: string) => {
    liff.openWindow({
      url: url,
      external: true,
    });
  };

  const closeApp = () => {
    liff.closeWindow();
  };

  const shareMessage = (message: any) => {
    if (liff.isApiAvailable('shareTargetPicker')) {
      liff.shareTargetPicker([message]);
    }
  };

  const scanQRCode = async (): Promise<string | null> => {
    if (liff.isApiAvailable('scanCodeV2')) {
      try {
        const result = await liff.scanCodeV2();
        return result.value;
      } catch (err) {
        console.error('QR scan failed:', err);
        return null;
      }
    }
    return null;
  };

  return {
    isLiffReady,
    isLoggedIn,
    liffUser,
    isInLineApp,
    error,
    login,
    logout,
    openExternalBrowser,
    closeApp,
    shareMessage,
    scanQRCode,
  };
};