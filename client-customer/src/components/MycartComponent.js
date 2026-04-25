import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import CartUtil from '../utils/CartUtil';
import withRouter from '../utils/withRouter';
import './Mycart.css';

const VND_RATE = 24000;
function formatVND(usd) {
  const value = Number(usd) || 0;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(value * VND_RATE));
}

class Mycart extends Component {
  static contextType = MyContext;

  render() {
    const mycart = this.context.mycart.map((item, index) => (
      <tr key={item.product._id}>
        <td>{index + 1}</td>
        <td>{item.product.name}</td>
        <td>{item.product.category.name}</td>
        <td>
          <img
            src={"data:image/jpg;base64," + item.product.image}
            alt=""
            className="cart-img"
          />
        </td>
        <td>{formatVND(item.product.price)}</td>
        <td>{item.quantity}</td>
        <td>{formatVND(item.product.price * item.quantity)}</td>
        <td>
          <button
            className="btn-remove"
            onClick={() => this.lnkRemoveClick(item.product._id)}
          >
            Remove
          </button>
        </td>
      </tr>
    ));

    return (
      <div className="cart-container">

        <h2 className="cart-title">YOUR CART</h2>

        <div className="cart-table-wrapper">
          <table className="cart-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Name</th>
                <th>Category</th>
                <th>Image</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {mycart}

              <tr className="cart-total-row">
                <td colSpan="5"></td>
                <td><b>Total</b></td>
                <td><b>{formatVND(CartUtil.getTotal(this.context.mycart))}</b></td>
                <td>
                  <button
                    className="btn-checkout"
                    onClick={() => this.lnkCheckoutClick()}
                  >
                    CHECKOUT
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    );
  }

  // event-handlers
  lnkRemoveClick(id) {
    const mycart = this.context.mycart;
    const index = mycart.findIndex(x => x.product._id === id);
    if (index !== -1) {
      mycart.splice(index, 1);
      this.context.setMycart(mycart);
    }
  }

  lnkCheckoutClick() {
    if (window.confirm('ARE YOU SURE?')) {
      if (this.context.mycart.length > 0) {
        const total = CartUtil.getTotal(this.context.mycart);
        const items = this.context.mycart;
        const customer = this.context.customer;

        if (customer) {
          this.apiCheckout(total, items, customer);
        } else {
          this.props.navigate('/login');
        }
      } else {
        alert('Your cart is empty');
      }
    }
  }

  // apis
  apiCheckout(total, items, customer) {
    const body = { total, items, customer };
    const config = { headers: { 'x-access-token': this.context.token } };

    axios.post('/api/customer/checkout', body, config).then((res) => {
      if (res.data) {
        alert('Good job!');
        this.context.setMycart([]);
        this.props.navigate('/home');
      } else {
        alert('Error! Please try again later.');
      }
    });
  }
}

export default withRouter(Mycart);