# Kaia Cards Mini Dapp

A mobile-optimized LINE Mini Dapp for purchasing discounted gift cards using cryptocurrency on the Kaia blockchain.

## Features

- **LINE Integration**: Login with LINE account for seamless authentication
- **Mobile-First Design**: Optimized for mobile devices and LINE app
- **Gift Card Marketplace**: Browse and purchase gift cards from various brands
- **Crypto Payments**: Pay with Kaia blockchain using connected wallet
- **Order Management**: Track order history and view gift card codes
- **User Profile**: Manage settings and view purchase statistics

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.mini-dapp` file in the root directory:

```env
VITE_LIFF_ID=YOUR_LINE_LIFF_ID
VITE_KAIA_CLIENT_ID=YOUR_KAIA_CLIENT_ID
VITE_KAIA_CHAIN_ID=8217
VITE_API_URL=http://localhost:3001
VITE_PAYMENT_ADDRESS=YOUR_PAYMENT_ADDRESS
```

### 3. LINE LIFF Setup

1. Go to [LINE Developers Console](https://developers.line.biz/console/)
2. Create a new LIFF app
3. Set the endpoint URL to your deployment URL
4. Copy the LIFF ID to your `.env.mini-dapp` file

### 4. Kaia Wallet Setup

1. Register your dapp with Kaia Portal SDK
2. Get your client ID
3. Add it to your environment configuration

## Development

Run the mini dapp in development mode:

```bash
npm run dev:mini
```

The app will be available at `http://localhost:3100`

## Building for Production

```bash
npm run build:mini
```

The production build will be in the `dist-mini` directory.

## Deployment

### Deploy to LINE Mini Dapp

1. Build the production version
2. Deploy to a HTTPS endpoint
3. Update the LIFF endpoint URL in LINE Developers Console

## Architecture

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Blockchain**: Ethers.js + Kaia Portal SDK
- **Authentication**: LINE LIFF SDK

## Pages

- **HomePage**: Brand listing and search
- **BrandPage**: Gift card denominations for selected brand
- **CheckoutPage**: Order review and email input
- **PaymentPage**: Crypto payment processing
- **ProfilePage**: User profile and settings
- **OrdersPage**: Order history and gift card codes

## Key Differences from Kilolend

While inspired by Kilolend's architecture, this implementation:
- Uses Vite instead of Next.js for faster development
- Maintains compatibility with existing Kaia Cards infrastructure
- Focuses on gift card marketplace instead of lending
- Simplified wallet integration for LINE Mini Dapp environment