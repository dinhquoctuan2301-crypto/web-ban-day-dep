import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import withRouter from '../utils/withRouter';
import './Product.css'; // 👈 thêm

const VND_RATE = 24000;
function formatVND(usd) {
  const price = Number(usd) || 0;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(price * VND_RATE));
}
function formatDate(ms) {
  return ms ? new Date(ms).toLocaleString('vi-VN') : 'Chưa cập nhật';
}

class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: []
    };
  }

  renderProducts() {
    return this.state.products.map((item) => (
      <div key={item._id} className="product-card">

        <Link to={'/product/' + item._id}>
          <img
            src={"data:image/jpg;base64," + item.image}
            alt=""
            className="product-img"
          />
        </Link>

        <div className="product-info">
          <div className="product-name">{item.name}</div>
          <div className="product-price">{formatVND(item.price)}</div>
          <div className="product-meta">
            <div>Cập nhật: {formatDate(item.cdate)}</div>
            <div>Đã bán: {item.soldCount || 0}</div>
          </div>
        </div>

      </div>
    ));
  }

  render() {
    return (
      <div className="product-container">

        <h2 className="product-title">🛍️ LIST PRODUCTS</h2>

        <div className="product-grid">
          {this.renderProducts()}
        </div>

      </div>
    );
  }

  componentDidMount() {
    const params = this.props.params;

    if (params.cid) {
      this.apiGetProductsByCatID(params.cid);
    } else if (params.keyword) {
      this.apiGetProductsByKeyword(params.keyword);
    }
  }

  componentDidUpdate(prevProps) {
    const params = this.props.params;

    if (params.cid && params.cid !== prevProps.params.cid) {
      this.apiGetProductsByCatID(params.cid);
    } else if (params.keyword && params.keyword !== prevProps.params.keyword) {
      this.apiGetProductsByKeyword(params.keyword);
    }
  }

  // API
  apiGetProductsByCatID(cid) {
    axios.get('/api/customer/products/category/' + cid).then((res) => {
      this.setState({ products: res.data });
    });
  }

  apiGetProductsByKeyword(keyword) {
    axios.get('/api/customer/products/search/' + keyword).then((res) => {
      this.setState({ products: res.data });
    });
  }
}

export default withRouter(Product);