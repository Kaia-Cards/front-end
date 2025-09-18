import { useState, useEffect } from 'react';

interface GiftCard {
  id: string;
  value: number;
  price: number;
  discount: number;
}

interface BrandPageProps {
  brand: any;
  navigate: (page: any, data?: any) => void;
}

export const BrandPage = ({ brand, navigate }: BrandPageProps) => {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGiftCards();
  }, [brand]);

  const fetchGiftCards = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/brands/${brand.id}/cards`);
      const data = await response.json();
      setGiftCards(data);
    } catch (error) {
      console.error('Failed to fetch gift cards:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 p-4">
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2 text-gray-600 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
            {brand.logo ? (
              <img src={brand.logo} alt={brand.name} className="w-12 h-12 object-contain" />
            ) : (
              <span className="text-2xl">🏪</span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold">{brand.name}</h1>
            <p className="text-sm text-gray-600">{brand.category}</p>
            {brand.discount > 0 && (
              <span className="inline-block mt-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">
                Up to {brand.discount}% OFF
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="font-semibold text-gray-700 mb-3">Select Amount</h2>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {giftCards.map(card => (
              <button
                key={card.id}
                onClick={() => navigate('checkout', { selectedCard: card, selectedBrand: brand })}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="text-2xl font-bold text-gray-900">
                  ${card.value}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Pay ${card.price.toFixed(2)}
                </div>
                {card.discount > 0 && (
                  <div className="text-xs text-green-600 font-medium mt-2">
                    Save ${(card.value - card.price).toFixed(2)}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-sm mb-2">How it works</h3>
          <ol className="text-xs text-gray-600 space-y-1">
            <li>1. Select your gift card amount</li>
            <li>2. Complete payment with crypto</li>
            <li>3. Receive your gift card code instantly</li>
            <li>4. Redeem at {brand.name} online or in-store</li>
          </ol>
        </div>
      </div>
    </div>
  );
};