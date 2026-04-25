import React, { Component } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import MyContext from '../contexts/MyContext';

import Home from './HomeComponent';
import Category from './CategoryComponent';
import Product from './ProductComponent';
import Order from './OrderComponent';
import Customer from './CustomerComponent';

import './Main.css';

class Main extends Component {
  static contextType = MyContext;

  render() {
    if (this.context.token !== '') {
      return (
        <div className="admin-layout">

          {/* SIDEBAR */}
          <div className="admin-sidebar">
            <div className="sidebar-title">ADMIN PANEL</div>

            <ul className="sidebar-menu">
              <li><Link to="/admin/home" className="menu-home">Home</Link></li>
              <li><Link to="/admin/category" className="menu-category">Category</Link></li>
              <li><Link to="/admin/product" className="menu-product">Product</Link></li>
              <li><Link to="/admin/order" className="menu-order">Order</Link></li>
              <li><Link to="/admin/customer" className="menu-customer">Customer</Link></li>
            </ul>
          </div>

          {/* RIGHT SIDE */}
          <div className="admin-main">

            {/* TOPBAR */}
            <div className="admin-topbar">
              <div className="topbar-left">Dashboard</div>

              <div className="topbar-right">
                Hello <b>{this.context.username}</b>

                <button
                  className="logout-btn"
                  onClick={() => this.lnkLogoutClick()}
                >
                  Logout
                </button>
              </div>
            </div>

            {/* CONTENT */}
            <div className="admin-content">
              <Routes>
                <Route path='/admin' element={<Navigate replace to='/admin/home' />} />
                <Route path='/admin/home' element={<Home />} />
                <Route path='/admin/category' element={<Category />} />
                <Route path='/admin/product' element={<Product />} />
                <Route path='/admin/order' element={<Order />} />
                <Route path='/admin/customer' element={<Customer />} />
              </Routes>
            </div>

          </div>

        </div>
      );
    }

    return (<div />);
  }

  // LOGOUT
  lnkLogoutClick() {
    this.context.setToken('');
    this.context.setUsername('');
  }
}

export default Main;