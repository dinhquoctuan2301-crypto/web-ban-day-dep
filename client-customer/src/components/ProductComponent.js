import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import MyContext from '../contexts/MyContext';
import withRouter from '../utils/withRouter';
import './Product.css';

const VND_RATE = 24000;

function formatVND(usd) {
  const price = Number(usd) || 0;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
    .format(Math.round(price * VND_RATE));
}

function getImgSrc(image) {
  if (!image) return 'https://via.placeholder.com/300x300?text=No+Image';
  if (image.startsWith('data:') || image.startsWith('http')) return image;
  return 'data:image/jpeg;base64,' + image;
}

const SORT_OPTIONS = [
  { value: 'default',   label: 'Mặc định' },
  { value: 'price_asc', label: 'Giá: Thấp → Cao' },
  { value: 'price_desc',label: 'Giá: Cao → Thấp' },
  { value: 'newest',    label: 'Mới nhất' },
  { value: 'name_asc',  label: 'Tên: A → Z' },
];

class Product extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      products: [],
      sortBy: 'default',
      minPrice: '',
      maxPrice: '',
      appliedMin: null,
      appliedMax: null,
      toast: null,
    };
  }

  componentDidMount() {
    const { cid, keyword } = this.props.params;
    if (cid)     this.apiGetProductsByCatID(cid);
    else if (keyword) this.apiGetProductsByKeyword(keyword);
  }

  componentDidUpdate(prevProps) {
    const { cid, keyword } = this.props.params;
    if (cid && cid !== prevProps.params.cid) {
      this.resetFilters();
      this.apiGetProductsByCatID(cid);
    } else if (keyword && keyword !== prevProps.params.keyword) {
      this.resetFilters();
      this.apiGetProductsByKeyword(keyword);
    }
  }

  resetFilters() {
    this.setState({ sortBy: 'default', minPrice: '', maxPrice: '', appliedMin: null, appliedMax: null });
  }

  /* ---- Filter & Sort logic (client-side) ---- */
  getProcessedProducts() {
    const { products, sortBy, appliedMin, appliedMax } = this.state;

    let list = [...products];

    // Filter by price (convert VND input → USD for compare)
    if (appliedMin !== null) {
      list = list.filter((p) => p.price * VND_RATE >= appliedMin);
    }
    if (appliedMax !== null) {
      list = list.filter((p) => p.price * VND_RATE <= appliedMax);
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':  list.sort((a, b) => a.price - b.price); break;
      case 'price_desc': list.sort((a, b) => b.price - a.price); break;
      case 'newest':     list.sort((a, b) => b.cdate - a.cdate); break;
      case 'name_asc':   list.sort((a, b) => a.name.localeCompare(b.name, 'vi')); break;
      default: break;
    }
    return list;
  }

  /* ---- Toast ---- */
  showToast(msg) {
    this.setState({ toast: msg });
    setTimeout(() => this.setState({ toast: null }), 2500);
  }

  /* ---- Add to cart ---- */
  handleAddToCart = (e, product) => {
    e.preventDefault();
    const mycart = [...this.context.mycart];
    const idx = mycart.findIndex((x) => x.product._id === product._id);
    if (idx === -1) mycart.push({ product, quantity: 1 });
    else mycart[idx] = { ...mycart[idx], quantity: mycart[idx].quantity + 1 };
    this.context.setMycart(mycart);
    this.showToast(`Đã thêm "${product.name}" vào giỏ`);
  };

  /* ---- Apply price filter ---- */
  applyFilter = () => {
    const { minPrice, maxPrice } = this.state;
    const min = minPrice ? parseInt(minPrice.replace(/\D/g, ''), 10) : null;
    const max = maxPrice ? parseInt(maxPrice.replace(/\D/g, ''), 10) : null;
    this.setState({ appliedMin: min, appliedMax: max });
  };

  clearFilter = () => {
    this.setState({ minPrice: '', maxPrice: '', appliedMin: null, appliedMax: null });
  };

  /* ---- Render product card ---- */
  renderCard(item) {
    if (!item || !item._id) return null;
    const imgSrc = getImgSrc(item.image);
    return (
      <div key={item._id} className="plp-card">
        <Link to={'/product/' + item._id} className="plp-card-img-wrap">
          <img
            src={imgSrc}
            alt={item.name}
            className="plp-card-img"
            crossOrigin="anonymous"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'; }}
          />
          <div className="plp-card-overlay">
            <button
              className="plp-card-add-btn"
              onClick={(e) => this.handleAddToCart(e, item)}
            >
              🛒 Thêm vào giỏ
            </button>
          </div>
        </Link>

        <div className="plp-card-info">
          {item.category && <span className="plp-card-cat">{item.category.name}</span>}
          <Link to={'/product/' + item._id} className="plp-card-name">{item.name}</Link>
          <div className="plp-card-footer">
            <span className="plp-card-price">{formatVND(item.price)}</span>
            <span className="plp-card-sold">Đã bán: {item.soldCount || 0}</span>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { sortBy, minPrice, maxPrice, appliedMin, appliedMax, toast } = this.state;
    const processed = this.getProcessedProducts();
    const isFiltered = appliedMin !== null || appliedMax !== null;
    const { keyword } = this.props.params;

    return (
      <div className="plp-wrap">

        {/* Toast */}
        {toast && <div className="plp-toast">✓ {toast}</div>}

        <div className="plp-layout">

          {/* ---- Sidebar filter ---- */}
          <aside className="plp-sidebar">

            <div className="plp-sidebar-section">
              <h3 className="plp-sidebar-title">Lọc theo giá</h3>
              <div className="plp-price-inputs">
                <input
                  type="number"
                  placeholder="Từ (VNĐ)"
                  value={minPrice}
                  onChange={(e) => this.setState({ minPrice: e.target.value })}
                  className="plp-price-input"
                  min="0"
                />
                <span className="plp-price-sep">—</span>
                <input
                  type="number"
                  placeholder="Đến (VNĐ)"
                  value={maxPrice}
                  onChange={(e) => this.setState({ maxPrice: e.target.value })}
                  className="plp-price-input"
                  min="0"
                />
              </div>
              <div className="plp-filter-btns">
                <button className="plp-apply-btn" onClick={this.applyFilter}>
                  Áp dụng
                </button>
                {isFiltered && (
                  <button className="plp-clear-btn" onClick={this.clearFilter}>
                    Xoá lọc
                  </button>
                )}
              </div>
            </div>

            <div className="plp-sidebar-section">
              <h3 className="plp-sidebar-title">Sắp xếp</h3>
              <div className="plp-sort-list">
                {SORT_OPTIONS.map((opt) => (
                  <label key={opt.value} className="plp-sort-option">
                    <input
                      type="radio"
                      name="sort"
                      value={opt.value}
                      checked={sortBy === opt.value}
                      onChange={() => this.setState({ sortBy: opt.value })}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

          </aside>

          {/* ---- Product grid ---- */}
          <div className="plp-main">

            {/* Results bar */}
            <div className="plp-results-bar">
              <span className="plp-results-count">
                {keyword
                  ? `Kết quả cho "${keyword}": `
                  : 'Đang hiển thị: '}
                <strong>{processed.length}</strong> sản phẩm
              </span>
            </div>

            {processed.length === 0 ? (
              <div className="plp-empty">
                <span className="plp-empty-icon">🔍</span>
                <p>Không tìm thấy sản phẩm phù hợp</p>
                {isFiltered && (
                  <button className="plp-clear-btn" onClick={this.clearFilter}>
                    Xoá bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <div className="plp-grid">
                {processed.map((item) => this.renderCard(item))}
              </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  /* ---- APIs ---- */
  apiGetProductsByCatID(cid) {
    axios.get('/api/customer/products/category/' + cid)
      .then((res) => { if (res.data) this.setState({ products: res.data }); })
      .catch((err) => console.error(err));
  }

  apiGetProductsByKeyword(keyword) {
    axios.get('/api/customer/products/search/' + keyword)
      .then((res) => { if (res.data) this.setState({ products: res.data }); })
      .catch((err) => console.error(err));
  }
}

export default withRouter(Product);