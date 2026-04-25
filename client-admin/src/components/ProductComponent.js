import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import ProductDetail from './ProductDetailComponent';
import './Product.css';

const VND_RATE = 24000;
function formatVND(usd) {
  const value = Number(usd) || 0;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(value * VND_RATE));
}

class Product extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      products: [],
      noPages: 0,
      curPage: 1,
      itemSelected: null
    };
  }

  render() {
    const prods = this.state.products.map((item) => {
      if (!item || !item.category) return null; // 👈 chống crash

      return (
        <tr
          key={item._id}
          className="product-row"
          onClick={() => this.trItemClick(item)}
        >
          <td>{item._id}</td>
          <td>{item.name}</td>
          <td className="price">{formatVND(item.price)}</td>
          <td>{new Date(item.cdate).toLocaleString()}</td>
          <td>{item.category?.name}</td>
          <td>
            <img
              src={"data:image/jpg;base64," + item.image}
              alt=""
              className="product-img-admin"
            />
          </td>
        </tr>
      );
    });

    const pagination = Array.from({ length: this.state.noPages }, (_, index) => (
      <button
        key={index}
        className={`page-btn ${this.state.curPage === index + 1 ? 'active' : ''}`}
        onClick={() => this.lnkPageClick(index + 1)}
      >
        {index + 1}
      </button>
    ));

    return (
      <div className="product-container">

        {/* PRODUCT LIST */}
        <div className="product-card">
          <h2 className="product-list-title">PRODUCT LIST</h2>

          <table className="product-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Date</th>
                <th>Category</th>
                <th>Image</th>
              </tr>
            </thead>

            <tbody>{prods}</tbody>
          </table>

          {/* PAGINATION */}
          <div className="pagination">{pagination}</div>
        </div>

        {/* DETAIL */}
        <div className="product-detail">
          <ProductDetail
            item={this.state.itemSelected}
            curPage={this.state.curPage}
            updateProducts={this.updateProducts}
          />
        </div>

      </div>
    );
  }

  componentDidMount() {
    this.apiGetProducts(this.state.curPage);
  }

  updateProducts = (products, noPages, curPage) => {
    this.setState({ products, noPages, curPage });
  };

  // EVENTS
  lnkPageClick(index) {
    this.apiGetProducts(index);
  }

  trItemClick(item) {
    this.setState({ itemSelected: item });
  }

  // API
  apiGetProducts(page) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/products?page=' + page, config).then((res) => {
      const result = res.data;
      this.setState({
        products: result.products,
        noPages: result.noPages,
        curPage: result.curPage
      });
    });
  }
}

export default Product;