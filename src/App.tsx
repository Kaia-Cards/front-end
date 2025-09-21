import React, { useState, useEffect } from 'react';
import './App.css';
import { WalletConnect } from '../components/WalletConnect';
import { contractService } from './contracts/contractService';
import { ShopId, FrontendAmount } from './contracts/contractConfig';
import { lineService, LineProfile } from './services/lineService';
import { lineIntegration, LinePurchaseNotification } from './services/lineIntegration';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Brand {
  id: string;
  name: string;
  logo: string;
  category: string;
  country: string;
  description: string;
  discount: number;
  minValue: number;
  maxValue: number;
  available: boolean;
  cardCount: number;
}

interface GiftCard {
  id: string;
  value: number;
  price: number;
  stock_quantity: number;
  brand_name: string;
  discount_rate: number;
}

interface Order {
  orderId: string;
  shopId: string;
  shopName: string;
  shopLogo: string;
  amount: number;
  price: number;
  status: 'pending' | 'paid' | 'delivered' | 'received';
  createdAt: string;
  tx_hash?: string;
  card_code?: string;
}

interface WalletInfo {
  address: string;
  balance: string;
  network: string;
}

interface Shop {
  id: string;
  name: string;
  logo: string;
  description: string;
  category: string;
}

const SHOPS: Shop[] = [
  {
    id: 'rakuten',
    name: 'Rakuten',
    logo: 'https://cdn.worldvectorlogo.com/logos/rakuten-1.svg',
    description: 'Japan\'s largest e-commerce platform with cashback rewards',
    category: 'E-commerce'
  },
  {
    id: 'shopee',
    name: 'Shopee',
    logo: 'https://cdn.worldvectorlogo.com/logos/shopee-1.svg',
    description: 'Southeast Asia\'s leading online shopping platform',
    category: 'E-commerce'
  },
  {
    id: 'coupang',
    name: 'Coupang',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Coupang_logo.svg',
    description: 'South Korea\'s largest online marketplace with fast delivery',
    category: 'E-commerce'
  },
  {
    id: 'klook',
    name: 'Klook',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/71/Klook_logo_%282023%29.svg',
    description: 'Asia\'s leading platform for experiences and travel',
    category: 'Travel'
  },
  {
    id: 'agoda',
    name: 'Agoda',
    logo: 'https://cdn.worldvectorlogo.com/logos/agoda-1.svg',
    description: 'Premier accommodation booking platform in Asia',
    category: 'Travel'
  },
  {
    id: 'kairos',
    name: 'Kairos Testnet',
    logo: 'https://cdn.worldvectorlogo.com/logos/kaia.svg',
    description: '🧪 Hackathon Testing Section - For Jury Demo on Kairos Testnet',
    category: 'Testnet'
  },
  {
    id: 'tripcom',
    name: 'Trip.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Trip.com_logo.svg',
    description: 'Global travel platform for flights, hotels, and travel packages',
    category: 'Travel'
  },
  {
    id: 'airasia',
    name: 'AirAsia',
    logo: 'https://cdn.worldvectorlogo.com/logos/airasia.svg',
    description: 'Asia\'s leading low-cost airline and travel services',
    category: 'Travel'
  }
];

const GIFT_CARD_AMOUNTS = [10, 50, 100, 200, 500];

interface CartItem {
  id: string;
  shopId: string;
  shopName: string;
  shopLogo: string;
  amount: number;
  price: number;
}

