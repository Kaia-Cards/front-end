import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Bootstrap } from './Bootstrap';
import { HomePage } from './pages/HomePage';
import { BrandPage } from './pages/BrandPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentPage } from './pages/PaymentPage';
import { ProfilePage } from './pages/ProfilePage';
import { OrdersPage } from './pages/OrdersPage';
import { SplashScreen } from './components/SplashScreen';
import { useLiff } from './hooks/useLiff';
import './styles/mini-app.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export type PageType = 'home' | 'brand' | 'checkout' | 'payment' | 'profile' | 'orders';

interface MiniAppState {
  currentPage: PageType;
  selectedBrand: any;
  selectedCard: any;
  currentOrder: any;
}

export default function MiniApp() {
  const [state, setState] = useState<MiniAppState>({
    currentPage: 'home',
    selectedBrand: null,
    selectedCard: null,
    currentOrder: null,
  });
  const [showSplash, setShowSplash] = useState(true);
  const { isLiffReady, isLoggedIn } = useLiff();

  useEffect(() => {
    if (isLiffReady) {
      setTimeout(() => setShowSplash(false), 1500);
    }
  }, [isLiffReady]);

  const navigate = (page: PageType, data?: any) => {
    setState(prev => ({
      ...prev,
      currentPage: page,
      ...(data || {}),
    }));
  };

  if (showSplash || !isLiffReady) {
    return <SplashScreen />;
  }

  const renderPage = () => {
    switch (state.currentPage) {
      case 'home':
        return <HomePage navigate={navigate} />;
      case 'brand':
        return <BrandPage brand={state.selectedBrand} navigate={navigate} />;
      case 'checkout':
        return <CheckoutPage card={state.selectedCard} brand={state.selectedBrand} navigate={navigate} />;
      case 'payment':
        return <PaymentPage order={state.currentOrder} navigate={navigate} />;
      case 'profile':
        return <ProfilePage navigate={navigate} />;
      case 'orders':
        return <OrdersPage navigate={navigate} />;
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Bootstrap>
        {renderPage()}
      </Bootstrap>
    </QueryClientProvider>
  );
}