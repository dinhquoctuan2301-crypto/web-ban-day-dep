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

class Home extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      customers: [],
      orders: [],
      loading: true
    };
  }

  componentDidMount() {
    this.apiGetDashboardData();
  }

  apiGetDashboardData() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .all([
        axios.get('/api/admin/customers', config),
        axios.get('/api/admin/orders', config)
      ])
      .then(
        axios.spread((custRes, orderRes) => {
          this.setState({
            customers: custRes.data,
            orders: orderRes.data,
            loading: false
          });
        })
      )
      .catch(() => this.setState({ loading: false }));
  }

  render() {
    const { customers, orders, loading } = this.state;

    const customerStats = customers.map((cust) => {
      const customerOrders = orders.filter((order) => order.customer?._id === cust._id);
      const totalOrders = customerOrders.length;
      const totalSpent = customerOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
      return {
        ...cust,
        totalOrders,
        totalSpent
      };
    });

    const sortedBySpent = [...customerStats].sort((a, b) => b.totalSpent - a.totalSpent);
    const topCustomers = sortedBySpent.slice(0, 6);
    const maxSpent = topCustomers.length > 0 ? topCustomers[0].totalSpent : 0;
    const totalOrdersCount = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const ordersToday = orders.filter((order) => {
      const date = new Date(order.cdate);
      return date.toDateString() === today.toDateString();
    });
    const ordersThisMonth = orders.filter((order) => {
      const date = new Date(order.cdate);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    const buyersToday = new Set(ordersToday.map((order) => order.customer?._id)).size;
    const buyersThisMonth = new Set(ordersThisMonth.map((order) => order.customer?._id)).size;

    const monthlyBuyerCounts = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (6 - index));
      const count = orders.filter((order) => {
        const orderDate = new Date(order.cdate);
        return (
          orderDate.getDate() === date.getDate() &&
          orderDate.getMonth() === date.getMonth() &&
          orderDate.getFullYear() === date.getFullYear()
        );
      }).reduce((set, order) => set.add(order.customer?._id), new Set()).size;
      return {
        label: `${date.getDate()}/${date.getMonth() + 1}`,
        count
      };
    });

    const lastHours = Array.from({ length: 8 }).map((_, index) => {
      const hour = (now.getHours() - 7 + index + 24) % 24;
      const count = ordersToday.filter((order) => {
        const orderDate = new Date(order.cdate);
        return orderDate.getHours() === hour;
      }).length;
      return {
        label: `${hour}:00`,
        count
      };
    });

    const maxDayCount = Math.max(...monthlyBuyerCounts.map((item) => item.count), 1);
    const maxHourCount = Math.max(...lastHours.map((item) => item.count), 1);

    return (
      <div className="admin-home">

        <h2 className="admin-title">ADMIN DASHBOARD</h2>

        <div className="dashboard">
          <Link to="/admin/product" className="card card-blue">
            <span>👟 Products</span>
            <div className="card-subtitle">Manage products</div>
          </Link>

          <Link to="/admin/order" className="card card-green">
            <span>📦 Orders</span>
            <div className="card-subtitle">Track orders</div>
          </Link>

          <Link to="/admin/category" className="card card-orange">
            <span>🗂 Categories</span>
            <div className="card-subtitle">Manage categories</div>
          </Link>

          <Link to="/admin/customer" className="card card-red">
            <span>👤 Customers</span>
            <div className="card-subtitle">User management</div>
          </Link>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>User information</h3>
              <span>{loading ? 'Loading users…' : `${customers.length} users found`}</span>
            </div>
            <div className="table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Orders</th>
                    <th>Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {customerStats.map((cust) => (
                    <tr key={cust._id}>
                      <td title={cust._id}>{cust._id ? cust._id.slice(-8) : ''}</td>
                      <td>{cust.username}</td>
                      <td>{cust.name}</td>
                      <td>{cust.email}</td>
                      <td>{cust.phone}</td>
                      <td>{cust.active === 1 ? 'Active' : 'Inactive'}</td>
                      <td>{cust.totalOrders}</td>
                      <td>{formatVND(cust.totalSpent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dashboard-panel chart-panel">
            <div className="panel-header">
              <h3>Purchase chart</h3>
              <span>{loading ? 'Loading chart…' : `${totalOrdersCount} total orders`}</span>
            </div>
            <div className="chart-summary">
              <div className="summary-item">
                <div className="summary-number">{totalOrdersCount}</div>
                <div className="summary-label">Total Orders</div>
              </div>
              <div className="summary-item">
                <div className="summary-number">{formatVND(totalRevenue)}</div>
                <div className="summary-label">Total Revenue</div>
              </div>
              <div className="summary-item">
                <div className="summary-number">{customers.length}</div>
                <div className="summary-label">Total Customers</div>
              </div>
            </div>
            <div className="chart-summary extra-summary">
              <div className="summary-item summary-accent bg-blue">
                <div className="summary-number">{buyersThisMonth}</div>
                <div className="summary-label">Buyers this month</div>
              </div>
              <div className="summary-item summary-accent bg-purple">
                <div className="summary-number">{buyersToday}</div>
                <div className="summary-label">Buyers today</div>
              </div>
            </div>

            <div className="mini-charts">
              <div className="mini-chart-card">
                <div className="mini-chart-header">
                  <div>
                    <div className="mini-chart-title">Monthly buyers</div>
                    <div className="mini-chart-subtitle">Last 7 days</div>
                  </div>
                  <div className="mini-chart-value">{buyersThisMonth} buyers</div>
                </div>
                <div className="mini-chart-bars">
                  {monthlyBuyerCounts.map((item) => (
                    <div key={item.label} className="mini-chart-row">
                      <div className="mini-chart-label">{item.label}</div>
                      <div className="mini-chart-track">
                        <div
                          className="mini-chart-fill blue-fill"
                          style={{ width: `${(item.count / maxDayCount) * 100}%` }}
                        />
                      </div>
                      <div className="mini-chart-count">{item.count}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mini-chart-card">
                <div className="mini-chart-header">
                  <div>
                    <div className="mini-chart-title">Daily buyers</div>
                    <div className="mini-chart-subtitle">Last 8 hours</div>
                  </div>
                  <div className="mini-chart-value">{buyersToday} buyers</div>
                </div>
                <div className="mini-chart-bars">
                  {lastHours.map((item) => (
                    <div key={item.label} className="mini-chart-row">
                      <div className="mini-chart-label">{item.label}</div>
                      <div className="mini-chart-track">
                        <div
                          className="mini-chart-fill purple-fill"
                          style={{ width: `${(item.count / maxHourCount) * 100}%` }}
                        />
                      </div>
                      <div className="mini-chart-count">{item.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="chart-list">
              {topCustomers.map((cust, index) => {
                const percent = maxSpent > 0 ? (cust.totalSpent / maxSpent) * 100 : 0;
                return (
                  <div key={cust._id} className="chart-row">
                    <div className="chart-meta">
                      <span className="chart-rank">#{index + 1}</span>
                      <span className="chart-name">{cust.name || cust.username}</span>
                    </div>
                    <div className="bar-container">
                      <div className="chart-bar" style={{ width: `${Math.max(percent, 5)}%` }} />
                    </div>
                    <div className="chart-value">{formatVND(cust.totalSpent)}</div>
                  </div>
                );
              })}
              {topCustomers.length === 0 && (
                <div className="no-data">No purchase data available yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;