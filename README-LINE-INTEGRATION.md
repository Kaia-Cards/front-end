# KaiaCards LINE Integration - Technical Documentation

## Architecture Overview

The KaiaCards platform implements a comprehensive LINE ecosystem integration that transforms the traditional web-based gift card marketplace into a native LINE Mini App experience. This integration leverages LINE's LIFF (LINE Front-end Framework) SDK to provide seamless authentication, payment flows, messaging capabilities, and social features.

## Core Integration Components

### 1. LINE LIFF Framework Implementation

**Framework**: LINE Front-end Framework v2.27.2
**Application Type**: Standalone LIFF App
**LIFF ID**: `2006555488-W5NlAv2o`

The LIFF framework serves as the foundational layer for LINE integration, providing:

- **WebView Container Management**: Handles the transition between external browsers and LINE's internal WebView
- **Authentication Context**: Manages user sessions and OAuth flow within LINE's ecosystem
- **Native API Bridge**: Provides JavaScript APIs to access LINE-specific functionalities

```typescript
class LineService {
  private isInitialized = false;
  private liffId = '2006555488-W5NlAv2o';

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    await liff.init({ liffId: this.liffId });
    this.isInitialized = true;
  }
}
```

### 2. Authentication & User Profile Management

**OAuth Flow**: LINE Login API integration
**Profile API**: LINE Profile API for user data retrieval
**Session Management**: Persistent authentication state

The authentication system implements a dual-wallet approach where LINE user profiles are mapped to blockchain wallet addresses:

```typescript
interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

async login(): Promise<LineProfile> {
  await this.initialize();
  if (!liff.isLoggedIn()) {
    liff.login();
    throw new Error('Redirecting to LINE login');
  }
  return await this.getProfile();
}
```

**Technical Implementation Details**:
- LINE User ID serves as the primary wallet identifier
- Profile data is cached locally for performance optimization
- Automatic re-authentication on app initialization
- Graceful fallback for non-LINE environments

### 3. LINE Messaging Integration

**Message Types Implemented**:
- **Flex Messages**: Rich, interactive card-based notifications
- **Text Messages**: Simple status updates and confirmations
- **Share Target Picker**: Social sharing functionality

#### Purchase Confirmation Flow

```typescript
async sendPurchaseConfirmation(purchase: LinePurchaseNotification): Promise<void> {
  const message: LineFlexMessage = {
    type: 'flex',
    altText: `Gift Card Purchase Confirmation - ${purchase.shopName}`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [{
          type: 'text',
          text: '🎁 Purchase Confirmed',
          weight: 'bold',
          color: '#FFFFFF',
          size: 'lg'
        }],
        backgroundColor: '#7c3aed'
      }
      // ... complex flex structure
    }
  };
  await liff.sendMessages([message]);
}
```

**Message Routing Architecture**:
- **Transaction Lifecycle**: Messages triggered by blockchain events
- **Status Updates**: Real-time notifications for order state changes
- **Rich Media**: Embedded buttons for app navigation and actions

### 4. LINE Pay Integration

**Payment Gateway**: LINE Pay API v3
**Currency Support**: USD, KRW (with USDT bridge)
**Transaction Flow**: Hybrid fiat-crypto payment system

The LINE Pay integration provides an alternative payment method that bridges traditional payment systems with blockchain transactions:

```typescript
async requestLinePayment(amount: number, currency: string = 'USD'): Promise<void> {
  if (!liff.isInClient()) {
    throw new Error('LINE Pay is only available in LINE app');
  }

  await liff.sendMessages([{
    type: 'text',
    text: `💳 Payment Request: ${amount} ${currency}\n\nPlease complete your payment to continue with your gift card purchase.`
  }]);
}
```

**Technical Architecture**:
- **Dual Payment Rails**: LINE Pay for fiat, Kaia blockchain for crypto
- **Environment Detection**: Automatic selection based on LINE app context
- **Fallback Mechanisms**: Graceful degradation to crypto-only payments

### 5. Rich Menu Implementation

**Menu Configuration**: 2500x1686 pixel rich menu layout
**Action Types**: URI actions, message actions, postback actions
**Navigation Flow**: Deep-linking to specific app sections

