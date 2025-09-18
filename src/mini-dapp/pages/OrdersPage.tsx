import { useState, useEffect } from 'react';
import { useLiff } from '../hooks/useLiff';

interface Order {
  id: string;
  brandName: string;
  brandLogo?: string;
  cardValue: number;
  price: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  giftCode?: string;
  txHash?: string;
}

interface OrdersPageProps {
  navigate: (page: any) => void;
}

export const OrdersPage = ({ navigate }: OrdersPageProps) => {
  const { liffUser } = useLiff();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders?userId=${liffUser?.userId}`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
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
        <h1 className="text-xl font-bold">My Orders</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl mb-4 block">📦</span>
            <h3 className="font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-sm text-gray-600 mb-4">Start shopping to see your orders here</p>
            <button
              onClick={() => navigate('home')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {orders.map(order => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="w-full bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {order.brandLogo ? (
                        <img src={order.brandLogo} alt={order.brandName} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-xl">🏪</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{order.brandName}</h3>
                      <p className="text-sm text-gray-600">${order.cardValue} Gift Card</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{formatDate(order.createdAt)}</span>
                  <span className="font-medium text-gray-900">${order.price}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Order Details</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 flex items-center justify-center text-gray-500"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  {selectedOrder.brandLogo ? (
                    <img src={selectedOrder.brandLogo} alt={selectedOrder.brandName} className="w-12 h-12 object-contain" />
                  ) : (
                    <span className="text-2xl">🏪</span>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">{selectedOrder.brandName}</h4>
                  <p className="text-sm text-gray-600">${selectedOrder.cardValue} Gift Card</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID</span>
                  <span className="font-mono text-xs">{selectedOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span>{formatDate(selectedOrder.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-semibold">${selectedOrder.price}</span>
                </div>
              </div>

              {selectedOrder.status === 'completed' && selectedOrder.giftCode && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Gift Card Code</h4>
                  <div className="bg-white rounded p-3 font-mono text-center text-lg border border-green-300">
                    {selectedOrder.giftCode}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedOrder.giftCode || '');
                      alert('Code copied!');
                    }}
                    className="w-full mt-3 py-2 bg-green-600 text-white rounded-lg text-sm"
                  >
                    Copy Code
                  </button>
                </div>
              )}

              {selectedOrder.txHash && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
                  <p className="text-xs font-mono break-all">{selectedOrder.txHash}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};