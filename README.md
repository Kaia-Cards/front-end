# KaiaCards Frontend - Digital Gift Card Marketplace

## Application Overview

KaiaCards is a comprehensive digital gift card marketplace that bridges traditional e-commerce with blockchain technology and LINE ecosystem integration. The platform enables users to purchase gift cards from Asian and global brands using USDT payments on the Kaia blockchain network, with seamless LINE integration for enhanced user experience.

## Project Architecture

```
front-end/
├── public/
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── WalletConnect/           # Blockchain wallet integration
│   │   │   ├── index.tsx
│   │   │   └── WalletConnect.css
│   │   ├── BrandCard/              # Individual brand display
│   │   ├── CartModal/              # Shopping cart interface
│   │   ├── OrderCard/              # Order history display
│   │   └── PaymentModal/           # Payment processing UI
│   ├── contracts/
│   │   ├── contractService.ts      # Smart contract interactions
│   │   ├── contractConfig.ts       # Contract addresses and ABIs
│   │   └── abi/
│   │       ├── GiftCardShop.json   # Main contract ABI
│   │       └── USDT.json           # USDT token ABI
│   ├── services/
│   │   ├── lineService.ts          # LINE LIFF SDK wrapper
│   │   ├── lineIntegration.ts      # LINE business logic
│   │   ├── apiService.ts           # Backend API communication
│   │   └── walletService.ts        # Wallet connection management
│   ├── hooks/
│   │   ├── useWallet.ts            # Wallet state management
│   │   ├── useContract.ts          # Contract interaction hooks
│   │   └── useLineAuth.ts          # LINE authentication
│   ├── styles/
│   │   ├── App.css                 # Main application styles
│   │   ├── components/             # Component-specific styles
│   │   └── globals.css             # Global style definitions
│   ├── mini-dapp/
│   │   ├── MiniApp.tsx             # LINE Mini-App entry point
│   │   ├── main.tsx                # Mini-App initialization
│   │   └── styles/
│   │       └── mini-app.css        # LINE-optimized styles
│   ├── translations/
│   │   ├── en.json                 # English translations
│   │   ├── ko.json                 # Korean translations
│   │   └── ja.json                 # Japanese translations
│   ├── App.tsx                     # Main application component
│   ├── App.css                     # Application-wide styles
│   ├── main.tsx                    # Standard web entry point
│   └── types/
│       ├── index.ts                # Core type definitions
│       ├── contracts.ts            # Contract-related types
│       └── line.ts                 # LINE SDK types
├── config/
│   ├── constants.ts                # Application constants
│   ├── networks.ts                 # Blockchain network configs
│   └── environment.ts              # Environment variables
├── package.json
├── vite.config.ts                  # Standard build configuration
├── vite.config.mini.ts             # Mini-App build configuration
├── tsconfig.json
├── Dockerfile
├── nginx.conf
└── vercel.json
```

## Brand Portfolio and Categories

### Supported Brand Categories

**E-commerce Platforms**
- Rakuten: Japan's largest e-commerce platform with cashback rewards
- Shopee: Southeast Asia's leading online shopping marketplace
- Coupang: South Korea's largest online marketplace with fast delivery

**Travel and Hospitality**
- Klook: Asia's leading platform for experiences and travel bookings
- Agoda: Premier accommodation booking platform in Asia
- Trip.com: Global travel platform for flights, hotels, and packages
- AirAsia: Low-cost airline with extensive Asian network coverage

**Testnet Integration**
- Kairos Testnet: Development and demonstration environment for jury testing

### Brand Integration Process

**Brand Onboarding Workflow**
1. **Brand Registration**: Partner verification and contract negotiation
2. **API Integration**: Gift card inventory and redemption system connection
3. **Logo and Asset Upload**: Brand identity integration into marketplace
4. **Discount Configuration**: Pricing strategy and promotional setup
5. **Testing Phase**: Testnet validation before mainnet deployment
6. **Live Deployment**: Production release with monitoring setup

**Brand Data Structure**
```typescript
interface Brand {
  id: string;
  name: string;
  logo: string;
  category: 'E-commerce' | 'Travel' | 'Testnet';
  country: string;
  description: string;
  discount: number;        // Percentage discount offered
  minValue: number;        // Minimum gift card value
  maxValue: number;        // Maximum gift card value
  available: boolean;      // Current availability status
  cardCount: number;       // Available inventory count
}
```

## User Journey and Process Flow

### Purchase Flow Architecture

**Step 1: Brand Discovery**
- User browses available brands by category
- Search functionality with real-time filtering
- Brand details with discount information display
- Category-based navigation (All, E-commerce, Travel, Testnet)

**Step 2: Authentication Options**
- **LINE Integration**: Seamless login through LINE LIFF
- **Wallet Connection**: Direct blockchain wallet connection
- **Dual Authentication**: Combined LINE and wallet authentication

**Step 3: Gift Card Selection**
- Available denominations display per brand
- Real-time pricing with discount calculations
- Stock availability checking
- Add to cart functionality

**Step 4: Payment Processing**
- **LINE Pay Integration**: Fiat payment option for LINE users
- **USDT Payments**: Direct blockchain transactions on Kaia network
- **Payment Method Selection**: Dynamic options based on user authentication

