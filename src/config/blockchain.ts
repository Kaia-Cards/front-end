const isMainnet = process.env.NODE_ENV === 'production';

export const BLOCKCHAIN_CONFIG = {
  MAINNET: {
    chainId: parseInt(process.env.REACT_APP_KAIA_CHAIN_ID_MAINNET || '8217'),
    name: 'Kaia Mainnet',
    rpcUrl: process.env.REACT_APP_KAIA_RPC_URL_MAINNET || 'https://public-en.node.kaia.io',
    explorerUrl: process.env.REACT_APP_EXPLORER_URL_MAINNET || 'https://kaiascan.io',
    usdtAddress: process.env.REACT_APP_USDT_ADDRESS_MAINNET || '0xd077a400968890eacc75cdc901f0356c943e4fdb',
    marketplaceContract: process.env.REACT_APP_MARKETPLACE_CONTRACT_MAINNET || '',
  },
  TESTNET: {
    chainId: parseInt(process.env.REACT_APP_KAIA_CHAIN_ID_TESTNET || '1001'),
    name: 'Kaia Testnet (Kairos)',
    rpcUrl: process.env.REACT_APP_KAIA_RPC_URL_TESTNET || 'https://public-en-kairos.node.kaia.io',
    explorerUrl: process.env.REACT_APP_EXPLORER_URL_TESTNET || 'https://kairos.kaiascan.io',
    usdtAddress: process.env.REACT_APP_USDT_ADDRESS_TESTNET || '0x5c74070fdea071359b86082bd9f9b3deaafbe32b',
    marketplaceContract: process.env.REACT_APP_MARKETPLACE_CONTRACT_TESTNET || '',
  }
};

export const CURRENT_NETWORK = isMainnet ? BLOCKCHAIN_CONFIG.MAINNET : BLOCKCHAIN_CONFIG.TESTNET;

export const USDT_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

export const MARKETPLACE_ABI = [
  'function createOrder(string memory brandName, uint256 cardValue) external returns (bytes32)',
  'function payOrder(bytes32 orderId) external',
  'function getOrderDetails(bytes32 orderId) external view returns (address buyer, string memory brandName, uint256 cardValue, uint256 usdtAmount, uint8 status, uint256 createdAt, string memory deliveryData)',
  'function getUserOrders(address user) external view returns (bytes32[] memory)',
  'function getBrandList() external view returns (string[] memory)',
  'function brands(string memory) external view returns (string memory name, string memory category, string memory country, uint256 discount, uint256 minValue, uint256 maxValue, bool isActive, address supplier)',
  'event OrderCreated(bytes32 indexed orderId, address indexed buyer, string brandName, uint256 cardValue, uint256 usdtAmount)',
  'event PaymentReceived(bytes32 indexed orderId, address indexed buyer, uint256 amount, bytes32 txHash)',
  'event OrderFulfilled(bytes32 indexed orderId, bytes32 fulfillmentHash)',
];

export const ORDER_STATUS = {
  0: 'Pending',
  1: 'Paid',
  2: 'Processing',
  3: 'Delivered',
  4: 'Refunded',
  5: 'Cancelled',
  6: 'Expired',
};

export const SUPPORTED_WALLETS = [
  'MetaMask',
  'WalletConnect',
  'Coinbase Wallet',
  'Trust Wallet',
  'Rainbow',
];

export const TRANSACTION_SETTINGS = {
  GAS_LIMIT: 300000,
  MAX_FEE_PER_GAS: 250000000000,
  MAX_PRIORITY_FEE_PER_GAS: 250000000000,
  CONFIRMATION_BLOCKS: 3,
};