```typescript
async setupRichMenu(): Promise<void> {
  const richMenuData = {
    size: { width: 2500, height: 1686 },
    selected: true,
    areas: [
      {
        bounds: { x: 0, y: 0, width: 833, height: 843 },
        action: { type: 'uri', uri: window.location.origin }
      },
      {
        bounds: { x: 833, y: 0, width: 834, height: 843 },
        action: { type: 'uri', uri: `${window.location.origin}#orders` }
      }
      // ... additional menu areas
    ]
  };
}
```

**Menu Architecture**:
- **Grid Layout**: 5-section menu for primary navigation
- **Deep Linking**: Direct navigation to app sections
- **Context-Aware Actions**: Different menus for authenticated users

## Blockchain Integration Layer

### Kaia Network Integration

**Network**: Kaia Blockchain (formerly Klaytn)
**Token Standard**: KIP-7 (USDT)
**Contract Architecture**: Smart contract-based gift card tokenization

The LINE integration seamlessly bridges Web2 UX with Web3 infrastructure:

```typescript
interface WalletInfo {
  address: string;    // LINE User ID or blockchain address
  balance: string;    // USDT balance
  network: string;    // 'LINE' or 'Kaia'
}
```

**Technical Implementation**:
- **Dual Address System**: LINE User IDs mapped to blockchain addresses
- **Transaction Bridging**: LINE Pay transactions trigger blockchain events
- **State Synchronization**: Real-time sync between LINE and blockchain states

### Smart Contract Integration

**Contract Functions**:
- `purchaseGiftCard(shopId, amount)`: Initiates gift card purchase
- `confirmDelivery(orderId)`: Confirms gift card delivery
- `getOrderStatus(orderId)`: Retrieves order information

**Event Listening**:
```typescript
contractService.on('PurchaseConfirmed', async (event) => {
  if (lineProfile) {
    await lineIntegration.sendPurchaseConfirmation({
      orderId: event.orderId,
      shopName: event.shopName,
      amount: event.amount,
      price: event.price
    });
  }
});
```

## Message Flow Architecture

### Purchase Flow Messaging

1. **Initiation**: Welcome message with app introduction
2. **Confirmation**: Rich flex message with purchase details
3. **Processing**: Status updates during blockchain confirmation
4. **Delivery**: Gift card code delivery with secure formatting
5. **Completion**: Final confirmation and social sharing options

### Error Handling & Fallbacks

**Network Failures**: Graceful degradation to manual transaction hash entry
**LINE API Limits**: Message queuing and rate limiting
**Authentication Failures**: Automatic re-authentication flows

```typescript
try {
  await lineIntegration.sendPurchaseConfirmation(purchase);
} catch (error) {
  console.error('LINE messaging failed:', error);
  // Fallback to email notifications
  await emailService.sendPurchaseConfirmation(purchase);
}
```

## Performance Optimizations

### Client-Side Optimizations

**Lazy Loading**: LINE SDK loaded only when required
**State Caching**: User profiles and preferences cached locally
**API Batching**: Multiple LINE API calls batched for efficiency

### Server-Side Integration

**Webhook Endpoints**: Real-time order status updates
**Message Queuing**: Asynchronous message delivery
**Rate Limiting**: Compliance with LINE API limits

## Security Considerations

### Data Privacy

**User Data**: LINE profile data handled according to LINE Privacy Policy
**Transaction Data**: Encrypted storage of sensitive payment information
**Session Management**: Secure token handling and rotation

### API Security

**LIFF Verification**: Server-side LIFF ID token validation
**CORS Configuration**: Restricted origin policies
**Rate Limiting**: Protection against API abuse

## Deployment Architecture

### Environment Configuration

**Development**: Local LIFF testing with ngrok tunneling
**Staging**: LIFF app configured for staging environment
**Production**: Production LIFF app with custom domain

### Monitoring & Analytics

**LINE Analytics**: Built-in LIFF usage analytics
**Custom Events**: Transaction and engagement tracking
**Error Monitoring**: Comprehensive error logging and alerting

## Future Enhancement Roadmap

### Planned Features

1. **LINE Beacon Integration**: Location-based promotions
2. **LINE Things**: IoT device integration for physical gift cards
3. **LINE Bot API**: Automated customer service chatbot
4. **Account Link**: Advanced user account management

### Technical Debt & Improvements

1. **Message Template Engine**: Dynamic message generation
2. **Offline Support**: Progressive Web App capabilities
3. **Advanced Analytics**: User behavior tracking and insights
4. **Internationalization**: Multi-language LINE message support

## Development Guidelines

### Testing Strategy

**Unit Tests**: LINE service layer testing with mocked LIFF SDK
**Integration Tests**: End-to-end flows with LINE Simulator
**User Acceptance Testing**: Real device testing in LINE app

### Code Organization

```
src/
├── services/
│   ├── lineService.ts          # Core LIFF SDK wrapper
│   ├── lineIntegration.ts      # Business logic integration
│   └── contractService.ts      # Blockchain integration
├── types/
│   └── line.ts                 # LINE-specific type definitions
└── utils/
    └── lineHelpers.ts          # Utility functions
```

This technical implementation represents a comprehensive integration between LINE's ecosystem and blockchain-based commerce, providing users with familiar Web2 UX while leveraging Web3 infrastructure for enhanced security and transparency.