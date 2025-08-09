import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Driver = ({ user, onLogout }) => {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [view, setView] = useState('available'); // available, active, completed

  useEffect(() => {
    fetchOrders();
    // Auto-refresh orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setLoading(true);
    try {
      await axios.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders(); // Refresh orders
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(error.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (product) => {
    return i18n.language === 'ar' ? product.name_ar : product.name_en;
  };

  const getStatusColor = (status) => {
    const colors = {
      placed: '#ffc107',
      confirmed: '#17a2b8',
      preparing: '#fd7e14',
      ready: '#28a745',
      out_for_delivery: '#6f42c1',
      delivered: '#20c997',
      cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getNextActions = (status) => {
    const actions = {
      ready: [
        { status: 'out_for_delivery', label: t('driver.acceptOrder'), color: '#6f42c1' }
      ],
      out_for_delivery: [
        { status: 'delivered', label: t('driver.markDelivered'), color: '#20c997' }
      ]
    };
    return actions[status] || [];
  };

  const categorizeOrders = () => {
    return {
      available: orders.filter(order => order.status === 'ready'),
      active: orders.filter(order => order.status === 'out_for_delivery'),
      completed: orders.filter(order => order.status === 'delivered')
    };
  };

  const renderOrderCard = (order, showActions = true) => (
    <div
      key={order.id}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        backgroundColor: 'white',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
        boxShadow: selectedOrder?.id === order.id ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
      }}
      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h4>Order #{order.id}</h4>
        <span style={{
          padding: '4px 12px',
          backgroundColor: getStatusColor(order.status),
          color: 'white',
          borderRadius: '16px',
          fontSize: '14px'
        }}>
          {t(`order.status.${order.status}`)}
        </span>
      </div>
      
      <div style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
        <p><strong>{t('order.customer')}:</strong> {order.customer_name}</p>
        <p><strong>Delivery Address:</strong> {order.delivery_address || 'Not specified'}</p>
        <p><strong>{t('common.price')}:</strong> ${order.total}</p>
        <p><strong>{t('order.createdAt')}:</strong> {new Date(order.created_at).toLocaleString()}</p>
      </div>

      {selectedOrder?.id === order.id && (
        <div style={{ borderTop: '1px solid #eee', paddingTop: '12px' }}>
          <h5 style={{ marginBottom: '8px' }}>{t('order.items')}:</h5>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {JSON.parse(order.items_json).map((item, index) => (
              <div key={index} style={{ 
                padding: '8px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '4px',
                marginBottom: '4px'
              }}>
                <strong>{getProductName(item)}</strong> x{item.quantity} - ${(item.price * item.quantity).toFixed(2)}
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
            <strong>Payment Method:</strong> {order.payment_method === 'cash' ? t('customer.cash') : t('customer.creditCard')}
          </div>

          {showActions && (
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {getNextActions(order.status).map((action) => (
                <button
                  key={action.status}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateOrderStatus(order.id, action.status);
                  }}
                  disabled={loading}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: action.color,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const orderCategories = categorizeOrders();
  
  const renderContent = () => {
    switch (view) {
      case 'available':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>{t('driver.availableOrders')} ({orderCategories.available.length})</h2>
              <button
                onClick={fetchOrders}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Refresh
              </button>
            </div>
            {orderCategories.available.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                backgroundColor: 'white', 
                borderRadius: '8px',
                color: '#666'
              }}>
                <h3>No orders available for delivery</h3>
                <p>Check back later for new delivery opportunities</p>
              </div>
            ) : (
              orderCategories.available.map(order => renderOrderCard(order, true))
            )}
          </div>
        );
      
      case 'active':
        return (
          <div>
            <h2 style={{ marginBottom: '20px' }}>{t('driver.outForDelivery')} ({orderCategories.active.length})</h2>
            {orderCategories.active.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                backgroundColor: 'white', 
                borderRadius: '8px',
                color: '#666'
              }}>
                <h3>No active deliveries</h3>
                <p>Accept an order to start delivering</p>
              </div>
            ) : (
              orderCategories.active.map(order => renderOrderCard(order, true))
            )}
          </div>
        );
      
      case 'completed':
        return (
          <div>
            <h2 style={{ marginBottom: '20px' }}>Completed Deliveries ({orderCategories.completed.length})</h2>
            {orderCategories.completed.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                backgroundColor: 'white', 
                borderRadius: '8px',
                color: '#666'
              }}>
                <h3>No completed deliveries yet</h3>
                <p>Your delivery history will appear here</p>
              </div>
            ) : (
              orderCategories.completed
                .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
                .map(order => renderOrderCard(order, false))
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

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
        <h1>Driver Dashboard - {user.username}</h1>
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
            onClick={() => setView('available')}
            style={{
              background: 'none',
              border: 'none',
              color: view === 'available' ? '#007bff' : '#666',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '8px 0',
              borderBottom: view === 'available' ? '2px solid #007bff' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {t('driver.availableOrders')}
            {orderCategories.available.length > 0 && (
              <span style={{
                backgroundColor: '#28a745',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                {orderCategories.available.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setView('active')}
            style={{
              background: 'none',
              border: 'none',
              color: view === 'active' ? '#007bff' : '#666',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '8px 0',
              borderBottom: view === 'active' ? '2px solid #007bff' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Active Deliveries
            {orderCategories.active.length > 0 && (
              <span style={{
                backgroundColor: '#6f42c1',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                {orderCategories.active.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setView('completed')}
            style={{
              background: 'none',
              border: 'none',
              color: view === 'completed' ? '#007bff' : '#666',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '8px 0',
              borderBottom: view === 'completed' ? '2px solid #007bff' : 'none'
            }}
          >
            Completed ({orderCategories.completed.length})
          </button>
        </div>
      </nav>

      {/* Stats Cards */}
      <div style={{ padding: '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #ddd'
          }}>
            <h3 style={{ color: '#28a745', margin: '0 0 8px 0' }}>{orderCategories.available.length}</h3>
            <p style={{ margin: 0, color: '#666' }}>Available Orders</p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #ddd'
          }}>
            <h3 style={{ color: '#6f42c1', margin: '0 0 8px 0' }}>{orderCategories.active.length}</h3>
            <p style={{ margin: 0, color: '#666' }}>Active Deliveries</p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #ddd'
          }}>
            <h3 style={{ color: '#20c997', margin: '0 0 8px 0' }}>{orderCategories.completed.length}</h3>
            <p style={{ margin: 0, color: '#666' }}>Completed Today</p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #ddd'
          }}>
            <h3 style={{ color: '#007bff', margin: '0 0 8px 0' }}>
              ${orderCategories.completed.reduce((sum, order) => sum + parseFloat(order.total), 0).toFixed(2)}
            </h3>
            <p style={{ margin: 0, color: '#666' }}>Earnings Today</p>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Driver;