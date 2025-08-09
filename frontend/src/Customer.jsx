import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Customer = ({ user, onLogout }) => {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [view, setView] = useState('products'); // products, cart, orders
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [checkoutData, setCheckoutData] = useState({
    delivery_address: '',
    payment_method: 'cash'
  });

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    let newCart;
    
    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }
    
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const newCart = cart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0 || !checkoutData.delivery_address) return;

    setLoading(true);
    try {
      const orderData = {
        items: cart,
        total: parseFloat(calculateTotal()),
        ...checkoutData
      };

      const response = await axios.post('/orders', orderData);
      setCart([]);
      localStorage.removeItem('cart');
      setCheckoutData({ delivery_address: '', payment_method: 'cash' });
      
      // Show success message
      setSuccessMessage(`${t('customer.orderPlaced')} Order #${response.data.id}`);
      setTimeout(() => setSuccessMessage(''), 5000);
      
      setView('orders');
      fetchOrders();
    } catch (error) {
      console.error('Error placing order:', error);
      setSuccessMessage(error.response?.data?.message || t('common.error'));
      setTimeout(() => setSuccessMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (product) => {
    return i18n.language === 'ar' ? product.name_ar : product.name_en;
  };

  const getProductDescription = (product) => {
    return i18n.language === 'ar' ? product.description_ar : product.description_en;
  };

  const getProductCategory = (product) => {
    return i18n.language === 'ar' ? product.category_ar : product.category_en;
  };

  const renderProducts = () => (
    <div>
      <h2 style={{ marginBottom: '20px' }}>{t('customer.browseProducts')}</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {products.map(product => (
          <div key={product.id} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: 'white'
          }}>
            <h3 style={{ marginBottom: '8px' }}>{getProductName(product)}</h3>
            <p style={{ color: '#666', marginBottom: '8px', fontSize: '14px' }}>
              {getProductCategory(product)}
            </p>
            <p style={{ marginBottom: '12px' }}>{getProductDescription(product)}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
                ${product.price}
              </span>
              <button
                onClick={() => addToCart(product)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {t('customer.addToCart')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCart = () => (
    <div>
      <h2 style={{ marginBottom: '20px' }}>{t('customer.viewCart')}</h2>
      {cart.length === 0 ? (
        <p>{t('customer.emptyCart')}</p>
      ) : (
        <div>
          {cart.map(item => (
            <div key={item.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginBottom: '12px',
              backgroundColor: 'white'
            }}>
              <div>
                <h4>{getProductName(item)}</h4>
                <p>${item.price} each</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                  style={{
                    width: '32px',
                    height: '32px',
                    border: '1px solid #ddd',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                  style={{
                    width: '32px',
                    height: '32px',
                    border: '1px solid #ddd',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          
          <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <h3>{t('customer.total')}: ${calculateTotal()}</h3>
            
            <form onSubmit={handleCheckout} style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                  {t('customer.deliveryAddress')}
                </label>
                <input
                  type="text"
                  value={checkoutData.delivery_address}
                  onChange={(e) => setCheckoutData({...checkoutData, delivery_address: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                  {t('customer.paymentMethod')}
                </label>
                <select
                  value={checkoutData.payment_method}
                  onChange={(e) => setCheckoutData({...checkoutData, payment_method: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                >
                  <option value="cash">{t('customer.cash')}</option>
                  <option value="credit_card">{t('customer.creditCard')}</option>
                </select>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                {loading ? t('common.loading') : t('customer.placeOrder')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div>
      <h2 style={{ marginBottom: '20px' }}>{t('navigation.orders')}</h2>
      {orders.map(order => (
        <div key={order.id} style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          backgroundColor: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h4>{t('order.details')} #{order.id}</h4>
            <span style={{
              padding: '4px 12px',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '16px',
              fontSize: '14px'
            }}>
              {t(`order.status.${order.status}`)}
            </span>
          </div>
          <p><strong>{t('common.price')}:</strong> ${order.total}</p>
          <p><strong>{t('order.createdAt')}:</strong> {new Date(order.created_at).toLocaleString()}</p>
          <details style={{ marginTop: '12px' }}>
            <summary style={{ cursor: 'pointer' }}>{t('order.items')}</summary>
            <div style={{ marginTop: '8px' }}>
              {JSON.parse(order.items_json).map((item, index) => (
                <div key={index} style={{ padding: '4px 0' }}>
                  {getProductName(item)} x{item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                </div>
              ))}
            </div>
          </details>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        padding: '16px 24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1>{t('app.title')} - {t('auth.welcome')} {user.username}</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => {
              const newLang = i18n.language === 'en' ? 'ar' : 'en';
              i18n.changeLanguage(newLang);
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {i18n.language === 'en' ? t('common.arabic') : t('common.english')}
          </button>
          <button
            onClick={onLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {t('auth.logout')}
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{
        backgroundColor: 'white',
        padding: '12px 24px',
        borderBottom: '1px solid #ddd'
      }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <button
            onClick={() => setView('products')}
            style={{
              background: 'none',
              border: 'none',
              color: view === 'products' ? '#007bff' : '#666',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '8px 0',
              borderBottom: view === 'products' ? '2px solid #007bff' : 'none'
            }}
          >
            {t('navigation.products')}
          </button>
          <button
            onClick={() => setView('cart')}
            style={{
              background: 'none',
              border: 'none',
              color: view === 'cart' ? '#007bff' : '#666',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '8px 0',
              borderBottom: view === 'cart' ? '2px solid #007bff' : 'none'
            }}
          >
            {t('navigation.cart')} ({cart.length})
          </button>
          <button
            onClick={() => setView('orders')}
            style={{
              background: 'none',
              border: 'none',
              color: view === 'orders' ? '#007bff' : '#666',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '8px 0',
              borderBottom: view === 'orders' ? '2px solid #007bff' : 'none'
            }}
          >
            {t('navigation.orders')}
          </button>
        </div>
      </nav>

      {/* Success Message */}
      {successMessage && (
        <div style={{
          backgroundColor: successMessage.includes('Error') ? '#f8d7da' : '#d4edda',
          color: successMessage.includes('Error') ? '#721c24' : '#155724',
          padding: '12px 24px',
          borderBottom: `1px solid ${successMessage.includes('Error') ? '#f5c6cb' : '#c3e6cb'}`,
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          {successMessage}
        </div>
      )}

      {/* Content */}
      <main style={{ padding: '24px' }}>
        {view === 'products' && renderProducts()}
        {view === 'cart' && renderCart()}
        {view === 'orders' && renderOrders()}
      </main>
    </div>
  );
};

export default Customer;