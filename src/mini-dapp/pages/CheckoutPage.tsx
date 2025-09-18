import { useState } from 'react';
import { useLiff } from '../hooks/useLiff';

interface CheckoutPageProps {
  card: any;
  brand: any;
  navigate: (page: any, data?: any) => void;
}

export const CheckoutPage = ({ card, brand, navigate }: CheckoutPageProps) => {
  const { liffUser } = useLiff();
  const [email, setEmail] = useState(liffUser?.displayName ? `${liffUser.displayName}@line.user` : '');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleCheckout = async () => {
    if (!email || !termsAccepted) {
      alert('Please enter email and accept terms');
      return;
    }

    setProcessing(true);
    try {
      const orderData = {
        brandId: brand.id,
        brandName: brand.name,
        cardValue: card.value,
        price: card.price,
        email: email,
        userId: liffUser?.userId,
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const order = await response.json();
      navigate('payment', { currentOrder: order });
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Failed to create order');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 p-4">
        <button
          onClick={() => navigate('brand', { selectedBrand: brand })}
          className="flex items-center gap-2 text-gray-600 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-xl font-bold">Checkout</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              {brand.logo ? (
                <img src={brand.logo} alt={brand.name} className="w-8 h-8 object-contain" />
              ) : (
                <span className="text-xl">🏪</span>
              )}
            </div>
            <div>
              <h3 className="font-semibold">{brand.name}</h3>
              <p className="text-sm text-gray-600">${card.value} Gift Card</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Card Value</span>
              <span className="font-medium">${card.value}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount</span>
              <span className="text-green-600">-${(card.value - card.price).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-blue-600">${card.price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h3 className="font-semibold mb-3">Delivery Details</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Gift card code will be sent to this email
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-800">
            ⚡ Instant delivery after payment confirmation
          </p>
        </div>

        <div className="mb-4">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-gray-600">
              I accept the terms and conditions and understand that all sales are final
            </span>
          </label>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <button
          onClick={handleCheckout}
          disabled={!termsAccepted || processing}
          className={`w-full py-3 rounded-lg font-medium transition-colors ${
            termsAccepted && !processing
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          {processing ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </div>
    </div>
  );
};