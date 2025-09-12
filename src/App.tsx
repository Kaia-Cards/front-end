import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:3001/api';

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

function App() {
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

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
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
                <div className="header-action" onClick={() => setCurrentView('profile')}>
                  <span className="action-icon">👤</span>
                  <span className="action-text">Account</span>
                </div>
                
                <div className="header-action" onClick={() => setCurrentView('orders')}>
                  <span className="action-icon">📦</span>
                  <span className="action-text">Orders</span>
                </div>
                
                <div className="header-action cart">
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
                  <span className="info-icon">⚡</span> Instant Delivery
                </span>
                <span className="nav-info-item">
                  <span className="info-icon">🔒</span> Secure Payment
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
              <div className="promo-banner">
                <div className="promo-content">
                  <h2 className="promo-title">Asian Gift Cards Marketplace</h2>
                  <p className="promo-subtitle">Powered by Kaia Blockchain • Pay with USDT</p>
                  <div className="promo-features">
                    <span className="promo-feature">✨ Up to 10% Discount</span>
                    <span className="promo-feature">🎁 1% Cashback</span>
                    <span className="promo-feature">🚀 Instant Delivery</span>
                  </div>
                </div>
              </div>

              <div className="section-header">
                <h2 className="section-title">Popular Brands</h2>
                <span className="results-count">{filteredBrands.length} brands available (total: {brands.length})</span>
              </div>

              <div className="brands-grid">
                {filteredBrands.map(brand => (
                  <div 
                    key={brand.id} 
                    className="brand-card"
                    onClick={() => selectBrand(brand)}
                  >
                    <div className="brand-card-header">
                      <span className="brand-discount">{brand.discount}% OFF</span>
                      {brand.available && <span className="brand-available">Available</span>}
                    </div>
                    
                    <div className="brand-card-body">
                      <div className="brand-logo">
                        <img src={brand.logo} alt={brand.name} style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                      </div>
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
                        View Cards →
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
                          {order.status}
                        </span>
                      </div>
                      <div className="order-card-body">
                        <div className="order-info">
                          <span className="order-logo">{order.brand_logo}</span>
                          <div className="order-details">
                            <h3>{order.brand_name}</h3>
                            <p>Value: ${order.value}</p>
                            <p>Paid: ${order.price}</p>
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
                    {userEmail && <p>Start shopping to see your orders here!</p>}
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
                        ${userOrders.reduce((sum, o) => sum + o.cashback, 0).toFixed(2)}
                      </span>
                      <span className="stat-label">Total Cashback</span>
                    </div>
                  </div>
                </div>
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
              <p className="footer-text">Your trusted Asian gift cards marketplace on Kaia blockchain</p>
            </div>
            
            <div className="footer-section">
              <h4 className="footer-subtitle">Quick Links</h4>
              <ul className="footer-links">
                <li><a href="#" onClick={() => setCurrentView('shop')}>Shop</a></li>
                <li><a href="#" onClick={() => setCurrentView('orders')}>Orders</a></li>
                <li><a href="#" onClick={() => setCurrentView('profile')}>Profile</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4 className="footer-subtitle">Payment</h4>
              <p className="footer-text">Secure USDT payments on Kaia network</p>
              <div className="payment-badges">
                <span className="badge">USDT</span>
                <span className="badge">Kaia</span>
              </div>
            </div>
            
            <div className="footer-section">
              <h4 className="footer-subtitle">Support</h4>
              <p className="footer-text">24/7 Customer Support</p>
              <p className="footer-text">support@kaiacards.com</p>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>© 2025 KaiaCards. Powered by Kaia Blockchain.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;