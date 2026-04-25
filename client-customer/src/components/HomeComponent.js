import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import BannerCarousel from './BannerCarousel';
import './Home.css';

const VND_RATE = 24000;
function formatVND(usd) {
  const price = Number(usd) || 0;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(price * VND_RATE));
}
function formatDate(ms) {
  return ms ? new Date(ms).toLocaleString('vi-VN') : 'Chưa cập nhật';
}

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newprods: [],
      hotprods: []
    };
  }

  // ✅ FIX: chống null + dữ liệu lỗi
  renderProducts(list) {
    if (!list || list.length === 0) return <p>No products</p>;

    return list
      .filter(item => item && item._id) // lọc dữ liệu lỗi
      .map((item) => {

        // fallback image (nếu lỗi base64)
        const imgSrc = item.image
          ? (item.image.startsWith('data:') || item.image.startsWith('http')
              ? item.image
              : "data:image/jpeg;base64," + item.image)
          : "https://via.placeholder.com/300";

        return (
          <div key={item._id} className="product-card">
            <Link to={'/product/' + item._id}>
              <img
                src={imgSrc}
                alt={item.name}
                className="product-img"
                crossOrigin="anonymous"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300";
                }}
              />
            </Link>

            <div className="product-info">
              <div className="product-name">
                {item.name || "No name"}
              </div>

              <div className="product-price">
                {formatVND(item.price || 0)}
              </div>

              <div className="product-meta">
                <div>Cập nhật: {formatDate(item.cdate)}</div>
                <div>Đã bán: {item.soldCount || 0}</div>
              </div>

              {/* ✅ FIX: không crash khi category null */}
              <div className="product-category">
                {item.category ? item.category.name : "No category"}
              </div>
            </div>
          </div>
        );
      });
  }

  render() {
    return (
      <div className="home-container">

        {/* BANNER CAROUSEL */}
        <BannerCarousel />

        {/* NEW PRODUCTS */}
        <h2 className="section-title">NEW ARRIVALS</h2>
        <div className="product-grid">
          {this.renderProducts(this.state.newprods)}
        </div>

        {/* HOT PRODUCTS */}
        {this.state.hotprods.length > 0 && (
          <>
            <h2 className="section-title">BEST SELLERS</h2>
            <div className="product-grid">
              {this.renderProducts(this.state.hotprods)}
            </div>
          </>
        )}

      </div>
    );
  }

  componentDidMount() {
    this.apiGetNewProducts();
    this.apiGetHotProducts();
  }

  // APIs
  apiGetNewProducts() {
    axios.get('/api/customer/products/new')
      .then((res) => {
        console.log("NEW:", res.data); // debug
        this.setState({ newprods: res.data });
      })
      .catch(err => console.error(err));
  }

  apiGetHotProducts() {
    axios.get('/api/customer/products/hot')
      .then((res) => {
        console.log("HOT:", res.data); // debug
        this.setState({ hotprods: res.data });
      })
      .catch(err => console.error(err));
  }
}

export default Home;