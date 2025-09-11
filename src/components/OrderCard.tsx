import React from 'react';
import { Copy, Check, Clock, AlertCircle, Gift } from 'lucide-react';

interface Order {
  id: string;
  brand: string;
  brandLogo: string;
  value: number;
  status: string;
  pricing: {
    finalPrice: number;
    cashback: number;
  };
  createdAt: string;
  cardCode?: string;
  canReorder?: boolean;
}

interface OrderCardProps {
  order: Order;
  onCopyCode?: (code: string) => void;
  onReorder?: (brand: string, value: number) => void;
}

export default function OrderCard({ order, onCopyCode, onReorder }: OrderCardProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = async () => {
    if (order.cardCode && onCopyCode) {
      await navigator.clipboard.writeText(order.cardCode);
      onCopyCode(order.cardCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusIcon = () => {
    switch (order.status) {
      case 'delivered':
        return <Check className="h-5 w-5 text-green-600" />;
      case 'paid':
        return <Clock className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <Gift className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (order.status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{order.brandLogo}</span>
          <div>
            <h3 className="font-semibold text-lg">{order.brand}</h3>
            <p className="text-sm text-gray-500">Order #{order.id.slice(-8)}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor()}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Value</p>
          <p className="font-semibold">${order.value.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Paid</p>
          <p className="font-semibold">${order.pricing.finalPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Cashback</p>
          <p className="font-semibold text-green-600">${order.pricing.cashback.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Date</p>
          <p className="font-semibold text-sm">{formatDate(order.createdAt)}</p>
        </div>
      </div>

      {order.cardCode && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-700">Gift Card Code</p>
            <button
              onClick={handleCopyCode}
              className="flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-700"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="font-mono text-lg font-bold bg-white p-3 rounded border break-all">
            {order.cardCode}
          </div>
        </div>
      )}

      {order.status === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-800">
            ⏳ Waiting for payment confirmation. This order will expire in 15 minutes.
          </p>
        </div>
      )}

      {order.status === 'paid' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            🔄 Payment confirmed! Your gift card is being processed and will be delivered shortly.
          </p>
        </div>
      )}

      {order.status === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-800">
            ❌ Gift card processing failed. Please contact support for assistance.
          </p>
        </div>
      )}

      {order.status === 'expired' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-800">
            ⏰ This order has expired. You can create a new order for the same amount.
          </p>
        </div>
      )}

      <div className="flex space-x-3">
        {order.canReorder && onReorder && (
          <button
            onClick={() => onReorder(order.brand, order.value)}
            className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
          >
            Reorder
          </button>
        )}
        
        {order.status === 'delivered' && (
          <button className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
            Download Receipt
          </button>
        )}
      </div>
    </div>
  );
}