// Contract configuration for KaiaGiftCardMarketplace
export const CONTRACT_CONFIG = {
  // Contract address 
  address: process.env.REACT_APP_CONTRACT_ADDRESS || '0xe47BcF7103bBc8d1DDD75f2Ab6813da050443D2c',
  
  // Payment token address (testnet token)
  paymentTokenAddress: process.env.REACT_APP_PAYMENT_TOKEN_ADDRESS || '0x1577dE52bF5D6a7f455FC19d87c728d4bE3e1377',
  
  // Chain configuration for Kairos testnet
  chainId: 1001, // Kairos testnet
  
  // RPC URL for Kairos testnet
  rpcUrl: 'https://public-en.kairos.node.kaia.io',
  
  // Shop ID mapping from frontend to contract
  shopIdMapping: {
    'rakuten': 'rakuten',
    'shopee': 'shopee', 
    'coupang': 'coupang',
    'klook': 'klook',
    'agoda': 'agoda',
    'kairos': 'testshop' // Special mapping for testnet
  } as const,
  
  // Amount mapping from frontend to contract valid amounts
  // Frontend: [10, 50, 100, 200, 500] -> Contract: [5, 10, 25, 50, 100]
  amountMapping: {
    10: 10,
    50: 50, 
    100: 100,
    200: 100, // Map 200 to 100 (closest valid amount)
    500: 100  // Map 500 to 100 (closest valid amount)
  } as const
};

// ERC20 Token ABI for approvals
export const ERC20_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Contract ABI for buyGiftCard and other functions we need
export const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "paymentToken",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "shopId", "type": "string" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "buyGiftCard",
    "outputs": [
      { "internalType": "bytes32", "name": "", "type": "bytes32" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "purchaseId", "type": "bytes32" }
    ],
    "name": "confirmGiftCardDelivery", 
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "purchaseId", "type": "bytes32" }
    ],
    "name": "getPurchaseDetails",
    "outputs": [
      { "internalType": "address", "name": "buyer", "type": "address" },
      { "internalType": "string", "name": "shopId", "type": "string" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "tokenAmount", "type": "uint256" },
      { "internalType": "uint8", "name": "status", "type": "uint8" },
      { "internalType": "uint256", "name": "createdAt", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "shopId", "type": "string" }
    ],
    "name": "getShopDetails",
    "outputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "bool", "name": "isActive", "type": "bool" },
      { "internalType": "uint256", "name": "addedAt", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "purchaseId", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "buyer", "type": "address" },
      { "indexed": true, "internalType": "string", "name": "shopId", "type": "string" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "tokenAmount", "type": "uint256" }
    ],
    "name": "GiftCardPurchased",
    "type": "event"
  }
] as const;

export type ShopId = keyof typeof CONTRACT_CONFIG.shopIdMapping;
export type ContractShopId = typeof CONTRACT_CONFIG.shopIdMapping[ShopId];
export type FrontendAmount = keyof typeof CONTRACT_CONFIG.amountMapping;
export type ContractAmount = typeof CONTRACT_CONFIG.amountMapping[FrontendAmount];