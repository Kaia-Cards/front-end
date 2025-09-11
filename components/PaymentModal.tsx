import React, { useState, useEffect } from 'react';
import { X, Clock, Copy, Check, ExternalLink, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onPaymentConfirmed: (txHash: string) => void;
}

export default function PaymentModal({ order, isOpen, onClose, onPaymentConfirmed }: PaymentModalProps) {
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (order && isOpen) {
      const expiryTime = new Date(order.expiresAt).getTime();
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const remaining = Math.max(0, expiryTime - now);
        setTimeLeft(remaining);
        
        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [order, isOpen]);

  const formatTimeLeft = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitPayment = async () => {
    if (!txHash.trim()) return;

    setLoading(true);
    try {
      await onPaymentConfirmed(txHash.trim());
    } catch (error) {
      console.error('Payment submission failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const isValidTxHash = (hash: string) => {
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Complete Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {timeLeft > 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">
                  Time remaining: {formatTimeLeft(timeLeft)}
                </span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Complete your payment before this order expires
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Order Expired</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                This order has expired. Please create a new order.
              </p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Brand:</span>
                <span className="font-medium">{order.brand}</span>
              </div>
              <div className="flex justify-between">
                <span>Gift Card Value:</span>
                <span className="font-medium">${order.value}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span className="text-green-600 font-medium">
                  -${(order.value - order.pricing.finalPrice).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cashback (1%):</span>
                <span className="text-green-600 font-medium">
                  ${order.pricing.cashback.toFixed(2)}
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total to Pay:</span>
                <span>${order.pricing.finalPrice.toFixed(2)} USDT</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-3">Payment Instructions</h4>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-blue-800 font-medium mb-1">
                  Send USDT to this address:
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 font-mono text-xs bg-white p-2 rounded border break-all">
                    {order.payment.address}
                  </div>
                  <button
                    onClick={() => copyToClipboard(order.payment.address)}
                    className="p-2 text-blue-600 hover:text-blue-700"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-blue-800 font-medium mb-1">
                  Amount:
                </label>
                <div className="flex items-center space-x-2">
                  <div className="font-mono font-bold bg-white p-2 rounded border">
                    {order.pricing.finalPrice} USDT
                  </div>
                  <button
                    onClick={() => copyToClipboard(order.pricing.finalPrice.toString())}
                    className="p-2 text-blue-600 hover:text-blue-700"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-blue-800 font-medium mb-1">
                  Network:
                </label>
                <div className="font-medium bg-white p-2 rounded border">
                  Kaia Network
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-100 rounded">
              <p className="text-xs text-blue-800">
                ⚠️ Important: Send exactly {order.pricing.finalPrice} USDT to the address above. 
                Sending a different amount or to a different address may result in loss of funds.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Transaction Hash (after sending payment):
              </label>
              <input
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={timeLeft === 0}
              />
              {txHash && !isValidTxHash(txHash) && (
                <p className="text-red-600 text-xs mt-1">
                  Please enter a valid transaction hash (starts with 0x followed by 64 characters)
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSubmitPayment}
                disabled={!txHash.trim() || !isValidTxHash(txHash) || loading || timeLeft === 0}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                {loading ? 'Confirming Payment...' : 'Confirm Payment'}
              </button>
              
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a
              href="https://kaiascan.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-700"
            >
              <span>View on Kaia Explorer</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}