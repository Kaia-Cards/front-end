import React, { useState, useEffect } from 'react';
import './styles/mini-app.css';
import { useLiff } from './hooks/useLiff';
import { useLanguage } from './hooks/useLanguage';
import { translations } from './translations';
import { WalletConnect } from './components/WalletConnect';
import { LanguageSelector } from './components/LanguageSelector';
import { MaintenanceMode } from './components/MaintenanceMode';
import { CloseConfirmDialog } from './components/CloseConfirmDialog';
import { LineQRCode } from './components/LineQRCode';
import { PAYMENT_CONFIG } from './config/miniDapp';

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
  brand: string;
  brandLogo: string;
  value: number;
  pricing: {
    originalValue: number;
    discountedPrice: number;
    savings: number;
    cashback: number;
    finalPrice: number;
  };
  payment: {
    method: string;
    amount: number;
    address: string;
    network: string;
  };
  status: string;
  expiresAt: string;
  tx_hash?: string;
  card_code?: string;
}

interface WalletInfo {
  address: string;
  balance: string;
  network: string;
}

function MiniApp() {
  const { isLiffReady, isLoggedIn, liffUser, isInLineApp, login } = useLiff();
  const { currentLanguage } = useLanguage();

  const [currentView, setCurrentView] = useState<'shop' | 'brand' | 'checkout' | 'payment' | 'orders' | 'profile'>('shop');
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const t = translations[currentLanguage as keyof typeof translations];

  useEffect(() => {
    fetchBrands();
    if (isLoggedIn && liffUser) {
      setUserEmail(liffUser.displayName + '@line.user');
    }
  }, [isLoggedIn, liffUser]);

  const fetchBrands = async () => {
    try {
      const response = await fetch(`${API_BASE}/brands`);
      const data = await response.json();
      setBrands(data);
      console.log(`Loaded ${data.length} brands`);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const selectBrand = async (brand: Brand) => {
    setSelectedBrand(brand);
    setCurrentView('brand');

    try {
      const response = await fetch(`${API_BASE}/brands/${brand.name}`);
      const data = await response.json();

      if (data.denominations) {
        const cards = data.denominations.map((value: number) => ({
          id: `${brand.id}_${value}`,
          value: value,
          price: value * (1 - brand.discount / 100),
          stock_quantity: 50,
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
          brand_name: selectedBrand.name,
          brand_logo: selectedBrand.logo,
          card_value: selectedCard.value,
          card_price: selectedCard.price,
          user_email: userEmail,
          discount_rate: selectedBrand.discount
        })
      });

      if (response.ok) {
        const order = await response.json();
        setCurrentOrder(order);
        setCurrentView('payment');
      } else {
        alert('Order creation failed');
      }
    } catch (error) {
      console.error('Order processing failed:', error);
      alert('Order failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentConfirmed = async (txHash: string) => {
    if (!currentOrder) return;

    try {
      const response = await fetch(`${API_BASE}/order/${currentOrder.orderId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tx_hash: txHash })
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setCurrentOrder(updatedOrder);
        alert('Payment confirmed! Check your email for the gift card code.');
      }
    } catch (error) {
      console.error('Payment confirmation failed:', error);
    }
  };

  const fetchUserOrders = async () => {
    if (!userEmail) return;

    try {
      const response = await fetch(`${API_BASE}/orders?email=${userEmail}`);
      const data = await response.json();
      setUserOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleWalletChange = (wallet: WalletInfo | null) => {
    setWalletInfo(wallet);
  };

  const handleCloseRequest = () => {
    setShowCloseConfirm(true);
  };

  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || brand.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(brands.map(b => b.category))];

  if (isMaintenanceMode) {
    return <MaintenanceMode />;
  }

  if (!isLiffReady) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="mini-app">
      <header className="header mobile-header">
        <div className="header-top">
          <div className="container">
            <div className="header-top-content">
              <button className="mobile-menu-btn" onClick={() => setShowMobileMenu(!showMobileMenu)}>
                ☰
              </button>

              <div className="logo" onClick={() => setCurrentView('shop')}>
                <span className="logo-text">K</span>
                <span className="logo-cards">SHOP</span>
              </div>

              <div className="header-actions mobile-actions">
                {isLoggedIn && (
                  <div className="user-avatar" onClick={() => setCurrentView('profile')}>
                    {liffUser?.pictureUrl ? (
                      <img src={liffUser.pictureUrl} alt={liffUser.displayName} className="avatar-img" />
                    ) : (
                      <div className="avatar-placeholder">👤</div>
                    )}
                  </div>
                )}

                <div className="header-action cart" onClick={() => setCurrentView('orders')}>
                  <span className="action-icon">📦</span>
                  <span className="cart-count">{userOrders.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {currentView === 'shop' && (
          <div className="search-section">
            <div className="container">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder={t.header.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button className="search-btn">
                  <span>🔍</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {showMobileMenu && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <button onClick={() => { setCurrentView('shop'); setShowMobileMenu(false); }}>
              🏪 Shop
            </button>
            <button onClick={() => { setCurrentView('orders'); setShowMobileMenu(false); }}>
              📦 Orders
            </button>
            <button onClick={() => { setCurrentView('profile'); setShowMobileMenu(false); }}>
              👤 Profile
            </button>
            <LanguageSelector />
            <WalletConnect onWalletChange={handleWalletChange} translations={t} />
          </div>
        </div>
      )}

      <main className="main-content mobile-main">
        <div className="container">
          {currentView === 'shop' && (
            <>
              {!isLoggedIn && (
                <div className="login-prompt">
                  <h2>Welcome to KaiaCards</h2>
                  <p>Login with LINE to start shopping</p>
                  <button
                    className="line-login-btn"
                    onClick={login}
                    disabled={!isLiffReady}
                  >
                    Login with LINE
                  </button>
                </div>
              )}

              {isLoggedIn && (
                <>
                  <div className="categories-nav mobile-categories">
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

                  <div className="brands-grid mobile-grid">
                    {filteredBrands.map(brand => (
                      <div
                        key={brand.id}
                        className="brand-card mobile-card"
                        onClick={() => selectBrand(brand)}
                      >
                        <div className="brand-card-header">
                          <span className="brand-discount">{brand.discount}% OFF</span>
                          {brand.available && <span className="brand-available">Available</span>}
                        </div>

                        <div className="brand-card-body">
                          <div className="brand-logo">{brand.logo}</div>
                          <h3 className="brand-name">{brand.name}</h3>
                          <p className="brand-description">{brand.description}</p>

                          <div className="brand-meta">
                            <span className="brand-category">{brand.category}</span>
                            <span className="brand-country">{brand.country}</span>
                          </div>

                          <div className="brand-range">
                            ${brand.minValue} - ${brand.maxValue}
                          </div>

                          <button className="brand-select-btn">
                            {t.shop.viewCards}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {currentView === 'brand' && selectedBrand && (
            <div className="brand-detail mobile-detail">
              <div className="mobile-header-bar">
                <button onClick={() => setCurrentView('shop')} className="back-btn">
                  ← Back
                </button>
                <h1>{selectedBrand.name}</h1>
              </div>

              <div className="brand-header mobile-brand-header">
                <div className="brand-header-content">
                  <div className="brand-header-logo">{selectedBrand.logo}</div>
                  <div className="brand-header-info">
                    <h2 className="brand-header-title">{selectedBrand.name}</h2>
                    <p className="brand-header-description">{selectedBrand.description}</p>
                    <div className="brand-header-badges">
                      <span className="badge badge-discount">{selectedBrand.discount}% Discount</span>
                      <span className="badge badge-available">Available Now</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="gift-cards mobile-cards">
                <h3>Select Amount</h3>
                <div className="gift-cards-grid">
                  {giftCards.map(card => (
                    <div
                      key={card.id}
                      className="gift-card mobile-gift-card"
                      onClick={() => initiateCheckout(card)}
                    >
                      <div className="card-value">${card.value}</div>
                      <div className="card-price">Pay: ${card.price.toFixed(2)}</div>
                      <div className="card-discount">Save: ${(card.value - card.price).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentView === 'checkout' && selectedCard && selectedBrand && (
            <div className="checkout mobile-checkout">
              <div className="mobile-header-bar">
                <button onClick={() => setCurrentView('brand')} className="back-btn">
                  ← Back
                </button>
                <h1>Checkout</h1>
              </div>

              <div className="checkout-summary">
                <h3>Order Summary</h3>
                <div className="summary-item">
                  <span>{selectedBrand.name} - ${selectedCard.value}</span>
                  <span>${selectedCard.price.toFixed(2)}</span>
                </div>
              </div>

              <div className="checkout-form">
                <label>Email for delivery:</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="email-input"
                />
              </div>

              <button
                className="checkout-btn"
                onClick={processOrder}
                disabled={loading || !userEmail}
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          )}

          {currentView === 'payment' && currentOrder && (
            <div className="payment mobile-payment">
              <div className="mobile-header-bar">
                <h1>Payment</h1>
              </div>

              <div className="payment-info">
                <h3>Send Payment</h3>
                <div className="payment-amount">
                  <strong>${currentOrder.pricing.finalPrice} USDT</strong>
                </div>

                <div className="payment-address">
                  <label>Send to address:</label>
                  <div className="address-box">
                    <span className="address">{currentOrder.payment.address}</span>
                    <button className="copy-btn" onClick={() => navigator.clipboard.writeText(currentOrder.payment.address)}>
                      Copy
                    </button>
                  </div>
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
              </div>
            </div>
          )}

          {currentView === 'orders' && (
            <div className="orders mobile-orders">
              <div className="mobile-header-bar">
                <button onClick={() => setCurrentView('shop')} className="back-btn">
                  ← Back
                </button>
                <h1>Your Orders</h1>
              </div>

              <div className="orders-list">
                {userOrders.length > 0 ? (
                  userOrders.map(order => (
                    <div key={order.orderId} className="order-card mobile-order-card">
                      <div className="order-header">
                        <span className="order-id">#{order.orderId.slice(-8)}</span>
                        <span className={`order-status status-${order.status}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="order-body">
                        <div className="order-info">
                          <span className="order-logo">{order.brandLogo}</span>
                          <div className="order-details">
                            <h4>{order.brand}</h4>
                            <p>Value: ${order.value}</p>
                            <p>Paid: ${order.pricing.finalPrice}</p>
                          </div>
                        </div>
                        {order.card_code && (
                          <div className="order-code">
                            <label>Gift Card Code:</label>
                            <code>{order.card_code}</code>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-orders">
                    <p>No orders found</p>
                    <button onClick={() => setCurrentView('shop')} className="shop-btn">
                      Start Shopping
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentView === 'profile' && (
            <div className="profile mobile-profile">
              <div className="mobile-header-bar">
                <button onClick={() => setCurrentView('shop')} className="back-btn">
                  ← Back
                </button>
                <h1>Profile</h1>
              </div>

              <div className="profile-info">
                {liffUser && (
                  <div className="user-info">
                    {liffUser.pictureUrl && (
                      <img src={liffUser.pictureUrl} alt={liffUser.displayName} className="profile-avatar" />
                    )}
                    <h3>{liffUser.displayName}</h3>
                    <p>Connected via LINE</p>
                  </div>
                )}

                <div className="profile-stats">
                  <div className="stat">
                    <span className="stat-value">{userOrders.length}</span>
                    <span className="stat-label">Orders</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">
                      ${userOrders.reduce((sum, o) => sum + o.pricing.finalPrice, 0).toFixed(2)}
                    </span>
                    <span className="stat-label">Spent</span>
                  </div>
                </div>

                <div className="profile-section">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="email-input"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showCloseConfirm && (
        <CloseConfirmDialog
          onConfirm={() => window.close()}
          onCancel={() => setShowCloseConfirm(false)}
        />
      )}
    </div>
  );
}

export default MiniApp;