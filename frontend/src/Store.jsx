import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Store = ({ user, onLogout }) => {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
      placed: [
        { status: 'confirmed', label: t('store.markConfirmed'), color: '#17a2b8' },
        { status: 'cancelled', label: 'Cancel', color: '#dc3545' }
      ],
      confirmed: [
        { status: 'preparing', label: t('store.markPreparing'), color: '#fd7e14' }
      ],
      preparing: [
        { status: 'ready', label: t('store.markReady'), color: '#28a745' }
      ]
    };
    return actions[status] || [];
  };

  const groupOrdersByStatus = () => {
    return {
      placed: orders.filter(order => order.status === 'placed'),
      confirmed: orders.filter(order => order.status === 'confirmed'),
      preparing: orders.filter(order => order.status === 'preparing'),
      ready: orders.filter(order => order.status === 'ready'),
      out_for_delivery: orders.filter(order => order.status === 'out_for_delivery'),
      delivered: orders.filter(order => order.status === 'delivered'),
      cancelled: orders.filter(order => order.status === 'cancelled')
    };
  };

  const renderOrderCard = (order) => (
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
        <p><strong>{t('common.price')}:</strong> ${order.total}</p>
        <p><strong>{t('order.createdAt')}:</strong> {new Date(order.created_at).toLocaleString()}</p>
      </div>

      {selectedOrder?.id === order.id && (
        <div style={{ borderTop: '1px solid #eee', paddingTop: '12px' }}>
          <h5 style={{ marginBottom: '8px' }}>{t('order.items')}:</h5>
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
          
          {order.delivery_address && (
            <div style={{ marginTop: '8px' }}>
              <strong>Delivery Address:</strong> {order.delivery_address}
            </div>
          )}

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
                  padding: '8px 16px',
                  backgroundColor: action.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const orderGroups = groupOrdersByStatus();

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
        <h1>{t('store.orderManagement')} - {user.username}</h1>
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

      {/* Content */}
      <main style={{ padding: '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          {/* New Orders */}
          <div>
            <h2 style={{ 
              marginBottom: '16px', 
              color: '#495057',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {t('store.newOrders')} 
              <span style={{
                backgroundColor: '#ffc107',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                {orderGroups.placed.length}
              </span>
            </h2>
            {orderGroups.placed.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No new orders</p>
            ) : (
              orderGroups.placed.map(renderOrderCard)
            )}
          </div>

          {/* Confirmed Orders */}
          <div>
            <h2 style={{ 
              marginBottom: '16px', 
              color: '#495057',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {t('store.confirmed')} 
              <span style={{
                backgroundColor: '#17a2b8',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                {orderGroups.confirmed.length}
              </span>
            </h2>
            {orderGroups.confirmed.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No confirmed orders</p>
            ) : (
              orderGroups.confirmed.map(renderOrderCard)
            )}
          </div>

          {/* Preparing Orders */}
          <div>
            <h2 style={{ 
              marginBottom: '16px', 
              color: '#495057',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {t('store.preparing')} 
              <span style={{
                backgroundColor: '#fd7e14',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                {orderGroups.preparing.length}
              </span>
            </h2>
            {orderGroups.preparing.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No orders being prepared</p>
            ) : (
              orderGroups.preparing.map(renderOrderCard)
            )}
          </div>

          {/* Ready Orders */}
          <div>
            <h2 style={{ 
              marginBottom: '16px', 
              color: '#495057',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {t('store.ready')} 
              <span style={{
                backgroundColor: '#28a745',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                {orderGroups.ready.length}
              </span>
            </h2>
            {orderGroups.ready.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No ready orders</p>
            ) : (
              orderGroups.ready.map(renderOrderCard)
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ marginTop: '32px' }}>
          <h2 style={{ marginBottom: '16px', color: '#495057' }}>Recent Activity</h2>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px' }}>
            {[...orderGroups.out_for_delivery, ...orderGroups.delivered, ...orderGroups.cancelled]
              .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
              .slice(0, 5)
              .map(renderOrderCard)}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Store;