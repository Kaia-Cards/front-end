export const MINI_DAPP_CONFIG = {
  liffId: process.env.REACT_APP_LIFF_ID || '',
  clientId: process.env.REACT_APP_MINI_DAPP_CLIENT_ID || '',
  clientSecret: process.env.REACT_APP_MINI_DAPP_CLIENT_SECRET || '',
  testMode: true,
  reownProjectId: process.env.REACT_APP_REOWN_PROJECT_ID || ''
};

export const SUPPORTED_LANGUAGES = ['en', 'ja', 'ko'];
export const DEFAULT_LANGUAGE = 'en';

export const PAYMENT_CONFIG = {
  supportedTokens: ['USDT'],
  network: 'kaia',
  testMode: true
};