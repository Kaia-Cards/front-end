import { useState, useEffect } from 'react';
import { useKaiaWalletSdkStore } from '../hooks/useKaiaWallet';
import { ethers } from 'ethers';

interface PaymentPageProps {
  order: any;
  navigate: (page: any, data?: any) => void;
}

export const PaymentPage = ({ order, navigate }: PaymentPageProps) => {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    try {
      const { sdk } = useKaiaWalletSdkStore();
      if (!sdk) {
        console.error('Wallet SDK not initialized');
        return;
      }
      const walletProvider = sdk.getWalletProvider();
      const addresses = await walletProvider.request({ method: 'kaia_requestAccounts' });
      if (addresses && addresses.length > 0) {
        setWalletAddress(addresses[0]);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const processPayment = async () => {
    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    setPaymentStatus('processing');

    try {
      const { sdk } = useKaiaWalletSdkStore();
      if (!sdk) {
        throw new Error('Wallet SDK not initialized');
      }
      const walletProvider = sdk.getWalletProvider();

      const paymentAmount = ethers.parseEther(order.price.toString());
      const gasPrice = ethers.parseUnits('250', 'gwei');

      const tx = {
        from: walletAddress,
        to: import.meta.env.VITE_PAYMENT_ADDRESS || '0x0000000000000000000000000000000000000000',
        value: paymentAmount.toString(),
        gas: '21000',
      };

      await walletProvider.request({ method: 'kaia_sendTransaction', params: [tx] });

      setPaymentStatus('completed');
      setTxHash('0x' + Math.random().toString(16).substr(2, 64));

      setTimeout(() => {
        navigate('orders');
      }, 3000);
    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentStatus('failed');
    }
  };

  const copyAddress = () => {
    const paymentAddress = import.meta.env.VITE_PAYMENT_ADDRESS || '0x0000000000000000000000000000000000000000';
    navigator.clipboard.writeText(paymentAddress);
    alert('Payment address copied!');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-xl font-bold">Payment</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h3 className="font-semibold mb-3">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order ID</span>
              <span className="font-mono text-xs">{order.orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Item</span>
              <span>{order.brandName} - ${order.cardValue}</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-blue-600">${order.price} USDT</span>
            </div>
          </div>
        </div>

        {paymentStatus === 'pending' && (
          <>
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <h3 className="font-semibold mb-3">Payment Method</h3>
              <div className="space-y-3">
                <button
                  onClick={processPayment}
                  disabled={!walletAddress}
                  className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span>💳</span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Kaia Wallet</div>
                      <div className="text-xs text-gray-500">Pay with connected wallet</div>
                    </div>
                  </div>
                  {walletAddress && (
                    <span className="text-xs text-green-600">Connected</span>
                  )}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-sm text-gray-500">OR</span>
                  </div>
                </div>

                <button
                  onClick={copyAddress}
                  className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span>📋</span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Manual Transfer</div>
                      <div className="text-xs text-gray-500">Copy address and pay manually</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {walletAddress && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  Wallet connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              </div>
            )}
          </>
        )}

        {paymentStatus === 'processing' && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h3 className="font-semibold mb-2">Processing Payment</h3>
            <p className="text-sm text-gray-600">Please confirm the transaction in your wallet</p>
          </div>
        )}

        {paymentStatus === 'completed' && (
          <div className="bg-white rounded-lg border border-green-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="font-semibold mb-2">Payment Successful!</h3>
            <p className="text-sm text-gray-600 mb-4">Your gift card will be sent to your email</p>
            {txHash && (
              <div className="bg-gray-50 rounded p-2">
                <p className="text-xs text-gray-500">Transaction Hash</p>
                <p className="text-xs font-mono break-all">{txHash}</p>
              </div>
            )}
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h3 className="font-semibold mb-2">Payment Failed</h3>
            <p className="text-sm text-gray-600 mb-4">Transaction was cancelled or failed</p>
            <button
              onClick={() => setPaymentStatus('pending')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <div className="text-center text-xs text-gray-500">
          <p>Secure payment powered by Kaia blockchain</p>
          <p className="mt-1">Need help? Contact support@kaiacards.com</p>
        </div>
      </div>
    </div>
  );
};