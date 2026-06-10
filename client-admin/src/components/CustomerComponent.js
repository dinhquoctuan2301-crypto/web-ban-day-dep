import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import './Customer.css';

const VND_RATE = 24000;
function formatVND(usd) {
  const value = Number(usd) || 0;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(value * VND_RATE));
}
function formatDate(ms) {
  return new Date(ms).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' });
}

const STATUS_MAP = {
  PENDING:   { label: 'Chờ xử lý', badge: 'badge-warning' },
  DELIVERED: { label: 'Đã giao',   badge: 'badge-success' },
  CANCELLED: { label: 'Đã hủy',   badge: 'badge-danger' },
};

class Customer extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      customers: [],
      orders: [],
      order: null,
      selectedCustomer: null,
      toast: null,
      searchText: ''
    };
  }

  componentDidMount() { this.apiGetCustomers(); }

  showToast(msg, type = 'success') {
    this.setState({ toast: { msg, type } });
    setTimeout(() => this.setState({ toast: null }), 2500);
  }

  get filteredCustomers() {
    const { customers, searchText } = this.state;
    if (!searchText) return customers;
    const q = searchText.toLowerCase();
    return customers.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.username?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    );
  }

  render() {
    const { orders, order, selectedCustomer, toast, searchText } = this.state;
    const filtered = this.filteredCustomers;

    return (
      <div className="customer-wrap">

        {/* Toast */}
        {toast && (
          <div className={`admin-toast admin-toast--${toast.type}`}>{toast.msg}</div>
        )}

        {/* Customer List */}
        <div className="admin-panel">
          <div className="panel-header">
            <h3>Danh sách khách hàng</h3>
            <input
              type="text"
              className="customer-search"
              placeholder="Tìm theo tên, email, SĐT..."
              value={searchText}
              onChange={e => this.setState({ searchText: e.target.value })}
            />
          </div>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>SĐT</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const isSelected = selectedCustomer?._id === item._id;
                  return (
                    <tr
                      key={item._id}
                      className={`customer-row ${isSelected ? 'selected' : ''}`}
                      onClick={() => this.trCustomerClick(item)}
                    >
                      <td>
                        <div className="customer-name-cell">
                          <div className="customer-avatar-sm">
                            {item.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="customer-name">{item.name}</div>
                            <div className="customer-id-text">{item._id?.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td>{item.username}</td>
                      <td>{item.email}</td>
                      <td>{item.phone}</td>
                      <td>
                        {item.active === 1
                          ? <span className="badge badge-success">Hoạt động</span>
                          : <span className="badge badge-danger">Chưa kích hoạt</span>
                        }
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        {item.active === 0 ? (
                          <button
                            className="btn-primary"
                            style={{fontSize:'12px', padding:'6px 12px'}}
                            onClick={() => this.lnkEmailClick(item)}
                          >
                            Gửi email kích hoạt
                          </button>
                        ) : (
                          <button
                            className="btn-danger"
                            onClick={() => this.lnkDeactiveClick(item)}
                          >
                            Vô hiệu hóa
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan="6" className="no-data">Không tìm thấy khách hàng nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Orders */}
        {selectedCustomer && orders.length >= 0 && (
          <div className="admin-panel">
            <div className="panel-header">
              <div>
                <h3>Lịch sử mua hàng của: <span style={{color:'var(--admin-accent)'}}>{selectedCustomer.name}</span></h3>
                <p style={{fontSize:'12px', color:'var(--admin-text-muted)', marginTop:'2px'}}>{orders.length} đơn hàng</p>
              </div>
              <button
                className="admin-modal-close"
                style={{position:'relative',top:'unset',right:'unset'}}
                onClick={() => this.setState({ selectedCustomer: null, orders: [], order: null })}
              >✕</button>
            </div>
            <div className="table-wrap">
              {orders.length === 0 ? (
                <div className="no-data">Khách hàng này chưa có đơn hàng nào.</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Ngày đặt</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr
                        key={o._id}
                        className={`customer-row ${order?._id === o._id ? 'selected' : ''}`}
                        onClick={() => this.setState({ order: o })}
                      >
                        <td><code className="order-id-code">{o._id?.slice(-8)}</code></td>
                        <td>{formatDate(o.cdate)}</td>
                        <td style={{fontWeight:700, color:'var(--admin-accent)'}}>{formatVND(o.total)}</td>
                        <td>
                          <span className={`badge ${STATUS_MAP[o.status]?.badge || 'badge-muted'}`}>
                            {STATUS_MAP[o.status]?.label || o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Order Detail */}
        {order && (
          <div className="admin-panel">
            <div className="panel-header">
              <h3>Chi tiết đơn #{order._id?.slice(-8)}</h3>
              <button
                className="admin-modal-close"
                style={{position:'relative',top:'unset',right:'unset'}}
                onClick={() => this.setState({ order: null })}
              >✕</button>
            </div>
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Ảnh</th>
                    <th>Sản phẩm</th>
                    <th>Đơn giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, idx) => item.product ? (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <img
                          src={item.product.image?.startsWith('data:') ? item.product.image : 'data:image/jpg;base64,' + item.product.image}
                          alt={item.product.name}
                          className="order-item-img"
                          onError={e => { e.target.style.display='none'; }}
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
                    <td colSpan="5" style={{textAlign:'right', fontWeight:700}}>Tổng cộng:</td>
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

  trCustomerClick(item) {
    this.setState({ selectedCustomer: item, orders: [], order: null });
    this.apiGetOrdersByCustID(item._id);
  }

  lnkDeactiveClick(item) { this.apiPutCustomerDeactive(item._id, item.token); }
  lnkEmailClick(item)    { this.apiGetCustomerSendmail(item._id); }

  apiGetCustomers() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/customers', config).then(res => {
      this.setState({ customers: res.data });
    });
  }

  apiGetOrdersByCustID(cid) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/orders/customer/' + cid, config).then(res => {
      this.setState({ orders: res.data });
    });
  }

  apiPutCustomerDeactive(id, token) {
    const body = { token };
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/admin/customers/deactive/' + id, body, config).then(res => {
      if (res.data) {
        this.showToast('Đã vô hiệu hóa tài khoản!', 'success');
        this.apiGetCustomers();
      }
    });
  }

  apiGetCustomerSendmail(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/customers/sendmail/' + id, config).then(res => {
      this.showToast(res.data.message, res.data.success ? 'success' : 'error');
    });
  }
}

export default Customer;