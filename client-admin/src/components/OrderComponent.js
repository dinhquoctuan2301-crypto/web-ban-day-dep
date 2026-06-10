import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import './Order.css';

const VND_RATE = 24000;
function formatVND(usd) {
  const value = Number(usd) || 0;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(value * VND_RATE));
}
function formatDate(ms) {
  return new Date(ms).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

const STATUS_MAP = {
  ALL:       { label: 'Tất cả', badge: 'badge-muted' },
  PENDING:   { label: 'Chờ xử lý', badge: 'badge-warning' },
  DELIVERED: { label: 'Đã giao',   badge: 'badge-success' },
  CANCELLED: { label: 'Đã hủy',   badge: 'badge-danger' },
};

class Order extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      order: null,
      filterStatus: 'ALL',
      toast: null,
      confirmModal: null,  // { id, action }
    };
  }

  componentDidMount() { this.apiGetOrders(); }

  showToast(msg, type = 'success') {
    this.setState({ toast: { msg, type } });
    setTimeout(() => this.setState({ toast: null }), 2500);
  }

  get filteredOrders() {
    const { orders, filterStatus } = this.state;
    if (filterStatus === 'ALL') return orders;
    return orders.filter(o => o.status === filterStatus);
  }

  handleStatusChange(id, newStatus) {
    this.setState({ confirmModal: { id, newStatus } });
  }

  confirmAction = () => {
    const { id, newStatus } = this.state.confirmModal;
    this.setState({ confirmModal: null });
    this.apiPutOrderStatus(id, newStatus);
  }

  render() {
    const { order, filterStatus, toast, confirmModal } = this.state;
    const filtered = this.filteredOrders;

    return (
      <div className="order-wrap">

        {/* Toast */}
        {toast && (
          <div className={`admin-toast admin-toast--${toast.type}`}>
            {toast.msg}
          </div>
        )}

        {/* Confirm Modal */}
        {confirmModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal" style={{maxWidth:'360px', textAlign:'center'}}>

              <h3 style={{marginBottom:'8px'}}>Xác nhận thay đổi</h3>
              <p style={{color:'var(--admin-text-muted)', fontSize:'14px', marginBottom:'24px'}}>
                Bạn có chắc muốn đổi trạng thái sang <strong>
                  {STATUS_MAP[confirmModal.newStatus]?.label}
                </strong>?
              </p>
              <div style={{display:'flex', gap:'12px', justifyContent:'center'}}>
                <button className="btn-danger" onClick={() => this.setState({ confirmModal: null })}>
                  Hủy bỏ
                </button>
                <button className="btn-primary" onClick={this.confirmAction}>
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="order-filter-tabs">
          {Object.entries(STATUS_MAP).map(([key, val]) => (
            <button
              key={key}
              className={`filter-tab ${filterStatus === key ? 'active' : ''}`}
              onClick={() => this.setState({ filterStatus: key })}
            >
              {val.label}
              <span className="filter-tab-count">
                {key === 'ALL' ? this.state.orders.length : this.state.orders.filter(o => o.status === key).length}
              </span>
            </button>
          ))}
        </div>

        {/* Order List Panel */}
        <div className="admin-panel">
          <div className="panel-header">
            <h3>Danh sách đơn hàng</h3>
            <span>{filtered.length} đơn hàng</span>
          </div>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Ngày đặt</th>
                  <th>Khách hàng</th>
                  <th>SĐT</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  if (!item?.customer) return null;
                  const isSelected = order?._id === item._id;
                  return (
                    <tr
                      key={item._id}
                      className={`order-row ${isSelected ? 'selected' : ''}`}
                      onClick={() => this.setState({ order: item })}
                    >
                      <td><code className="order-id-code">{item._id?.slice(-8)}</code></td>
                      <td>{formatDate(item.cdate)}</td>
                      <td><strong>{item.customer?.name}</strong></td>
                      <td>{item.customer?.phone}</td>
                      <td className="order-price">{formatVND(item.total)}</td>
                      <td>
                        <span className={`badge ${STATUS_MAP[item.status]?.badge || 'badge-muted'}`}>
                          {STATUS_MAP[item.status]?.label || item.status}
                        </span>
                      </td>
                      <td>
                        {item.status === 'PENDING' && (
                          <div className="order-action-group" onClick={e => e.stopPropagation()}>
                            <button
                              className="btn-success"
                              onClick={() => this.handleStatusChange(item._id, 'DELIVERED')}
                            >
                              Duyệt
                            </button>
                            <button
                              className="btn-danger"
                              onClick={() => this.handleStatusChange(item._id, 'CANCELLED')}
                            >
                              Hủy
                            </button>
                          </div>
                        )}
                        {item.status !== 'PENDING' && (
                          <span style={{color:'var(--admin-text-muted)', fontSize:'12px'}}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan="7" className="no-data">Không có đơn hàng nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Detail */}
        {order && (
          <div className="admin-panel order-detail-panel">
            <div className="panel-header">
              <div>
                <h3>Chi tiết đơn hàng</h3>
                <p style={{fontSize:'12px', color:'var(--admin-text-muted)', marginTop:'2px'}}>
                  Đơn #{order._id?.slice(-8)} — {order.customer?.name} — {formatDate(order.cdate)}
                </p>
              </div>
              <button
                className="admin-modal-close"
                onClick={() => this.setState({ order: null })}
                style={{position:'relative', top:'unset', right:'unset'}}
              >✕</button>
            </div>
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Đơn giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, idx) => item.product ? (
                    <tr key={item.product._id || idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <img
                          src={item.product.image?.startsWith('data:') ? item.product.image : 'data:image/jpg;base64,' + item.product.image}
                          alt={item.product.name}
                          className="order-item-img"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      </td>
                      <td><strong>{item.product.name}</strong></td>
                      <td>{formatVND(item.product.price)}</td>
                      <td><span className="badge badge-info">{item.quantity}</span></td>
                      <td style={{fontWeight:700, color:'var(--admin-accent)'}}>{formatVND(item.product.price * item.quantity)}</td>
                    </tr>
                  ) : null)}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="5" style={{textAlign:'right', fontWeight:700, paddingRight:'16px'}}>Tổng cộng:</td>
                    <td style={{fontWeight:800, color:'var(--admin-accent)', fontSize:'15px'}}>{formatVND(order.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

      </div>
    );
  }

  trItemClick(item) { this.setState({ order: item }); }

  apiGetOrders() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/orders', config).then(res => {
      this.setState({ orders: res.data });
    });
  }

  apiPutOrderStatus(id, status) {
    const body = { status };
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/admin/orders/status/' + id, body, config).then(res => {
      if (res.data) {
        this.showToast(`Cập nhật trạng thái thành công!`, 'success');
        this.apiGetOrders();
      } else {
        this.showToast('Cập nhật thất bại', 'error');
      }
    });
  }
}

export default Order;