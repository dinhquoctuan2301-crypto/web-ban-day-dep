import React, { Component } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Menu from './MenuComponent';
import Inform from './InformComponent';
import Home from './HomeComponent';
import Product from './ProductComponent';
import ProductDetail from './ProductDetailComponent';
import Signup from './SignupComponent';
import Active from './ActiveComponent';
import Login from './LoginComponent';
import Myprofile from './MyprofileComponent';
import Mycart from './MycartComponent';
import Myorders from './MyordersComponent';

import Footer from './Footer'; // 👈 thêm

import './Main.css';

class Main extends Component {
  render() {
    return (
      <div className="body-customer">

        {/* HEADER */}
        <Menu />

        {/* CONTENT */}
        <div className="main-container">
          <Inform />

          <div className="main-content">
            <Routes>
              <Route path='/' element={<Navigate replace to='/home' />} />
              <Route path='/home' element={<Home />} />
              <Route path='/product/category/:cid' element={<Product />} />
              <Route path='/product/search/:keyword' element={<Product />} />
              <Route path='/product/:id' element={<ProductDetail />} />
              <Route path='/signup' element={<Signup />} />
              <Route path='/active' element={<Active />} />
              <Route path='/login' element={<Login />} />
              <Route path='/myprofile' element={<Myprofile />} />
              <Route path='/mycart' element={<Mycart />} />
              <Route path='/myorders' element={<Myorders />} />
            </Routes>
          </div>
        </div>

        {/* FOOTER 👇 thêm vào đây */}
        <Footer />

      </div>
    );
  }
}

export default Main;