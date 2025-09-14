import React, { useState, useEffect } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { MINI_DAPP_CONFIG } from '../config/miniDapp';

declare global {
  interface Window {
    ethereum?: any;
    okxwallet?: any;
    rabby?: any;
  }
}

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
  const [showWalletModal, setShowWalletModal] = useState(false);

  useEffect(() => {
    if (MINI_DAPP_CONFIG.reownProjectId) {
      try {
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
      } catch (error) {
        console.error('Reown AppKit initialization failed:', error);
      }
    } else {
      console.warn('Reown Project ID not configured - using demo wallet connection');
    }
  }, []);

  const connectWallet = async (walletType: string) => {
    setIsConnecting(true);
    try {
      let provider = null;
      
      if (walletType === 'metamask') {
        if (!window.ethereum) {
          throw new Error('MetaMask not installed');
        }
        provider = window.ethereum;
      } else if (walletType === 'okx') {
        if (!window.okxwallet) {
          throw new Error('OKX Wallet not installed');
        }
        provider = window.okxwallet;
      } else if (walletType === 'rabby') {
        if (!window.rabby) {
          throw new Error('Rabby Wallet not installed');
        }
        provider = window.rabby;
      } else if (walletType === 'walletconnect') {
        // Use the existing Reown AppKit for WalletConnect
        throw new Error('WalletConnect coming soon');
      }

      if (provider) {
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          const balance = await provider.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest']
          });
          
          const walletData: WalletInfo = {
            address: accounts[0],
            balance: (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4),
            network: 'Kaia'
          };
          
          setWalletInfo(walletData);
          onWalletChange(walletData);
          setShowWalletModal(false);
        }
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      alert(`Failed to connect: ${error.message}`);
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

  if (showWalletModal) {
    return (
      <div className="wallet-modal">
        <div className="wallet-modal-backdrop" onClick={() => setShowWalletModal(false)}></div>
        <div className="wallet-modal-content">
          <div className="wallet-modal-header">
            <h3>Connect Wallet</h3>
            <button onClick={() => setShowWalletModal(false)}>✕</button>
          </div>
          <div className="wallet-options">
            <button 
              className="wallet-option metamask" 
              onClick={() => connectWallet('metamask')}
              disabled={isConnecting}
            >
              <div className="wallet-icon">🦊</div>
              <div className="wallet-info-section">
                <div className="wallet-name">MetaMask</div>
              </div>
            </button>
            <button 
              className="wallet-option rabby" 
              onClick={() => connectWallet('rabby')}
              disabled={isConnecting}
            >
              <div className="wallet-icon">🐰</div>
              <div className="wallet-info-section">
                <div className="wallet-name">Rabby</div>
              </div>
            </button>
            <button 
              className="wallet-option okx" 
              onClick={() => connectWallet('okx')}
              disabled={isConnecting}
            >
              <div className="wallet-icon">⚫</div>
              <div className="wallet-info-section">
                <div className="wallet-name">OKX Wallet</div>
              </div>
            </button>
          </div>
          {isConnecting && <div className="connecting-status">Connecting...</div>}
        </div>
      </div>
    );
  }

  return (
    <button 
      onClick={() => setShowWalletModal(true)} 
      disabled={isConnecting}
      className="wallet-connect-btn"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
};