import { ReactNode, useEffect } from 'react';
import { useKaiaWalletSecurity } from './hooks/useKaiaWallet';
import { MarketDataProvider } from './providers/MarketDataProvider';
import { Header } from './components/Header';

interface BootstrapProps {
  className?: string;
  children?: ReactNode;
}

export const Bootstrap = ({ className, children }: BootstrapProps) => {
  const { isSuccess } = useKaiaWalletSecurity();

  useEffect(() => {
    const preventGoBack = () => {
      if (window.location.pathname === '/mini') {
        const isConfirmed = confirm('Are you sure you want to go back?');
        if (!isConfirmed) {
          history.pushState(null, '', window.location.pathname);
        }
      }
    };

    window.addEventListener('popstate', preventGoBack);

    return () => {
      window.removeEventListener('popstate', preventGoBack);
    };
  }, []);

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col mx-auto max-w-xl relative ${className || ''}`}>
      {isSuccess && (
        <MarketDataProvider>
          <Header />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </MarketDataProvider>
      )}
    </div>
  );
};