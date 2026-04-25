import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import './Order.css'; // 👈 thêm CSS

const VND_RATE = 24000;
function formatVND(usd) {
  const value = Number(usd) || 0;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(value * VND_RATE));
}

class Order extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      order: null
    };
  }

  render() {
    const orders = this.state.orders.map((item) => {
      if (!item || !item.customer) return null; // 👈 chống crash

      return (
        <tr key={item._id} className="order-row" onClick={() => this.trItemClick(item)}>
          <td>{item._id}</td>
          <td>{new Date(item.cdate).toLocaleString()}</td>
          <td>{item.customer?.name}</td>
          <td>{item.customer?.phone}</td>
          <td className="price">{formatVND(item.total)}</td>
          <td>
            <span className={`status ${item.status.toLowerCase()}`}>
              {item.status}
            </span>
          </td>
          <td>
            {item.status === 'PENDING' && (
              <div className="action-group">
                <button
                  className="btn approve"
                  onClick={(e) => {
                    e.stopPropagation();
                    this.lnkApproveClick(item._id);
                  }}
                >
                  ✔ APPROVE
                </button>
                <button
                  className="btn cancel"
                  onClick={(e) => {
                    e.stopPropagation();
                    this.lnkCancelClick(item._id);
                  }}
                >
                  ✖ CANCEL
                </button>
              </div>
            )}
          </td>
        </tr>
      );
    });

    let items = null;
    if (this.state.order && this.state.order.items) {
      items = this.state.order.items.map((item, index) => {
        if (!item.product) return null;

        return (
          <tr key={item.product._id}>
            <td>{index + 1}</td>
            <td>{item.product._id}</td>
            <td>{item.product.name}</td>
            <td>
              <img
                src={"data:image/jpg;base64," + item.product.image}
                alt=""
                className="order-img"
              />
            </td>
            <td>{formatVND(item.product.price)}</td>
            <td>{item.quantity}</td>
            <td>{formatVND(item.product.price * item.quantity)}</td>
          </tr>
        );
      });
    }

    return (
      <div className="order-container">

        {/* ORDER LIST */}
        <div className="order-card">
          <h2>📦 ORDER LIST</h2>
          <table className="order-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>{orders}</tbody>
          </table>
        </div>

        {/* ORDER DETAIL */}
        {this.state.order && (
          <div className="order-card">
            <h2>🧾 ORDER DETAIL</h2>
            <table className="order-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Image</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>{items}</tbody>
            </table>
          </div>
        )}

      </div>
    );
  }

  componentDidMount() {
    this.apiGetOrders();
  }

  // EVENTS
  trItemClick(item) {
    this.setState({ order: item });
  }

  lnkApproveClick(id) {
    this.apiPutOrderStatus(id, 'APPROVED');
  }

  lnkCancelClick(id) {
    this.apiPutOrderStatus(id, 'CANCELED');
  }

  // API
  apiGetOrders() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/orders', config).then((res) => {
      this.setState({ orders: res.data });
    });
  }

  apiPutOrderStatus(id, status) {
    const body = { status: status };
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/admin/orders/status/' + id, body, config).then((res) => {
      if (res.data) {
        this.apiGetOrders();
      } else {
        alert('Error!');
      }
    });
  }
}

export default Order;