function App() {
  const [currentView, setCurrentView] = useState<'shop' | 'brand' | 'checkout' | 'payment' | 'orders' | 'profile' | 'cart' | 'rakuten' | 'shopee' | 'coupang' | 'klook' | 'agoda' | 'kairos' | 'tripcom' | 'airasia'>('shop');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [contractInitialized, setContractInitialized] = useState(false);
  const [lineProfile, setLineProfile] = useState<LineProfile | null>(null);
  const [isLineInitialized, setIsLineInitialized] = useState(false);
  const [pendingPurchases, setPendingPurchases] = useState<Map<string, string>>(new Map());
  const [showPurchaseSuccessModal, setShowPurchaseSuccessModal] = useState(false);
  const [successPurchaseData, setSuccessPurchaseData] = useState<{purchaseId: string, shopName: string, amount: number} | null>(null);
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const [showDeliveryConfirmedModal, setShowDeliveryConfirmedModal] = useState(false);
  const [confirmedOrderData, setConfirmedOrderData] = useState<{shopName: string, amount: number} | null>(null);
  const [showAddedToCartModal, setShowAddedToCartModal] = useState(false);
  const [addedToCartData, setAddedToCartData] = useState<{shopName: string, amount: number} | null>(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    const initializeLine = async () => {
      try {
        await lineService.initialize();
        setIsLineInitialized(true);

        if (lineService.isLoggedIn()) {
          const profile = await lineService.getProfile();
          setLineProfile(profile);
          setWalletInfo({
            address: profile.userId,
            balance: '0',
            network: 'LINE'
          });
        }
      } catch (error) {
        console.error('LINE initialization failed:', error);
      }
    };

    initializeLine();
  }, []);

  const fetchBrands = async () => {
    if (!API_BASE) {
      console.log('No API URL configured, using fallback data');
      setBrands(SHOPS);
      return;
    }

    try {
      console.log('Fetching brands from:', `${API_BASE}/brands`);
      const response = await fetch(`${API_BASE}/brands`);
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Brands data:', data);
      setBrands(data);
      console.log(`Loaded ${data.length} brands`);
    } catch (error) {
      console.error('Error fetching brands:', error);
      console.log('Using fallback SHOPS data');
      setBrands(SHOPS);
    }
  };

  const selectBrand = async (brand: Brand) => {
    setSelectedBrand(brand);
    setCurrentView('brand');
    
    try {
      const response = await fetch(`${API_BASE}/brands/${brand.name}`);
      const data = await response.json();
      
      // Convert backend response to frontend format
      if (data.denominations) {
        const cards = data.denominations.map((value: number) => ({
          id: `${brand.id}_${value}`,
          value: value,
          price: value * (1 - brand.discount / 100),
          stock_quantity: 50, // Default stock
          brand_name: brand.name,
          discount_rate: brand.discount
        }));
        setGiftCards(cards);
        console.log(`Loaded ${cards.length} gift cards for ${brand.name}`);
      } else {
        setGiftCards([]);
      }
    } catch (error) {
      console.error('Error fetching gift cards:', error);
    }
  };

  const initiateCheckout = (card: GiftCard) => {
    setSelectedCard(card);
    setCurrentView('checkout');
  };

  const processOrder = async () => {
    if (!selectedCard || !selectedBrand || !userEmail) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: selectedBrand.name,
          value: selectedCard.value,
          email: userEmail
        })
      });
      
      const data = await response.json();
      
      if (data.orderId) {
        setCurrentOrder(data);
        setCurrentView('payment');
        console.log(`Order created: ${data.orderId}`);
      }
    } catch (error) {
      console.error('Error processing order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentConfirmed = async (txHash: string) => {
    if (!currentOrder) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/order/${currentOrder.orderId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash })
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setCurrentOrder(updatedOrder);

        if (lineProfile) {
          const purchaseNotification: LinePurchaseNotification = {
            orderId: updatedOrder.orderId,
            shopName: updatedOrder.brand || 'Gift Card',
            amount: updatedOrder.value || 0,
            price: updatedOrder.price || 0
          };
          await lineIntegration.sendPurchaseConfirmation(purchaseNotification);
        }

        alert('Payment confirmed! Your gift card code will be delivered shortly.');
        setCurrentView('orders');
        fetchUserOrders();
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    if (!userEmail) return;
    
    try {
      const response = await fetch(`${API_BASE}/user/${userEmail}/orders`);
      const data = await response.json();
      setUserOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleWalletChange = async (wallet: WalletInfo | null) => {
    setWalletInfo(wallet);

    if (wallet && !contractInitialized) {
      try {
        await initializeContract();
      } catch (error) {
        console.error('Failed to initialize contract on wallet connect:', error);
      }
    }
  };

  const handleLineAuth = async () => {
    try {
      const profile = await lineService.login();
      setLineProfile(profile);
      setWalletInfo({
        address: profile.userId,
        balance: '0',
        network: 'LINE'
      });

      await lineIntegration.sendWelcomeMessage();
      await lineIntegration.setupRichMenu();

      console.log('LINE authentication successful:', profile.displayName);
    } catch (error) {
      console.error('LINE authentication failed:', error);
      if (error.message !== 'Redirecting to LINE login') {
        alert('Failed to authenticate with LINE. Please try again.');
      }
    }
  };

  const handleLineShare = async () => {
    try {
      await lineService.shareTargetPicker('Check out KaiaCards - Premium gift cards with crypto payments! 🎁💳');
    } catch (error) {
      console.error('LINE share failed:', error);
      alert('Failed to share to LINE. Please try again.');
    }
  };

  const addToCart = (shopId: string, amount: number) => {
    const shop = SHOPS.find(s => s.id === shopId);
    if (!shop) return;

    const cartItem: CartItem = {
      id: `${shopId}-${amount}-${Date.now()}`,
      shopId,
      shopName: shop.name,
      shopLogo: shop.logo,
      amount,
      price: amount // 1:1 ratio for USDT
    };

    setCartItems(prev => [...prev, cartItem]);
    setCartCount(prev => prev + 1);
    
    // Show success modal
    setAddedToCartData({
      shopName: shop.name,
      amount: amount
    });
    setShowAddedToCartModal(true);
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    setCartCount(prev => prev - 1);
  };

  const clearCart = () => {
    setCartItems([]);
    setCartCount(0);
  };

  const getTotalCartPrice = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  const createOrder = (shopId: string, amount: number) => {
    const shop = SHOPS.find(s => s.id === shopId);
    if (!shop) return;

    const newOrder: Order = {
      orderId: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      shopId,
      shopName: shop.name,
      shopLogo: shop.logo,
      amount,
      price: amount, // 1:1 ratio for USDT
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setUserOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], cardCode?: string) => {
    setUserOrders(prev =>
      prev.map(order =>
        order.orderId === orderId
          ? { ...order, status, card_code: cardCode || order.card_code }
          : order
      )
    );

    if (lineProfile && status === 'delivered') {
      const order = userOrders.find(o => o.orderId === orderId);
      if (order) {
        const deliveryNotification: LinePurchaseNotification = {
          orderId: order.orderId,
          shopName: order.shopName,
          amount: order.amount,
          price: order.price,
          cardCode: cardCode
        };
        await lineIntegration.sendCardDelivery(deliveryNotification);
      }
    }
  };


  const handleConfirmGiftCardReceived = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowConfirmModal(true);
  };

  const confirmGiftCardReceived = async () => {
    if (selectedOrderId) {
      try {
        // Get order details for the success modal
        const order = userOrders.find(o => o.orderId === selectedOrderId);
        
        // Call smart contract to confirm delivery
        if (contractInitialized) {
          await contractService.confirmGiftCardDelivery(selectedOrderId);
        }
        
        // Remove the order from the list since it's completed
        setUserOrders(prev => prev.filter(order => order.orderId !== selectedOrderId));
        setShowConfirmModal(false);
        setSelectedOrderId(null);
        
        // Show success modal instead of alert
        if (order) {
          setConfirmedOrderData({
            shopName: order.shopName,
            amount: order.amount
          });
          setShowDeliveryConfirmedModal(true);
        }
      } catch (error: any) {
        console.error('Failed to confirm delivery:', error);
        alert(`Failed to confirm delivery: ${error.message}`);
      }
    }
  };

  // Initialize contract when wallet is connected
  const initializeContract = async () => {
    try {
      await contractService.initialize();
      setContractInitialized(true);
      console.log('Contract service initialized successfully');
    } catch (error: any) {
      console.error('Failed to initialize contract:', error);
      alert(`Failed to connect to contract: ${error.message}`);
      setContractInitialized(false);
    }
  };

  // Handle buying gift card through smart contract
  const buyGiftCardOnChain = async (shopId: string, amount: number) => {
    try {
      if (!contractInitialized) {
        console.log('Contract not initialized, initializing now...');
        await initializeContract();
      }

      if (!contractInitialized) {
        throw new Error('Failed to initialize contract. Please try connecting your wallet again.');
      }

      setLoading(true);
      
      // Call the smart contract
      const purchaseId = await contractService.buyGiftCard(shopId as ShopId, amount as FrontendAmount);
      
      // Store the purchase ID for tracking
      const cartItemId = `${shopId}-${amount}`;
      setPendingPurchases(prev => new Map(prev).set(cartItemId, purchaseId));
      
      // Create order in frontend state with purchase ID
      const shop = SHOPS.find(s => s.id === shopId);
      if (shop) {
        const newOrder: Order = {
          orderId: purchaseId, // Use blockchain purchase ID
          shopId,
          shopName: shop.name,
          shopLogo: shop.logo,
          amount,
          price: amount,
          status: 'pending',
          createdAt: new Date().toISOString(),
          tx_hash: purchaseId // Store purchase ID as transaction hash
        };
        setUserOrders(prev => [newOrder, ...prev]);
      }

      return purchaseId;
    } catch (error: any) {
      console.error('Error buying gift card:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          brand.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || brand.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(brands.map(b => b.category)))];


  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <div className="container">
            <div className="header-top-content">
              <button className="mobile-menu-btn" onClick={() => setShowMobileMenu(!showMobileMenu)}>
                ☰
              </button>
              
              <div className="logo" onClick={() => setCurrentView('shop')}>
                <span className="logo-text">KAIA</span>
                <span className="logo-cards">CARDS</span>
              </div>
              
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search for gift cards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button className="search-btn">
                  <span>🔍</span>
                </button>
              </div>
              
              <div className="header-actions">
                <WalletConnect onWalletChange={handleWalletChange} translations={{}} />
                
                <div className="header-action" onClick={() => setCurrentView('profile')}>
                  <span className="action-icon">👤</span>
                  <span className="action-text">Account</span>
                </div>
                
                <div className="header-action" onClick={() => setCurrentView('orders')}>
                  <span className="action-icon">📦</span>
                  <span className="action-text">Orders</span>
                </div>
                
                <div className="header-action cart" onClick={() => setCurrentView('cart')}>
                  <span className="action-icon">🛒</span>
                  <span className="cart-count">{cartCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <nav className="nav-bar">
          <div className="container">
            <div className="nav-content">
              <div className="categories-nav">
                {categories.map(category => (
                  <button
                    key={category}
                    className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              <div className="nav-info">
                <span className="nav-info-item">
                  <span className="info-icon">⚡</span> Flash Delivery
                </span>
                <span className="nav-info-item">
                  <span className="info-icon">🔒</span> Safe Payment
                </span>
                <span className="nav-info-item">
                  <span className="info-icon">💰</span> Best Prices
                </span>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="main-content">
        <div className="container">
          {currentView === 'shop' && (
            <>
              <div className="shop-header">
                <div className="shop-header-content">
                  <div className="shop-hero">
                    <div className="shop-hero-left">
                      <h1 className="shop-title">Premium Digital Gift Cards</h1>
                      <p className="shop-tagline">Access thousands of gift cards from Asian global brands with Kaia USDT payments</p>
                      <div className="shop-highlights">
                        <div className="highlight-item">
                          <span className="highlight-icon">🔐</span>
                          <div className="highlight-text">
                            <strong>Kaia Blockchain</strong>
                            <span>USDT payments on Kaia network</span>
                          </div>
                        </div>
                        <div className="highlight-item">
                          <span className="highlight-icon">⚡</span>
                          <div className="highlight-text">
                            <strong>Flash Delivery</strong>
                            <span>Digital codes delivered within minutes</span>
                          </div>
                        </div>
                        <div className="highlight-item">
                          <span className="highlight-icon">✓</span>
                          <div className="highlight-text">
                            <strong>Verified Partners</strong>
                            <span>Authentic cards from authorized retailers</span>
                          </div>
                        </div>
                      </div>
                      <div className="cta-buttons">
                        <button className="line-integration-btn" onClick={() => handleLineAuth()}>
                          <span className="line-logo">📱</span>
                          {lineProfile ? `Connected: ${lineProfile.displayName}` : 'LINE Integration'}
                        </button>
                        {lineProfile && (
                          <button className="line-share-btn" onClick={() => handleLineShare()}>
                            <span className="line-logo">📱</span>
                            Share to LINE
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="shop-hero-right">
                      <div className="hero-stats">
                        <div className="stat-card">
                          <div className="stat-number">100+</div>
                          <div className="stat-label">Global Brands</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-number">200+</div>
                          <div className="stat-label">Testnet Cards Sold</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-number">99.9%</div>
                          <div className="stat-label">Kaia Uptime</div>
                        </div>
                      </div>
                      <div className="hero-features">
                        <div className="feature-badge">Up to 15% Savings</div>
                        <div className="feature-badge">No Hidden Fees</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="section-header">
                <h2 className="section-title">Shopping Categories</h2>
                <span className="results-count">7 popular shopping platforms</span>
              </div>

              <div className="shops-grid">
                {SHOPS.map(shop => (
                  <div 
                    key={shop.id} 
                    className="shop-card"
                    data-category={shop.category}
                    onClick={() => setCurrentView(shop.id as any)}
                  >
                    <div className="shop-card-header">
                      <span className="shop-category">{shop.category}</span>
                    </div>
                    
                    <div className="shop-card-body">
                      <div className="shop-logo">
                        <img 
                          src={shop.logo} 
                          alt={shop.name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="60" viewBox="0 0 80 60"><rect width="80" height="60" fill="#f8f9fa" stroke="#dee2e6"/><text x="40" y="32" text-anchor="middle" font-family="Arial" font-size="10" fill="#6c757d">${shop.name}</text></svg>`)}`;
                          }}
                        />
                      </div>
                      <h3 className="shop-name">{shop.name}</h3>
                      <p className="shop-description">{shop.description}</p>
                      
                      <button className="shop-select-btn">
                        View Gift Cards →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {currentView === 'brand' && selectedBrand && (
            <div className="brand-detail">
              <div className="breadcrumb">
                <span onClick={() => setCurrentView('shop')}>Home</span>
                <span className="breadcrumb-separator">/</span>
                <span>{selectedBrand.category}</span>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current">{selectedBrand.name}</span>
              </div>

              <div className="brand-header">
                <div className="brand-header-content">
                  <div className="brand-header-logo">
                  <img src={selectedBrand.logo} alt={selectedBrand.name} style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
                </div>
                  <div className="brand-header-info">
                    <h1 className="brand-header-title">{selectedBrand.name}</h1>
                    <p className="brand-header-description">{selectedBrand.description}</p>
                    <div className="brand-header-badges">
                      <span className="badge badge-discount">{selectedBrand.discount}% Discount</span>
                      <span className="badge badge-cashback">1% Cashback</span>
                      <span className="badge badge-instant">Instant Delivery</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="gift-cards-section">
                <h2 className="section-title">Select Amount</h2>
                <div className="gift-cards-grid">
                  {giftCards.map(card => (
                    <div key={card.id} className="gift-card">
                      <div className="gift-card-value">${card.value}</div>
                      <div className="gift-card-price">
                        <span className="price-label">Pay only</span>
                        <span className="price-amount">${card.price.toFixed(2)}</span>
                      </div>
                      <div className="gift-card-savings">
                        Save ${(card.value - card.price).toFixed(2)}
                      </div>
                      <div className="gift-card-stock">
                        {card.stock_quantity > 0 ? `${card.stock_quantity} in stock` : 'Out of stock'}
                      </div>
                      <button 
                        className="gift-card-btn"
                        onClick={() => initiateCheckout(card)}
                        disabled={card.stock_quantity === 0}
                      >
                        {card.stock_quantity > 0 ? 'Buy Now' : 'Out of Stock'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentView === 'checkout' && selectedCard && selectedBrand && (
            <div className="checkout">
              <div className="checkout-container">
                <div className="checkout-header">
                  <h1 className="checkout-title">Complete Your Purchase</h1>
                  <div className="checkout-steps">
                    <span className="step active">1. Review</span>
                    <span className="step">2. Payment</span>
                    <span className="step">3. Receive</span>
                  </div>
                </div>

                <div className="checkout-content">
                  <div className="checkout-main">
                    <div className="checkout-section">
                      <h2 className="checkout-section-title">Order Summary</h2>
                      <div className="order-item">
                        <div className="order-item-logo">
                          <img src={selectedBrand.logo} alt={selectedBrand.name} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                        </div>
                        <div className="order-item-details">
                          <h3>{selectedBrand.name} Gift Card</h3>
                          <p>Value: ${selectedCard.value}</p>
                          <p className="discount-text">Discount: {selectedBrand.discount}%</p>
                        </div>
                        <div className="order-item-price">
                          ${selectedCard.price.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="checkout-section">
                      <h2 className="checkout-section-title">Delivery Information</h2>
                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                          type="email"
                          className="form-input"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          placeholder="your@email.com"
                        />
                        <p className="form-help">Gift card code will be sent to this email</p>
                      </div>
                    </div>
                  </div>

                  <div className="checkout-sidebar">
                    <div className="checkout-summary">
                      <h3 className="summary-title">Price Details</h3>
                      <div className="summary-row">
                        <span>Card Value</span>
                        <span>${selectedCard.value.toFixed(2)}</span>
                      </div>
                      <div className="summary-row discount">
                        <span>Discount ({selectedBrand.discount}%)</span>
                        <span>-${(selectedCard.value - selectedCard.price).toFixed(2)}</span>
                      </div>
                      <div className="summary-row cashback">
                        <span>Cashback (1%)</span>
                        <span>+${(selectedCard.price * 0.01).toFixed(2)}</span>
                      </div>
                      <div className="summary-total">
                        <span>Total to Pay</span>
                        <span className="total-amount">${selectedCard.price.toFixed(2)}</span>
                      </div>
                      
                      <button 
                        className="checkout-btn"
                        onClick={processOrder}
                        disabled={!userEmail || loading}
                      >
                        {loading ? 'Processing...' : 'Proceed to Payment'}
                      </button>
                      
                      <div className="payment-info">
                        <p>✓ Secure USDT Payment</p>
                        <p>✓ Instant Delivery</p>
                        <p>✓ 100% Authentic</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'payment' && currentOrder && (
            <div className="payment">
              <div className="payment-container">
                <div className="payment-header">
                  <h1 className="payment-title">Complete Payment</h1>
                  <div className="payment-timer">
                    Time remaining: 14:59
                  </div>
                </div>

                <div className="payment-methods">
                  {lineProfile && (
                    <div className="payment-method">
                      <button
                        className="line-pay-btn"
                        onClick={() => lineIntegration.requestLinePayment(currentOrder.payment.amount)}
                      >
                        <span className="line-logo">📱</span>
                        Pay with LINE Pay
                      </button>
                    </div>
                  )}

                  <div className="payment-divider">
                    <span>Or pay with crypto</span>
                  </div>
                </div>

                <div className="payment-content">
                  <div className="payment-qr">
                    <div className="qr-placeholder">
                      <div className="usdt-logo">USDT</div>
                      <p>Scan to Pay</p>
                    </div>
                  </div>

                  <div className="payment-details">
                    <div className="payment-amount">
                      <span className="amount-label">Amount to Pay</span>
                      <span className="amount-value">${currentOrder.payment.amount.toFixed(2)} USDT</span>
                    </div>

                    <div className="payment-address">
                      <label className="address-label">Send USDT to this address:</label>
                      <div className="address-box">
                        <code className="address-text">{currentOrder.payment.address}</code>
                        <button className="copy-btn" onClick={() => navigator.clipboard.writeText(currentOrder.payment.address)}>
                          Copy
                        </button>
                      </div>
                    </div>

                    <div className="payment-network">
                      <span className="network-label">Network:</span>
                      <span className="network-value">Kaia (USDT)</span>
                    </div>

                    <div className="payment-confirm">
                      <input
                        type="text"
                        className="tx-input"
                        placeholder="Enter transaction hash after payment"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handlePaymentConfirmed((e.target as HTMLInputElement).value);
                          }
                        }}
                      />
                      <button 
                        className="confirm-btn"
                        onClick={() => {
                          const input = document.querySelector('.tx-input') as HTMLInputElement;
                          if (input?.value) handlePaymentConfirmed(input.value);
                        }}
                      >
                        Confirm Payment
                      </button>
                    </div>

                    <div className="payment-instructions">
                      <h3>How to pay:</h3>
                      <ol>
                        <li>Open your wallet app</li>
                        <li>Send exact amount to the address above</li>
                        <li>Copy the transaction hash</li>
                        <li>Paste it above and confirm</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'orders' && (
            <div className="orders">
              <div className="orders-header">
                <h1 className="orders-title">Your Orders</h1>
                {!userEmail && (
                  <div className="email-prompt">
                    <input
                      type="email"
                      placeholder="Enter your email to view orders"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="email-input"
                    />
                    <button onClick={fetchUserOrders} className="fetch-btn">
                      View Orders
                    </button>
                  </div>
                )}
              </div>

              <div className="orders-list">
                {userOrders.length > 0 ? (
                  userOrders.map(order => (
                    <div key={order.orderId} className="order-card">
                      <div className="order-card-header">
                        <span className="order-id">Order #{order.orderId.slice(-8)}</span>
                        <span className={`order-status status-${order.status}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="order-card-body">
                        <div className="order-info">
                          <div className="order-logo">
                            <img 
                              src={order.shopLogo} 
                              alt={order.shopName}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="50" height="40" viewBox="0 0 50 40"><rect width="50" height="40" fill="#f8f9fa" stroke="#dee2e6"/><text x="25" y="22" text-anchor="middle" font-family="Arial" font-size="8" fill="#6c757d">${order.shopName}</text></svg>`)}`;
                              }}
                            />
                          </div>
                          <div className="order-details">
                            <h3>{order.shopName} Gift Card</h3>
                            <p>Value: ${order.amount} USDT</p>
                            <p>Price: ${order.price} USDT</p>
                            <p>Created: {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        {order.card_code && (
                          <div className="order-code">
                            <label>Gift Card Code:</label>
                            <code>{order.card_code}</code>
                          </div>
                        )}

                        <div className="order-actions">
                          {order.status === 'pending' && (
                            <div className="order-status-info">
                              <p>⏳ Waiting for payment confirmation</p>
                            </div>
                          )}
                          
                          {order.status === 'paid' && (
                            <div className="order-status-info">
                              <p>✅ Payment confirmed - Gift card will be delivered soon</p>
                            </div>
                          )}
                          
                          {order.status === 'delivered' && (
                            <div className="order-actions-buttons">
                              <p>📧 Gift card has been delivered!</p>
                              <button 
                                className="order-action-btn primary"
                                onClick={() => handleConfirmGiftCardReceived(order.orderId)}
                                disabled={loading}
                              >
                                {loading ? 'Confirming...' : "I've Received My Gift Card"}
                              </button>
                            </div>
                          )}
                          
                          {order.status === 'received' && (
                            <div className="order-status-info">
                              <p>🎉 Order completed - Thank you!</p>
                            </div>
                          )}
                          
                          <div className="order-card-actions">
                            <button
                              className="order-action-btn secondary"
                              onClick={() => handleConfirmGiftCardReceived(order.orderId)}
                            >
                              ✅ I've received my gift card
                            </button>
                            {lineProfile && (
                              <button
                                className="order-action-btn line-share"
                                onClick={() => lineIntegration.shareOrder(order.orderId, order.shopName, order.amount)}
                              >
                                📱 Share to LINE
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-orders">
                    <p>No orders found</p>
                    <p>Start shopping to see your orders here!</p>
                    <button onClick={() => setCurrentView('shop')} className="continue-shopping-btn">
                      Start Shopping
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentView === 'profile' && (
            <div className="profile">
              <div className="profile-container">
                <h1 className="profile-title">My Account</h1>
                
                <div className="profile-section">
                  <h2>Account Information</h2>
                  <div className="profile-info">
                    <div className="info-row">
                      <span className="info-label">Email:</span>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="info-input"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                </div>

                <div className="profile-section">
                  <h2>Statistics</h2>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <span className="stat-value">{userOrders.length}</span>
                      <span className="stat-label">Total Orders</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value">
                        ${userOrders.reduce((sum, o) => sum + o.price, 0).toFixed(2)}
                      </span>
                      <span className="stat-label">Total Spent</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value">
                        {userOrders.filter(o => o.status === 'received').length}
                      </span>
                      <span className="stat-label">Cards Received</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shop Pages */}
          {(['rakuten', 'shopee', 'coupang', 'klook', 'agoda', 'kairos', 'tripcom', 'airasia'] as const).includes(currentView as any) && (
            <div className="shop-detail">
              <div className="breadcrumb">
                <span onClick={() => setCurrentView('shop')}>Home</span>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current">{SHOPS.find(s => s.id === currentView)?.name}</span>
              </div>

              <div className="shop-header" data-shop={currentView}>
                <div className="shop-header-content">
                  <div className="shop-header-logo">
                    <img 
                      src={SHOPS.find(s => s.id === currentView)?.logo} 
                      alt={SHOPS.find(s => s.id === currentView)?.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const shopName = SHOPS.find(s => s.id === currentView)?.name || 'Shop';
                        target.src = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"><rect width="120" height="80" fill="#f8f9fa" stroke="#dee2e6"/><text x="60" y="42" text-anchor="middle" font-family="Arial" font-size="12" fill="#6c757d">${shopName}</text></svg>`)}`;
                      }}
                    />
                  </div>
                  <div className="shop-header-info">
                    <h1 className="shop-header-title">{SHOPS.find(s => s.id === currentView)?.name}</h1>
                    <p className="shop-header-description">{SHOPS.find(s => s.id === currentView)?.description}</p>
                    <div className="shop-header-badges">
                      <span className="badge badge-discount">USDT Payment</span>
                      <span className="badge badge-instant">Instant Delivery</span>
                      <span className="badge badge-cashback">Secure</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="gift-cards-section">
                <h2 className="section-title">Select Gift Card Amount</h2>
                <div className="gift-cards-grid">
                  {GIFT_CARD_AMOUNTS.map(amount => (
                    <div key={amount} className="gift-card">
                      <div className="gift-card-value">${amount} USDT</div>
                      <div className="gift-card-price">
                        <span className="price-label">Pay with</span>
                        <span className="price-amount">${amount} USDT</span>
                      </div>
                      <div className="gift-card-actions">
                        <button 
                          className="add-to-cart-btn"
                          onClick={() => addToCart(currentView as string, amount)}
                        >
                          Add to Cart 🛒
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Cart View */}
          {currentView === 'cart' && (
            <div className="cart">
              <div className="cart-header">
                <h1 className="cart-title">Shopping Cart</h1>
                <div className="cart-actions">
                  {cartItems.length > 0 && (
                    <button onClick={clearCart} className="clear-cart-btn">
                      Clear Cart
                    </button>
                  )}
                </div>
              </div>

              <div className="cart-content">
                {cartItems.length === 0 ? (
                  <div className="empty-cart">
                    <div className="empty-cart-icon">🛒</div>
                    <h3>Your cart is empty</h3>
                    <p>Add some gift cards to get started!</p>
                    <button onClick={() => setCurrentView('shop')} className="continue-shopping-btn">
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="cart-items">
                      {cartItems.map(item => (
                        <div key={item.id} className="cart-item">
                          <div className="cart-item-info">
                            <div className="cart-item-logo">
                              <img src={item.shopLogo} alt={item.shopName} />
                            </div>
                            <div className="cart-item-details">
                              <h3>{item.shopName} Gift Card</h3>
                              <p>Value: ${item.amount} USDT</p>
                            </div>
                          </div>
                          <div className="cart-item-price">${item.price} USDT</div>
                          <div className="cart-item-actions">
                            <button 
                              className="buy-now-btn"
                              onClick={async () => {
                                const itemId = item.id;
                                try {
                                  if (!walletInfo) {
                                    alert('Please connect your wallet first');
                                    return;
                                  }
                                  
                                  // Set loading for this specific item
                                  setLoadingItems(prev => new Set(prev).add(itemId));
                                  
                                  // Call smart contract to buy gift card
                                  const purchaseId = await buyGiftCardOnChain(item.shopId, item.amount);
                                  
                                  // Remove item from cart after successful purchase
                                  removeFromCart(item.id);
                                  
                                  // Show success modal instead of alert
                                  setSuccessPurchaseData({
                                    purchaseId,
                                    shopName: item.shopName,
                                    amount: item.amount
                                  });
                                  setShowPurchaseSuccessModal(true);
                                } catch (error: any) {
                                  console.error('Purchase failed:', error);
                                  alert(`❌ Purchase failed: ${error.message}`);
                                } finally {
                                  // Remove loading for this specific item
                                  setLoadingItems(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(itemId);
                                    return newSet;
                                  });
                                }
                              }}
                              disabled={loadingItems.has(item.id)}
                            >
                              {loadingItems.has(item.id) ? 'Processing...' : 'Buy Now'}
                            </button>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="remove-item-btn"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="cart-summary">
                      <div className="cart-total">
                        <div className="total-row">
                          <span>Subtotal ({cartItems.length} items)</span>
                          <span className="total-price">${getTotalCartPrice()} USDT</span>
                        </div>
                        <div className="total-row final">
                          <span>Total</span>
                          <span className="total-price">${getTotalCartPrice()} USDT</span>
                        </div>
                      </div>
                      
                      <div className="process-explanation compact">
                        <h4>📋 How it works:</h4>
                        <div className="process-steps">
                          <span>1. Buy with tokens</span>
                          <span>2. Track in Orders</span>
                          <span>3. Confirm delivery</span>
                        </div>
                      </div>
                      
                      <div className="cart-checkout-actions">
                        <button 
                          onClick={() => setCurrentView('shop')} 
                          className="continue-shopping-btn"
                        >
                          Continue Shopping
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3 className="footer-title">KaiaCards</h3>
              <p className="footer-text">Your trusted gift cards marketplace</p>
            </div>
            
            <div className="footer-section">
              <h4 className="footer-subtitle">Payment</h4>
              <p className="footer-text">USDT payments on Kaia network</p>
              <div className="payment-badges">
                <span className="badge">USDT</span>
                <span className="badge">Kaia</span>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>© 2025 KaiaCards.</p>
          </div>
        </div>
      </footer>

      {/* Gift Card Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>⚠️ Confirm Gift Card Receipt</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedOrderId(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p><strong>Warning:</strong> By confirming you've received your gift card, you acknowledge that:</p>
              <ul>
                <li>You have successfully received the gift card code</li>
                <li>The gift card is working as expected</li>
                <li>The tokens will be sent to the treasury and merchant</li>
                <li>This action cannot be undone</li>
              </ul>
              <p>Are you sure you want to continue?</p>
            </div>
            <div className="modal-actions">
              <button 
                className="modal-btn cancel"
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedOrderId(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="modal-btn confirm"
                onClick={confirmGiftCardReceived}
              >
                Yes, I've received my gift card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Success Modal */}
      {showPurchaseSuccessModal && successPurchaseData && (
        <div className="modal-overlay">
          <div className="modal-content purchase-success-modal">
            <div className="modal-header">
              <h3>🎉 Purchase Successful!</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowPurchaseSuccessModal(false);
                  setSuccessPurchaseData(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="success-content">
                <div className="success-icon">✅</div>
                <h4>Your gift card purchase was successful!</h4>
                
                <div className="purchase-details">
                  <div className="detail-item">
                    <span className="label">Shop:</span>
                    <span className="value">{successPurchaseData.shopName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Amount:</span>
                    <span className="value">${successPurchaseData.amount} USDT</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Purchase ID:</span>
                    <span className="value purchase-id">{successPurchaseData.purchaseId.slice(0, 16)}...</span>
                  </div>
                </div>

                <div className="next-steps">
                  <h5>📝 Next Steps:</h5>
                  <div className="steps-list">
                    <div className="step-item">
                      <span className="step-number">1</span>
                      <span>Go to your <strong>Orders</strong> page to track the delivery</span>
                    </div>
                    <div className="step-item">
                      <span className="step-number">2</span>
                      <span>Wait for the gift card to be delivered</span>
                    </div>
                    <div className="step-item">
                      <span className="step-number">3</span>
                      <span>Click <strong>"I've Received My Gift Card"</strong> to confirm delivery</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="modal-btn secondary"
                onClick={() => {
                  setShowPurchaseSuccessModal(false);
                  setSuccessPurchaseData(null);
                }}
              >
                Continue Shopping
              </button>
              <button 
                className="modal-btn primary"
                onClick={() => {
                  setShowPurchaseSuccessModal(false);
                  setSuccessPurchaseData(null);
                  setCurrentView('orders');
                }}
              >
                View Orders
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Confirmed Modal */}
      {showDeliveryConfirmedModal && confirmedOrderData && (
        <div className="modal-overlay">
          <div className="modal-content delivery-confirmed-modal">
            <div className="modal-header">
              <h3>✅ Delivery Confirmed!</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowDeliveryConfirmedModal(false);
                  setConfirmedOrderData(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="success-content">
                <div className="success-icon">🎉</div>
                <h4>Thank you for confirming your gift card delivery!</h4>
                
                <div className="confirmation-details">
                  <div className="detail-item">
                    <span className="label">Shop:</span>
                    <span className="value">{confirmedOrderData.shopName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Amount:</span>
                    <span className="value">${confirmedOrderData.amount} USDT</span>
                  </div>
                </div>

                <div className="confirmation-info">
                  <p>✨ Your tokens have been successfully transferred to the treasury</p>
                  <p>🎁 Enjoy your gift card!</p>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="modal-btn primary"
                onClick={() => {
                  setShowDeliveryConfirmedModal(false);
                  setConfirmedOrderData(null);
                }}
              >
                Perfect!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Added to Cart Modal */}
      {showAddedToCartModal && addedToCartData && (
        <div className="modal-overlay">
          <div className="modal-content added-to-cart-modal">
            <div className="modal-header">
              <h3>🛒 Added to Cart!</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowAddedToCartModal(false);
                  setAddedToCartData(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="success-content">
                <div className="success-icon">✅</div>
                <h4>Item successfully added to your cart!</h4>
                
                <div className="item-details">
                  <div className="detail-item">
                    <span className="label">Shop:</span>
                    <span className="value">{addedToCartData.shopName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Amount:</span>
                    <span className="value">${addedToCartData.amount} USDT</span>
                  </div>
                </div>

                <div className="cart-info">
                  <p>🛍️ Your item is ready for purchase!</p>
                  <p>💡 Go to Cart to complete your purchase with tokens</p>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="modal-btn secondary"
                onClick={() => {
                  setShowAddedToCartModal(false);
                  setAddedToCartData(null);
                }}
              >
                Continue Shopping
              </button>
              <button 
                className="modal-btn primary"
                onClick={() => {
                  setShowAddedToCartModal(false);
                  setAddedToCartData(null);
                  setCurrentView('cart');
                }}
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;