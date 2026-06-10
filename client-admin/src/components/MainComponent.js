import React, { Component } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import MyContext from '../contexts/MyContext';

import Home from './HomeComponent';
import Category from './CategoryComponent';
import Product from './ProductComponent';
import Order from './OrderComponent';
import Customer from './CustomerComponent';

import './Main.css';

// Helper để lấy tên trang hiện tại
function withLocation(WrappedComponent) {
  return function(props) {
    const location = useLocation();
    return <WrappedComponent {...props} location={location} />;
  };
}

class Main extends Component {
  static contextType = MyContext;

  getPageTitle() {
    const path = this.props.location?.pathname || '';
    if (path.includes('/home'))     return { title: 'Dashboard' };
    if (path.includes('/category')) return { title: 'Quản lý danh mục' };
    if (path.includes('/product'))  return { title: 'Quản lý sản phẩm' };
    if (path.includes('/order'))    return { title: 'Quản lý đơn hàng' };
    if (path.includes('/customer')) return { title: 'Quản lý khách hàng' };
    return { title: 'Dashboard' };
  }

  isActive(path) {
    return this.props.location?.pathname?.includes(path) ? 'active' : '';
  }

  render() {
    if (this.context.token !== '') {
      const page = this.getPageTitle();

      return (
        <div className="admin-layout">

          {/* SIDEBAR */}
          <aside className="admin-sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
              <div className="sidebar-logo-icon">M</div>
              <div className="sidebar-logo-text">
                <span className="sidebar-logo-name">MyShop</span>
                <span className="sidebar-logo-sub">Admin Panel</span>
              </div>
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
              <div className="sidebar-nav-label">TỔNG QUAN</div>

              <Link to="/admin/home" className={`sidebar-link ${this.isActive('/home')}`}>
                <span>Dashboard</span>
              </Link>

              <div className="sidebar-nav-label">QUẢN LÝ</div>

              <Link to="/admin/category" className={`sidebar-link ${this.isActive('/category')}`}>
                <span>Danh mục</span>
              </Link>

              <Link to="/admin/product" className={`sidebar-link ${this.isActive('/product')}`}>
                <span>Sản phẩm</span>
              </Link>

              <Link to="/admin/order" className={`sidebar-link ${this.isActive('/order')}`}>
                <span>Đơn hàng</span>
              </Link>

              <Link to="/admin/customer" className={`sidebar-link ${this.isActive('/customer')}`}>
                <span>Khách hàng</span>
              </Link>
            </nav>

            {/* User Info Bottom */}
            <div className="sidebar-footer">
              <div className="sidebar-user">
                <div className="sidebar-avatar">
                  {this.context.username?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="sidebar-user-info">
                  <span className="sidebar-user-name">{this.context.username}</span>
                  <span className="sidebar-user-role">Administrator</span>
                </div>
              </div>
              <button className="sidebar-logout-btn" onClick={() => this.lnkLogoutClick()} title="Đăng xuất">
                Đăng xuất
              </button>
            </div>
          </aside>

          {/* RIGHT SIDE */}
          <div className="admin-main">

            {/* TOPBAR */}
            <header className="admin-topbar">
              <div className="topbar-breadcrumb">
                <h1 className="topbar-page-title">{page.title}</h1>
              </div>

              <div className="topbar-actions">
                <a href="http://localhost:3000" target="_blank" rel="noreferrer" className="topbar-view-store">
                  Xem cửa hàng
                </a>
                <div className="topbar-user-chip">
                  <div className="topbar-avatar">
                    {this.context.username?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <span>{this.context.username}</span>
                </div>
              </div>
            </header>

            {/* CONTENT */}
            <div className="admin-content">
              <Routes>
                <Route path='/admin'             element={<Navigate replace to='/admin/home' />} />
                <Route path='/admin/home'        element={<Home />} />
                <Route path='/admin/category'    element={<Category />} />
                <Route path='/admin/product'     element={<Product />} />
                <Route path='/admin/order'       element={<Order />} />
                <Route path='/admin/customer'    element={<Customer />} />
              </Routes>
            </div>

          </div>

        </div>
      );
    }

    return (<div />);
  }

  lnkLogoutClick() {
    this.context.setToken('');
    this.context.setUsername('');
  }
}

export default withLocation(Main);