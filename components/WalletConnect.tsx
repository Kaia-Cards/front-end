import React, { useState, useEffect } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { MINI_DAPP_CONFIG } from '../config/miniDapp';

interface WalletInfo {
  address: string;
  balance: string;
  network: string;
}

interface WalletConnectProps {
  onWalletChange: (wallet: WalletInfo | null) => void;
  translations: any;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onWalletChange, translations }) => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (MINI_DAPP_CONFIG.reownProjectId) {
      createAppKit({
        projectId: MINI_DAPP_CONFIG.reownProjectId,
        networks: [{
          id: 8217,
          name: 'Kaia',
          nativeCurrency: { name: 'KAIA', symbol: 'KAIA', decimals: 18 },
          rpcUrls: { default: { http: ['https://public-node-api.klaytnapi.com/v1/cypress'] } }
        }],
        metadata: {
          name: 'Kaia Cards',
          description: 'Asian Gift Cards Marketplace',
          url: window.location.origin,
          icons: []
        }
      });
    }
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // Wallet connection logic will be implemented here
      // For now, simulate wallet connection
      const mockWallet: WalletInfo = {
        address: '0x' + Math.random().toString(16).substr(2, 40),
        balance: '100.00',
        network: 'Kaia'
      };
      setWalletInfo(mockWallet);
      onWalletChange(mockWallet);
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletInfo(null);
    onWalletChange(null);
  };

  if (walletInfo) {
    return (
      <div className="wallet-info">
        <div className="wallet-details">
          <div className="wallet-address">{walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}</div>
          <div className="wallet-balance">{walletInfo.balance} USDT</div>
          <div className="wallet-network">{walletInfo.network}</div>
        </div>
        <button onClick={disconnectWallet} className="wallet-disconnect-btn">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={connectWallet} 
      disabled={isConnecting}
      className="wallet-connect-btn"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
};