import axios from 'axios';
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import MyContext from '../contexts/MyContext';
import './Myorders.css'; // 👈 thêm

class Myorders extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      order: null
    };
  }

  render() {
    if (this.context.token === '') return <Navigate replace to="/login" />;

    const orders = this.state.orders.map((item) => (
      <tr key={item._id} onClick={() => this.trItemClick(item)} className="order-row">
        <td>{item._id}</td>
        <td>{new Date(item.cdate).toLocaleString()}</td>
        <td>{item.customer.name}</td>
        <td>{item.customer.phone}</td>
        <td>${item.total}</td>
        <td className="status">{item.status}</td>
      </tr>
    ));

    let items = null;
    if (this.state.order) {
      items = this.state.order.items.map((item, index) => (
        <tr key={item.product._id}>
          <td>{index + 1}</td>
          <td>{item.product.name}</td>
          <td>
            <img
              src={"data:image/jpg;base64," + item.product.image}
              alt=""
              className="order-img"
            />
          </td>
          <td>${item.product.price}</td>
          <td>{item.quantity}</td>
          <td>${item.product.price * item.quantity}</td>
        </tr>
      ));
    }

    return (
      <div className="orders-container">

        {/* ORDER LIST */}
        <h2 className="orders-title">📦 ORDER LIST</h2>

        <div className="orders-table-wrapper">
          <table className="orders-table">
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

        {/* ORDER DETAIL */}
        {this.state.order && (
          <>
            <h2 className="orders-title">📋 ORDER DETAIL</h2>

            <div className="orders-table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Product</th>
                    <th>Image</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>{items}</tbody>
              </table>
            </div>
          </>
        )}

      </div>
    );
  }

  componentDidMount() {
    if (this.context.customer) {
      const cid = this.context.customer._id;
      this.apiGetOrdersByCustID(cid);
    }
  }

  // event
  trItemClick(item) {
    this.setState({ order: item });
  }

  // api
  apiGetOrdersByCustID(cid) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/customer/orders/customer/' + cid, config).then((res) => {
      this.setState({ orders: res.data });
    });
  }
}

export default Myorders;