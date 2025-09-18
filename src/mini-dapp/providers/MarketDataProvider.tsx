import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface MarketData {
  brands: Brand[];
  giftCards: GiftCard[];
  loading: boolean;
  error: string | null;
}

interface Brand {
  id: string;
  name: string;
  logo: string;
  category: string;
  discount: number;
  available: boolean;
}

interface GiftCard {
  id: string;
  brandId: string;
  value: number;
  price: number;
  stock: number;
}

const MarketDataContext = createContext<MarketData | undefined>(undefined);

export const MarketDataProvider = ({ children }: { children: ReactNode }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const brandsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/brands`);
        const brandsData = await brandsResponse.json();
        setBrands(brandsData);

        const cardsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/giftcards`);
        const cardsData = await cardsResponse.json();
        setGiftCards(cardsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market data');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  return (
    <MarketDataContext.Provider value={{ brands, giftCards, loading, error }}>
      {children}
    </MarketDataContext.Provider>
  );
};

export const useMarketData = () => {
  const context = useContext(MarketDataContext);
  if (context === undefined) {
    throw new Error('useMarketData must be used within a MarketDataProvider');
  }
  return context;
};