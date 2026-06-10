import axios from 'axios';
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import MyContext from '../contexts/MyContext';
import './Myorders.css';

const VND_RATE = 24000;

function formatVND(usd) {
  const value = Number(usd) || 0;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(value * VND_RATE));
}

function getImgSrc(image) {
  if (!image) return 'https://via.placeholder.com/100x100?text=No+Image';
  if (image.startsWith('data:') || image.startsWith('http')) return image;
  return 'data:image/jpeg;base64,' + image;
}

class Myorders extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      order: null, // order detail
      toast: null
    };
  }

  componentDidMount() {
    if (this.context.customer) {
      this.apiGetOrdersByCustID(this.context.customer._id);
    }
  }

  showToast(msg, type = 'success') {
    this.setState({ toast: { msg, type } });
    setTimeout(() => this.setState({ toast: null }), 2500);
  }

  // EVENT HANDLERS
  handleOrderClick = (item) => {
    this.setState({ order: item });
    // cuộn xuống chi tiết đơn hàng (có thể cuộn mượt xuống phía dưới màn hình)
    setTimeout(() => {
      const el = document.getElementById('order-detail-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  // API
  apiGetOrdersByCustID(cid) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/customer/orders/customer/' + cid, config).then((res) => {
      if (res.data) {
        // sắp xếp đơn hàng mới nhất lên đầu
        const sortedOrders = res.data.sort((a, b) => new Date(b.cdate) - new Date(a.cdate));
        this.setState({ orders: sortedOrders });
      }
    }).catch(err => console.error(err));
  }

  // HELPER
  getStatusBadgeClass(status) {
    if (!status) return 'status-default';
    switch (status.toUpperCase()) {
      case 'PENDING': return 'status-pending';
      case 'APPROVED': return 'status-approved';
      case 'CANCELED': return 'status-canceled';
      case 'SHIPPING': return 'status-shipping';
      case 'COMPLETED': return 'status-completed';
      default: return 'status-default';
    }
  }

  render() {
    if (this.context.token === '') return <Navigate replace to='/login' />;

    const { orders, order, toast } = this.state;

    return (
      <div className="orders-wrap">
        {toast && (
          <div className={`orders-toast orders-toast--${toast.type}`}>
            {toast.type === 'success' ? '✓' : '⚠'} {toast.msg}
          </div>
        )}

        <div className="orders-header">
          <h2 className="orders-title">Đơn hàng của tôi</h2>
          <p className="orders-subtitle">Theo dõi và quản lý lịch sử mua hàng</p>
        </div>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">📦</div>
            <p>Bạn chưa có đơn hàng nào.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((item) => (
              <div 
                key={item._id} 
                className={`order-card ${order && order._id === item._id ? 'active' : ''}`}
                onClick={() => this.handleOrderClick(item)}
              >
                <div className="order-card-header">
                  <div className="order-card-meta">
                    <span className="order-id">#{item._id.substring(item._id.length - 6).toUpperCase()}</span>
                    <span className="order-date">{new Date(item.cdate).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <span className={`order-status-badge ${this.getStatusBadgeClass(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <div className="order-card-body">
                  <div className="order-total-lbl">Tổng tiền:</div>
                  <div className="order-total-val">{formatVND(item.total)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ORDER DETAIL SECTION */}
        {order && (
          <div id="order-detail-section" className="order-detail-card">
            <div className="order-detail-header">
              <h3 className="order-detail-title">
                Chi tiết đơn hàng <span className="order-detail-id">#{order._id.substring(order._id.length - 6).toUpperCase()}</span>
              </h3>
              <button className="btn-close-detail" onClick={() => this.setState({ order: null })}>✕ Đóng</button>
            </div>
            
            <div className="order-detail-info">
              <div className="info-block">
                <h4>Thông tin người nhận</h4>
                <p><strong>Tên:</strong> {order.customer?.name}</p>
                <p><strong>Điện thoại:</strong> {order.customer?.phone}</p>
                <p><strong>Thời gian đặt:</strong> {new Date(order.cdate).toLocaleString('vi-VN')}</p>
              </div>
              <div className="info-block">
                <h4>Trạng thái đơn hàng</h4>
                <span className={`order-status-badge ${this.getStatusBadgeClass(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>

            <div className="order-items-list">
              <h4 className="items-title">Sản phẩm đã mua</h4>
              {order.items.map((item, index) => {
                if (!item.product) return null;
                return (
                  <div key={item.product._id || index} className="order-item-row">
                    <img src={getImgSrc(item.product.image)} alt={item.product.name} className="order-item-img" crossOrigin="anonymous"/>
                    <div className="order-item-desc">
                      <div className="order-item-name">{item.product.name}</div>
                      <div className="order-item-cat">{item.product.category?.name}</div>
                    </div>
                    <div className="order-item-qty">x{item.quantity}</div>
                    <div className="order-item-price">{formatVND(item.product.price)}</div>
                    <div className="order-item-sum">{formatVND(item.product.price * item.quantity)}</div>
                  </div>
                );
              })}
            </div>

            <div className="order-detail-footer">
              <div className="order-detail-total-row">
                <span>Tổng cộng:</span>
                <span className="order-detail-total-val">{formatVND(order.total)}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }
}

export default Myorders;