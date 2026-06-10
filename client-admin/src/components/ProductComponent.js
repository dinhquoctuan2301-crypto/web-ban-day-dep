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
      itemSelected: null,
      toast: null
    };
  }

  showToast = (msg, type = 'success') => {
    this.setState({ toast: { msg, type } });
    setTimeout(() => this.setState({ toast: null }), 2500);
  }

  componentDidMount() {
    this.apiGetProducts(this.state.curPage);
  }

  updateProducts = (products, noPages, curPage) => {
    this.setState({ products, noPages, curPage });
  };

  render() {
    const { products, itemSelected, curPage, noPages, toast } = this.state;

    const pagination = Array.from({ length: noPages }, (_, index) => (
      <button
        key={index}
        className={`page-btn ${curPage === index + 1 ? 'active' : ''}`}
        onClick={() => this.lnkPageClick(index + 1)}
      >
        {index + 1}
      </button>
    ));

    return (
      <div className="product-wrap">

        {toast && (
          <div className={`admin-toast admin-toast--${toast.type}`}>{toast.msg}</div>
        )}

        <div className="product-layout">
          {/* PRODUCT LIST (Left) */}
          <div className="admin-panel product-list-panel">
            <div className="panel-header">
              <h3>Danh sách sản phẩm</h3>
              <span>{products.length} sản phẩm (Trang {curPage}/{noPages})</span>
            </div>
            
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Giá</th>
                    <th>Tồn kho</th>
                    <th>Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(item => {
                    if (!item || !item.category) return null;
                    const isSelected = itemSelected?._id === item._id;
                    return (
                      <tr
                        key={item._id}
                        className={`product-row ${isSelected ? 'selected' : ''}`}
                        onClick={() => this.trItemClick(item)}
                      >
                        <td>
                          <img
                            src={item.image.startsWith('data:') ? item.image : "data:image/jpg;base64," + item.image}
                            alt=""
                            className="product-img-thumb"
                          />
                        </td>
                        <td><strong>{item.name}</strong></td>
                        <td><span className="badge badge-muted">{item.category?.name}</span></td>
                        <td className="product-price">{formatVND(item.price)}</td>
                        <td>{item.variants ? item.variants.reduce((sum, v) => sum + (v.stock || 0), 0) : 0}</td>
                        <td>{new Date(item.cdate).toLocaleDateString('vi-VN')}</td>
                      </tr>
                    );
                  })}
                  {products.length === 0 && (
                    <tr><td colSpan="6" className="no-data">Chưa có sản phẩm nào.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {noPages > 1 && (
              <div className="pagination-wrap">
                {pagination}
              </div>
            )}
          </div>

          {/* PRODUCT DETAIL FORM (Right) */}
          <div className="product-form-panel">
            <ProductDetail
              item={itemSelected}
              curPage={curPage}
              updateProducts={this.updateProducts}
              showToast={this.showToast}
              onClearSelection={() => this.setState({ itemSelected: null })}
            />
          </div>
        </div>

      </div>
    );
  }

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