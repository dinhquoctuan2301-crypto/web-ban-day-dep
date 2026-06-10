import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import MyContext from '../contexts/MyContext';
import withRouter from '../utils/withRouter';
import './ProductDetail.css';

const VND_RATE = 24000;

function formatVND(usd) {
  const price = Number(usd) || 0;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
    .format(Math.round(price * VND_RATE));
}

function getImgSrc(image) {
  if (!image) return 'https://via.placeholder.com/500x500?text=No+Image';
  if (image.startsWith('data:') || image.startsWith('http')) return image;
  return 'data:image/jpeg;base64,' + image;
}

class ProductDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      product: null,
      related: [],
      quantity: 1,
      toast: null,
      selectedColor: null,
      selectedSize: null
    };
  }

  componentDidMount() {
    const { id } = this.props.params;
    this.apiGetProduct(id);
  }

  componentDidUpdate(prevProps) {
    const { id } = this.props.params;
    if (id !== prevProps.params.id) {
      this.apiGetProduct(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /* ---- Toast ---- */
  showToast(msg, type = 'success') {
    this.setState({ toast: { msg, type } });
    setTimeout(() => this.setState({ toast: null }), 2500);
  }

  /* ---- Add to cart ---- */
  handleAddToCart = (e) => {
    e.preventDefault();
    const { product, quantity, selectedColor, selectedSize } = this.state;
    const qty = parseInt(quantity, 10);
    if (!qty || qty < 1) { this.showToast('Vui lòng nhập số lượng hợp lệ', 'error'); return; }

    const hasVariants = product.variants && product.variants.length > 0;
    if (hasVariants) {
      if (!selectedColor) { this.showToast('Vui lòng chọn màu sắc', 'error'); return; }
      if (!selectedSize) { this.showToast('Vui lòng chọn kích cỡ', 'error'); return; }
    }

    const mycart = [...this.context.mycart];
    const idx = mycart.findIndex((x) => 
      x.product._id === product._id && 
      x.color === selectedColor && 
      x.size === selectedSize
    );
    if (idx === -1) mycart.push({ product, quantity: qty, color: selectedColor, size: selectedSize });
    else mycart[idx] = { ...mycart[idx], quantity: mycart[idx].quantity + qty };

    this.context.setMycart(mycart);
    this.showToast(`Đã thêm ${qty} "${product.name}" vào giỏ hàng`);
  };

  /* ---- Star rating (mock) ---- */
  renderStars(rating = 4.5) {
    const full  = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < full) stars.push('★');
      else if (i === full && hasHalf) stars.push('☆');
      else stars.push('☆');
    }
    return (
      <div className="pd-stars" aria-label={`Đánh giá ${rating}/5`}>
        {stars.map((s, i) => (
          <span key={i} className={i < full ? 'star-filled' : 'star-empty'}>{s}</span>
        ))}
        <span className="pd-rating-text">{rating} / 5.0</span>
      </div>
    );
  }

  render() {
    const { product, related, quantity, toast, selectedColor, selectedSize } = this.state;

    // Extract variants
    let uniqueColors = [];
    let availableSizes = [];
    const hasVariants = product && product.variants && product.variants.length > 0;
    
    if (hasVariants) {
      uniqueColors = [...new Set(product.variants.map(v => v.color))].filter(Boolean);
      if (selectedColor) {
        availableSizes = product.variants.filter(v => v.color === selectedColor);
      }
    }

    return (
      <div className="pd-wrap">

        {/* Toast */}
        {toast && (
          <div className={`pd-toast pd-toast--${toast.type}`}>
            {toast.type === 'success' ? '✓' : '⚠'} {toast.msg}
          </div>
        )}

        {!product ? (
          <div className="pd-loading">
            <div className="pd-spinner" />
            <p>Đang tải sản phẩm...</p>
          </div>
        ) : (
          <>
            {/* ---- Breadcrumb ---- */}
            <nav className="pd-breadcrumb" aria-label="Breadcrumb">
              <Link to="/home">Trang chủ</Link>
              <span className="pd-breadcrumb-sep">›</span>
              {product.category && (
                <>
                  <Link to={'/product/category/' + product.category._id}>
                    {product.category.name}
                  </Link>
                  <span className="pd-breadcrumb-sep">›</span>
                </>
              )}
              <span className="pd-breadcrumb-current">{product.name}</span>
            </nav>

            {/* ---- Main card ---- */}
            <div className="pd-card">

              {/* Left — Image */}
              <div className="pd-img-col">
                <div className="pd-img-wrap">
                  <img
                    src={getImgSrc(product.image)}
                    alt={product.name}
                    className="pd-img"
                    crossOrigin="anonymous"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/500x500?text=No+Image'; }}
                  />
                </div>
              </div>

              {/* Right — Info */}
              <div className="pd-info-col">

                {product.category && (
                  <Link
                    to={'/product/category/' + product.category._id}
                    className="pd-category-tag"
                  >
                    {product.category.name}
                  </Link>
                )}

                <h1 className="pd-name">{product.name}</h1>

                {/* Stars */}
                {this.renderStars(4.5)}

                <div className="pd-price">{formatVND(product.price)}</div>

                <div className="pd-meta-row">
                  <div className="pd-meta-item">
                    <span className="pd-meta-icon">🏷️</span>
                    <span>Mã SP: <b>{product._id?.slice(-8)}</b></span>
                  </div>
                  <div className="pd-meta-item">
                    <span className="pd-meta-icon">📦</span>
                    <span>Đã bán: <b>{product.soldCount || 0}</b></span>
                  </div>
                  <div className="pd-meta-item">
                    <span className="pd-meta-icon">✅</span>
                    <span className="pd-in-stock">Còn hàng</span>
                  </div>
                </div>

                <div className="pd-divider" />

                {/* Variants Selection */}
                {hasVariants && (
                  <div className="pd-variants">
                    {uniqueColors.length > 0 && (
                      <div className="pd-variant-group">
                        <label>Màu sắc:</label>
                        <div className="pd-variant-options">
                          {uniqueColors.map(color => (
                            <button
                              key={color}
                              type="button"
                              className={`pd-variant-btn ${selectedColor === color ? 'active' : ''}`}
                              onClick={() => this.setState({ selectedColor: color, selectedSize: null })}
                            >
                              {color}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedColor && (
                      <div className="pd-variant-group">
                        <label>Kích cỡ (Size): <span className="pd-size-guide-link" onClick={() => alert('Bảng hướng dẫn chọn size sẽ được cập nhật sau.')}>📏 Hướng dẫn chọn size</span></label>
                        <div className="pd-variant-options">
                          {availableSizes.map(v => {
                            const isOutOfStock = !v.stock || v.stock <= 0;
                            return (
                              <button
                                key={v.size}
                                type="button"
                                className={`pd-variant-btn ${selectedSize === v.size ? 'active' : ''} ${isOutOfStock ? 'disabled' : ''}`}
                                disabled={isOutOfStock}
                                onClick={() => this.setState({ selectedSize: v.size })}
                                title={isOutOfStock ? 'Hết hàng' : `Còn ${v.stock} sản phẩm`}
                              >
                                {v.size}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quantity + Add to cart */}
                <form className="pd-action-form" onSubmit={this.handleAddToCart}>
                  <div className="pd-qty-row">
                    <label className="pd-qty-label">Số lượng</label>
                    <div className="pd-qty-control">
                      <button
                        type="button"
                        className="pd-qty-btn"
                        onClick={() => this.setState((s) => ({ quantity: Math.max(1, s.quantity - 1) }))}
                        aria-label="Giảm số lượng"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        className="pd-qty-input"
                        min="1"
                        max="99"
                        value={quantity}
                        onChange={(e) => this.setState({ quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                        aria-label="Số lượng"
                      />
                      <button
                        type="button"
                        className="pd-qty-btn"
                        onClick={() => this.setState((s) => ({ quantity: Math.min(99, s.quantity + 1) }))}
                        aria-label="Tăng số lượng"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="pd-add-btn">
                    🛒 Thêm vào giỏ hàng
                  </button>
                </form>

                {/* Trust badges */}
                <div className="pd-trust">
                  {['🚚 Miễn phí giao hàng', '🔄 Đổi trả 30 ngày', '🛡️ Bảo hành 12 tháng'].map((t) => (
                    <span key={t} className="pd-trust-item">{t}</span>
                  ))}
                </div>

              </div>
            </div>

            {/* ---- Related products ---- */}
            {related.length > 0 && (
              <section className="pd-related">
                <h2 className="pd-related-title">Sản phẩm tương tự</h2>
                <div className="pd-related-grid">
                  {related.slice(0, 4).map((item) => (
                    <Link key={item._id} to={'/product/' + item._id} className="pd-rel-card">
                      <div className="pd-rel-img-wrap">
                        <img
                          src={getImgSrc(item.image)}
                          alt={item.name}
                          className="pd-rel-img"
                          crossOrigin="anonymous"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/200x200?text=No+Image'; }}
                        />
                      </div>
                      <div className="pd-rel-info">
                        <p className="pd-rel-name">{item.name}</p>
                        <p className="pd-rel-price">{formatVND(item.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    );
  }

  /* ---- APIs ---- */
  apiGetProduct(id) {
    axios.get('/api/customer/products/' + id)
      .then((res) => {
        if (res.data) {
          const product = res.data;
          let defaultColor = null;
          if (product.variants && product.variants.length > 0) {
            const colors = [...new Set(product.variants.map(v => v.color))].filter(Boolean);
            if (colors.length > 0) defaultColor = colors[0];
          }
          this.setState({ product, selectedColor: defaultColor, selectedSize: null, quantity: 1 });
          // Load related products từ cùng category
          if (res.data.category?._id) {
            this.apiGetRelated(res.data.category._id, id);
          }
        }
      })
      .catch((err) => console.error(err));
  }

  apiGetRelated(catId, currentId) {
    axios.get('/api/customer/products/category/' + catId)
      .then((res) => {
        if (res.data) {
          const related = res.data.filter((p) => p._id !== currentId);
          this.setState({ related });
        }
      })
      .catch((err) => console.error(err));
  }
}

export default withRouter(ProductDetail);