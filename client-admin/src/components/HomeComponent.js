import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import MyContext from '../contexts/MyContext';
import './Home.css';

const VND_RATE = 24000;
function formatVND(usd) {
  const value = Number(usd) || 0;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(value * VND_RATE));
}
function formatDate(ms) {
  const d = new Date(ms);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

class Home extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      customers: [],
      orders: [],
      products: [],
      loading: true
    };
  }

  componentDidMount() {
    this.apiGetDashboardData();
  }

  apiGetDashboardData() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.all([
      axios.get('/api/admin/customers', config),
      axios.get('/api/admin/orders', config),
      axios.get('/api/admin/products', config)
    ]).then(axios.spread((custRes, orderRes, prodRes) => {
      this.setState({
        customers: custRes.data,
        orders: orderRes.data,
        products: prodRes.data || [],
        loading: false
      });
    })).catch(() => this.setState({ loading: false }));
  }

  render() {
    const { customers, orders, products, loading } = this.state;

    // --- Tính toán số liệu ---
    const totalRevenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
    const now = new Date();

    const ordersToday = orders.filter(o => {
      const d = new Date(o.cdate);
      return d.toDateString() === now.toDateString();
    });
    const ordersThisMonth = orders.filter(o => {
      const d = new Date(o.cdate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const buyersToday = new Set(ordersToday.map(o => o.customer?._id)).size;
    const buyersThisMonth = new Set(ordersThisMonth.map(o => o.customer?._id)).size;

    // --- Top 6 khách hàng ---
    const customerStats = customers.map(c => {
      const co = orders.filter(o => o.customer?._id === c._id);
      return { ...c, totalOrders: co.length, totalSpent: co.reduce((s, o) => s + Number(o.total || 0), 0) };
    });
    const topCustomers = [...customerStats].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
    const maxSpent = topCustomers[0]?.totalSpent || 1;

    // --- Biểu đồ 7 ngày qua ---
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (6 - i));
      const dayOrders = orders.filter(o => {
        const od = new Date(o.cdate);
        return od.toDateString() === date.toDateString();
      });
      return {
        label: `${date.getDate()}/${date.getMonth() + 1}`,
        revenue: dayOrders.reduce((s, o) => s + Number(o.total || 0), 0),
        count: dayOrders.length
      };
    });
    const maxRevenue = Math.max(...last7Days.map(d => d.revenue), 1);

    // --- 8 đơn hàng gần nhất ---
    const recentOrders = [...orders].sort((a, b) => b.cdate - a.cdate).slice(0, 8);

    // --- Trạng thái đơn hàng ---
    const pending   = orders.filter(o => o.status === 'PENDING').length;
    const delivered = orders.filter(o => o.status === 'DELIVERED').length;
    const cancelled = orders.filter(o => o.status === 'CANCELLED').length;

    return (
      <div className="admin-home">

        {/* KPI Cards */}
        <div className="kpi-grid">
          <Link to="/admin/product" className="kpi-card">
            <div className="kpi-info">
              <div className="kpi-value">{loading ? '...' : products.length}</div>
              <div className="kpi-label">Sản phẩm</div>
            </div>
          </Link>

          <Link to="/admin/order" className="kpi-card">
            <div className="kpi-info">
              <div className="kpi-value">{loading ? '...' : orders.length}</div>
              <div className="kpi-label">Tổng đơn hàng</div>
              <div className="kpi-trend">+{ordersToday.length} hôm nay</div>
            </div>
          </Link>

          <Link to="/admin/customer" className="kpi-card">
            <div className="kpi-info">
              <div className="kpi-value">{loading ? '...' : customers.length}</div>
              <div className="kpi-label">Khách hàng</div>
              <div className="kpi-trend">+{buyersThisMonth} tháng này</div>
            </div>
          </Link>

          <div className="kpi-card" style={{cursor: 'default'}}>
            <div className="kpi-info">
              <div className="kpi-value" style={{fontSize:'15px'}}>{loading ? '...' : formatVND(totalRevenue)}</div>
              <div className="kpi-label">Tổng doanh thu</div>
            </div>
          </div>
        </div>

        {/* Row 2: Revenue Chart + Order Status */}
        <div className="dashboard-grid">

          {/* Revenue bar chart */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>Doanh thu 7 ngày gần nhất</h3>
              <span>{ordersThisMonth.length} đơn tháng này</span>
            </div>
            <div className="panel-body">
              <div className="revenue-chart">
                {last7Days.map(day => (
                  <div key={day.label} className="rev-col">
                    <div className="rev-bar-wrap">
                      <div
                        className="rev-bar"
                        style={{ height: `${Math.max((day.revenue / maxRevenue) * 120, 4)}px` }}
                        title={formatVND(day.revenue)}
                      >
                        {day.count > 0 && <span className="rev-bar-tip">{day.count}</span>}
                      </div>
                    </div>
                    <div className="rev-label">{day.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order status breakdown */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>Trạng thái đơn hàng</h3>
              <span>Tổng: {orders.length}</span>
            </div>
            <div className="panel-body">
              <div className="order-status-list">
                <div className="order-status-row">
                  <span className="badge badge-warning">Chờ xử lý</span>
                  <div className="order-status-bar-wrap">
                    <div className="order-status-bar pending-bar" style={{width: `${orders.length ? (pending/orders.length)*100 : 0}%`}}></div>
                  </div>
                  <span className="order-status-num">{pending}</span>
                </div>
                <div className="order-status-row">
                  <span className="badge badge-success">Đã giao</span>
                  <div className="order-status-bar-wrap">
                    <div className="order-status-bar delivered-bar" style={{width: `${orders.length ? (delivered/orders.length)*100 : 0}%`}}></div>
                  </div>
                  <span className="order-status-num">{delivered}</span>
                </div>
                <div className="order-status-row">
                  <span className="badge badge-danger">Đã hủy</span>
                  <div className="order-status-bar-wrap">
                    <div className="order-status-bar cancelled-bar" style={{width: `${orders.length ? (cancelled/orders.length)*100 : 0}%`}}></div>
                  </div>
                  <span className="order-status-num">{cancelled}</span>
                </div>
              </div>

              <div className="mini-stats-grid">
                <div className="mini-stat">
                  <div className="mini-stat-num blue">{buyersToday}</div>
                  <div className="mini-stat-label">Mua hôm nay</div>
                </div>
                <div className="mini-stat">
                  <div className="mini-stat-num purple">{buyersThisMonth}</div>
                  <div className="mini-stat-label">Mua tháng này</div>
                </div>
              </div>

              {/* Top customers mini chart */}
              <div className="mini-section-title">Khách chi nhiều nhất</div>
              <div className="chart-list">
                {topCustomers.map((c, i) => (
                  <div key={c._id} className="chart-row">
                    <div className="chart-meta">
                      <span className="chart-rank">#{i+1}</span>
                      <span className="chart-name">{c.name || c.username}</span>
                    </div>
                    <div className="bar-container">
                      <div className="chart-bar" style={{width: `${Math.max((c.totalSpent/maxSpent)*100, 5)}%`}} />
                    </div>
                    <div className="chart-value">{formatVND(c.totalSpent)}</div>
                  </div>
                ))}
                {topCustomers.length === 0 && <div className="no-data">Chưa có dữ liệu mua hàng.</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Recent Orders */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3>Đơn hàng gần đây</h3>
            <Link to="/admin/order" style={{fontSize:'12.5px', color:'var(--admin-accent)', fontWeight:600}}>Xem tất cả →</Link>
          </div>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order._id}>
                    <td title={order._id}><code style={{fontSize:'11px', color:'var(--admin-text-muted)'}}>{order._id?.slice(-8)}</code></td>
                    <td><strong>{order.customer?.name || order.customer?.username}</strong></td>
                    <td>{formatDate(order.cdate)}</td>
                    <td style={{fontWeight:700, color:'var(--admin-accent)'}}>{formatVND(order.total)}</td>
                    <td>
                      {order.status === 'PENDING'   && <span className="badge badge-warning">Chờ xử lý</span>}
                      {order.status === 'DELIVERED' && <span className="badge badge-success">Đã giao</span>}
                      {order.status === 'CANCELLED' && <span className="badge badge-danger">Đã hủy</span>}
                      {!['PENDING','DELIVERED','CANCELLED'].includes(order.status) && <span className="badge badge-muted">{order.status}</span>}
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr><td colSpan="5" className="no-data">Chưa có đơn hàng nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  }
}

export default Home;