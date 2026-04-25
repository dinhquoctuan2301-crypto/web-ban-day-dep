import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import './Customer.css';

const VND_RATE = 24000;
function formatVND(usd) {
  const value = Number(usd) || 0;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(value * VND_RATE));
}

class Customer extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      customers: [],
      orders: [],
      order: null
    };
  }

  render() {
    const customers = this.state.customers.map((item) => (
      <tr key={item._id} onClick={() => this.trCustomerClick(item)}>
        <td>{item._id}</td>
        <td>{item.username}</td>
        <td>{item.name}</td>
        <td>{item.phone}</td>
        <td>{item.email}</td>
        <td>{item.active === 1 ? 'Active' : 'Inactive'}</td>
        <td>
          {item.active === 0 ? (
            <span
              className="action-btn btn-email"
              onClick={(e) => {
                e.stopPropagation();
                this.lnkEmailClick(item);
              }}
            >
              EMAIL
            </span>
          ) : (
            <span
              className="action-btn btn-deactive"
              onClick={(e) => {
                e.stopPropagation();
                this.lnkDeactiveClick(item);
              }}
            >
              DEACTIVE
            </span>
          )}
        </td>
      </tr>
    ));

    const orders = this.state.orders.map((item) => (
      <tr key={item._id} onClick={() => this.trOrderClick(item)}>
        <td>{item._id}</td>
        <td>{new Date(item.cdate).toLocaleString()}</td>
        <td>{item.customer.name}</td>
        <td>{item.customer.phone}</td>
        <td>{formatVND(item.total)}</td>
        <td>{item.status}</td>
      </tr>
    ));

    let items = [];
    if (this.state.order) {
      items = this.state.order.items.map((item, index) => (
        <tr key={item.product._id}>
          <td>{index + 1}</td>
          <td>{item.product._id}</td>
          <td>{item.product.name}</td>
          <td>
            <img
              src={"data:image/jpg;base64," + item.product.image}
              width="60"
              className="img-small"
              alt=""
            />
          </td>
          <td>{formatVND(item.product.price)}</td>
          <td>{item.quantity}</td>
          <td>{formatVND(item.product.price * item.quantity)}</td>
        </tr>
      ));
    }

    return (
      <div className="customer-container">

        {/* CUSTOMER */}
        <h2 className="section-title">CUSTOMER LIST</h2>
        <table className="table-custom">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>{customers}</tbody>
        </table>

        {/* ORDERS */}
        {this.state.orders.length > 0 && (
          <div className="section">
            <h2 className="section-title">ORDER LIST</h2>
            <table className="table-custom">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>{orders}</tbody>
            </table>
          </div>
        )}

        {/* ORDER DETAIL */}
        {this.state.order && (
          <div className="section">
            <h2 className="section-title">ORDER DETAIL</h2>
            <table className="table-custom">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Image</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
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
    this.apiGetCustomers();
  }

  trCustomerClick(item) {
    this.setState({ orders: [], order: null });
    this.apiGetOrdersByCustID(item._id);
  }

  trOrderClick(item) {
    this.setState({ order: item });
  }

  lnkDeactiveClick(item) {
    this.apiPutCustomerDeactive(item._id, item.token);
  }

  lnkEmailClick(item) {
    this.apiGetCustomerSendmail(item._id);
  }

  // APIs
  apiGetCustomers() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/customers', config).then((res) => {
      this.setState({ customers: res.data });
    });
  }

  apiGetOrdersByCustID(cid) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/orders/customer/' + cid, config).then((res) => {
      this.setState({ orders: res.data });
    });
  }

  apiPutCustomerDeactive(id, token) {
    const body = { token: token };
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/admin/customers/deactive/' + id, body, config).then((res) => {
      if (res.data) {
        this.apiGetCustomers();
      }
    });
  }

  apiGetCustomerSendmail(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/customers/sendmail/' + id, config).then((res) => {
      alert(res.data.message);
    });
  }
}

export default Customer;