**Step 5: Order Fulfillment**
- Smart contract execution for blockchain payments
- Real-time transaction monitoring
- Gift card code generation and delivery
- LINE message notifications for order updates

### User Interface Components

**Navigation System**
- Header with logo, search bar, and user actions
- Category-based filtering navigation
- Mobile-responsive hamburger menu
- Context-aware navigation based on user state

**Shopping Experience**
- Grid-based brand display with hover effects
- Shopping cart with persistent state
- Real-time inventory updates
- Progressive web app capabilities

**Payment Interface**
- QR code generation for USDT payments
- Transaction hash input for payment confirmation
- LINE Pay integration button for authenticated users
- Payment status tracking with real-time updates

**Order Management**
- Complete order history with status tracking
- Gift card code display with copy functionality
- Order sharing capabilities through LINE
- Status updates: pending, paid, delivered, received

## Technology Stack Implementation

### Frontend Framework
- **React 18.2.0**: Component-based architecture with hooks
- **TypeScript 5.3.0**: Type-safe development with strict checking
- **Vite 5.4.20**: Modern build tool with HMR and ES modules

### Blockchain Integration
- **Ethers.js 6.9.0**: Ethereum-compatible library for Kaia network
- **Wagmi 2.5.0**: React hooks for wallet and contract interactions
- **Kaia Network**: Target blockchain for USDT transactions

### LINE Platform Integration
- **LINE LIFF SDK 2.27.2**: Frontend framework for LINE Mini Apps
- **LINE Bot SDK 10.2.0**: Server-side messaging and rich menu setup
- **LINE Pay API**: Payment processing for fiat transactions

### State Management
- **React Context**: Global state for user authentication and cart
- **Local Storage**: Persistent data for user preferences
- **Session Storage**: Temporary data for current session

## Development and Deployment

### Build Configurations

**Standard Web Application**
```bash
npm run dev          # Development server on localhost:3001
npm run build        # Production build for web deployment
npm run preview      # Preview production build locally
```

**LINE Mini-App Version**
```bash
npm run dev:mini     # Development with LINE-specific optimizations
npm run build:mini   # Production build optimized for LINE WebView
```

### Environment Setup

**Development Environment**
```env
VITE_API_BASE=http://localhost:3001/api
VITE_NETWORK=testnet
VITE_LIFF_ID=2006555488-W5NlAv2o
VITE_CONTRACT_ADDRESS=0x8b4D2C4c2c5C5F5F5F5F5F5F5F5F5F5F5F5F5F5F
```

**Production Environment**
```env
VITE_API_BASE=https://api.kaiacards.com/api
VITE_NETWORK=mainnet
VITE_LIFF_ID=2006555488-W5NlAv2o
VITE_CONTRACT_ADDRESS=0x742d35Cc6b56b3b82A86c87B14a5AA8d27C5B5B5
```

### Deployment Pipeline

**Containerized Deployment**
- Docker containerization with Nginx reverse proxy
- Multi-stage builds for optimized production images
- Environment-specific configuration injection

**Vercel Deployment**
- Automatic deployment from main branch
- Environment variable management
- Preview deployments for pull requests

## Feature Implementation Details

### Wallet Integration Process

**Supported Wallets**
- MetaMask: Browser extension and mobile app
- WalletConnect: Protocol for mobile wallet connections
- Kaikas: Native Kaia network wallet
- LINE Wallet: Integrated through LINE Pay

**Connection Flow**
1. User clicks wallet connect button
2. Wallet selection modal appears
3. External wallet app opens for authorization
4. Connection confirmation and address retrieval
5. Network validation and switching if required
6. Balance checking and display

### LINE Integration Features

**Authentication Flow**
1. LINE LIFF initialization on app load
2. User authentication check
3. Profile data retrieval (display name, user ID)
4. Wallet mapping to LINE user ID
5. Rich menu setup for navigation

**Messaging Integration**
- Purchase confirmation with rich flex messages
- Order status updates with actionable buttons
- Gift card delivery notifications with codes
- Social sharing functionality through share target picker

**Payment Integration**
- LINE Pay option display for authenticated users
- Payment request generation with order details
- Transaction status monitoring
- Fallback to blockchain payments

### Order Management System

**Order Lifecycle**
1. **Pending**: Order created, awaiting payment
2. **Paid**: Payment confirmed on blockchain
3. **Delivered**: Gift card code generated and sent
4. **Received**: User confirms receipt of gift card

**Status Tracking**
- Real-time updates through WebSocket connections
- Email notifications for critical status changes
- LINE message notifications for authenticated users
- Order history with searchable interface

### Security Implementation

**Frontend Security Measures**
- Input validation and sanitization
- XSS protection through React's built-in mechanisms
- CSRF protection for form submissions
- Secure storage of sensitive data

**Blockchain Security**
- Transaction signing through connected wallets
- Smart contract interaction validation
- Gas estimation and limit enforcement
- Network verification before transactions

This frontend implementation provides a comprehensive digital gift card marketplace with seamless blockchain and LINE ecosystem integration, optimized for Asian markets with global scalability.