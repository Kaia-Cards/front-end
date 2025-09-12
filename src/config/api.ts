const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  if (process.env.NODE_ENV === 'production') {
    return 'https://api.kaiacards.com/api';
  }
  
  return 'http://localhost:3001/api';
};

const getWsBaseUrl = () => {
  if (process.env.REACT_APP_WS_BASE_URL) {
    return process.env.REACT_APP_WS_BASE_URL;
  }
  
  if (process.env.NODE_ENV === 'production') {
    return 'wss://api.kaiacards.com';
  }
  
  return 'ws://localhost:3001';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  WS_URL: getWsBaseUrl(),
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export const ENDPOINTS = {
  BRANDS: '/brands',
  BRAND_DETAILS: (name: string) => `/brands/${encodeURIComponent(name)}`,
  ORDERS: '/orders',
  ORDER_DETAILS: (id: string) => `/orders/${id}`,
  ORDER_PAYMENT: (id: string) => `/orders/${id}/pay`,
  USER_ORDERS: (email: string) => `/users/${encodeURIComponent(email)}/orders`,
  BLOCKCHAIN: {
    CONFIG: '/blockchain/config',
    BALANCE: (address: string) => `/blockchain/usdt/balance/${address}`,
    VERIFY_PAYMENT: '/blockchain/verify-payment',
    TRANSACTION: (hash: string) => `/blockchain/transaction/${hash}`,
    GAS_PRICE: '/blockchain/gas-price',
    LATEST_BLOCK: '/blockchain/block/latest',
  },
  STATS: '/stats',
  HEALTH: '/health',
};