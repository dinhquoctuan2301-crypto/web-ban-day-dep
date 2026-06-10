import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import MyContext from '../contexts/MyContext';
import BannerCarousel from './BannerCarousel';
import './Home.css';

/* ── helpers ─────────────────────────────────────── */
const VND_RATE = 24000;

function formatVND(usd) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
    .format(Math.round((Number(usd) || 0) * VND_RATE));
}

function getImgSrc(image) {
  if (!image) return 'https://via.placeholder.com/300x300?text=No+Image';
  if (image.startsWith('data:') || image.startsWith('http')) return image;
  return 'data:image/jpeg;base64,' + image;
}

function calcSaleEnd() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function calcTimeLeft(target) {
  const diff = Math.max(0, target - Date.now());
  return {
    h: String(Math.floor(diff / 3600000)).padStart(2, '0'),
    m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
    s: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
  };
}

/* ── ProductCard ─────────────────────────────────── */
function ProductCard({ item, onAddToCart, badge, salePercent }) {
  const imgSrc = getImgSrc(item.image);
  return (
    <div className="prod-card">
      {badge && <span className={`prod-badge prod-badge--${badge.type}`}>{badge.label}</span>}
      {salePercent && <span className="prod-sale-pct">-{salePercent}%</span>}

      <Link to={'/product/' + item._id} className="prod-card-img-wrap">
        <img
          src={imgSrc} alt={item.name}
          className="prod-card-img" crossOrigin="anonymous"
          onError={e => { e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'; }}
        />
        <div className="prod-card-overlay">
          <button
            className="prod-card-add-btn"
            onClick={e => { e.preventDefault(); onAddToCart(item); }}
            aria-label={`Thêm ${item.name} vào giỏ hàng`}
          >
            🛒 Thêm vào giỏ
          </button>
        </div>
      </Link>

      <div className="prod-card-info">
        {item.category && <span className="prod-card-cat">{item.category.name}</span>}
        <Link to={'/product/' + item._id} className="prod-card-name">{item.name || 'Sản phẩm'}</Link>
        <div className="prod-card-footer">
          <span className="prod-card-price">{formatVND(item.price)}</span>
          <span className="prod-card-sold">Đã bán: {item.soldCount || 0}</span>
        </div>
      </div>
    </div>
  );
}

/* ── FlashSale Card ──────────────────────────────── */
function FlashSaleCard({ item, onAddToCart }) {
  const imgSrc = getImgSrc(item.image);
  const soldPct = Math.min(95, 30 + Math.floor(Math.random() * 60));
  const discount = 10 + Math.floor((item._id?.charCodeAt(0) || 5) % 30);

  return (
    <div className="flash-card">
      <div className="flash-card-badge">-{discount}%</div>
      <Link to={'/product/' + item._id} className="flash-card-img-wrap">
        <img src={imgSrc} alt={item.name} className="flash-card-img" crossOrigin="anonymous"
          onError={e => { e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'; }} />
      </Link>
      <div className="flash-card-info">
        <div className="flash-card-name">{item.name}</div>
        <div className="flash-card-prices">
          <span className="flash-price-new">{formatVND(item.price * (1 - discount / 100))}</span>
          <span className="flash-price-old">{formatVND(item.price)}</span>
        </div>
        <div className="flash-progress-wrap">
          <div className="flash-progress-label">Đã bán {soldPct}%</div>
          <div className="flash-progress-bar">
            <div className="flash-progress-fill" style={{ width: soldPct + '%' }} />
          </div>
        </div>
        <button className="flash-add-btn" onClick={() => onAddToCart(item)}>🛒 Thêm vào giỏ</button>
      </div>
    </div>
  );
}

/* ── BRANDS DATA ─────────────────────────────────── */
const BRANDS = [
  { name: 'Nike',      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/200px-Logo_NIKE.svg.png' },
  { name: 'Adidas',   logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/200px-Adidas_Logo.svg.png' },
  { name: 'Puma',     logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Puma_logo.svg/200px-Puma_logo.svg.png' },
  { name: 'Converse', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Converse_logo.svg/200px-Converse_logo.svg.png' },
  { name: 'Vans',     logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Vans-logo.svg/200px-Vans-logo.svg.png' },
  { name: 'New Balance', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/New_Balance_logo.svg/200px-New_Balance_logo.svg.png' },
];

/* ── TESTIMONIALS DATA ───────────────────────────── */
const REVIEWS = [
  {
    id: 1, name: 'Nguyễn Minh Tuấn', role: 'Khách hàng thân thiết', rating: 5, avatar: '👨‍💼',
    text: 'Giày đẹp vượt kỳ vọng! Chất liệu cao cấp, form đẹp. Giao hàng nhanh chỉ 1 ngày. Sẽ quay lại mua thêm!',
  },
  {
    id: 2, name: 'Trần Thị Lan', role: 'Mua lần 3', rating: 5, avatar: '👩‍🦱',
    text: 'MyShop là địa chỉ tin cậy nhất mình từng mua giày online. Đóng gói cẩn thận, hỗ trợ tận tình.',
  },
  {
    id: 3, name: 'Lê Hoàng Nam', role: 'Verified Buyer', rating: 5, avatar: '🧑‍🎓',
    text: 'Đặt đêm, sáng hôm sau đã nhận hàng! Chất lượng y hình, size chuẩn. Giá cực kỳ hợp lý.',
  },
];

/* ── STATS DATA ──────────────────────────────────── */
const STATS = [
  { icon: '👥', value: 12500, suffix: '+', label: 'Khách Hàng Hài Lòng' },
  { icon: '📦', value: 850,   suffix: '+', label: 'Sản Phẩm Đa Dạng' },
  { icon: '⭐', value: 4.9,   suffix: '★', label: 'Đánh Giá Trung Bình' },
  { icon: '🚚', value: 99,    suffix: '%', label: 'Giao Hàng Đúng Hạn' },
];

const CAT_IMAGES = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=400&fit=crop',
];

/* ════════════════════════════════════════════════════
   HOME COMPONENT
   ════════════════════════════════════════════════════ */
class Home extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    const saleEnd = calcSaleEnd();
    this.state = {
      newprods:      [],
      hotprods:      [],
      categories:    [],
      toast:         null,
      saleEnd,
      timeLeft:      calcTimeLeft(saleEnd),
      statsVisible:  false,
      statsValues:   STATS.map(() => 0),
      reviewIdx:     0,
    };
    this.clockTimer   = null;
    this.statsRef     = React.createRef();
    this.revTimer     = null;
  }

  componentDidMount() {
    this.apiGetNewProducts();
    this.apiGetHotProducts();
    this.apiGetCategories();

    this.clockTimer = setInterval(() => {
      this.setState(s => ({ timeLeft: calcTimeLeft(s.saleEnd) }));
    }, 1000);

    // Intersection observer for stats counter
    this.statsObserver = new window.IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !this.state.statsVisible) {
        this.setState({ statsVisible: true });
        this.animateStats();
      }
    }, { threshold: 0.4 });
    if (this.statsRef.current) this.statsObserver.observe(this.statsRef.current);

    // Reviews auto-rotate
    this.revTimer = setInterval(() => {
      this.setState(s => ({ reviewIdx: (s.reviewIdx + 1) % REVIEWS.length }));
    }, 4000);
  }

  componentWillUnmount() {
    clearInterval(this.clockTimer);
    clearInterval(this.revTimer);
    if (this.statsObserver) this.statsObserver.disconnect();
  }

  animateStats() {
    const duration = 2000;
    const steps    = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const pct = step / steps;
      this.setState({
        statsValues: STATS.map(s => {
          const v = s.value * pct;
          return Number.isInteger(s.value) ? Math.floor(v) : parseFloat(v.toFixed(1));
        }),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
  }

  showToast(msg, type = 'success') {
    this.setState({ toast: { msg, type } });
    setTimeout(() => this.setState({ toast: null }), 2800);
  }

  handleAddToCart = (product) => {
    const mycart = [...this.context.mycart];
    const idx = mycart.findIndex(x => x.product._id === product._id);
    if (idx === -1) mycart.push({ product, quantity: 1 });
    else mycart[idx] = { ...mycart[idx], quantity: mycart[idx].quantity + 1 };
    this.context.setMycart(mycart);
    this.showToast(`✓ Đã thêm "${product.name}" vào giỏ hàng`);
  };

  /* ── render helpers ─────────────────────────────── */

  renderSection(title, icon, list, badgeFn) {
    if (!list || list.length === 0) return null;
    return (
      <section className="home-section">
        <div className="section-header">
          <h2 className="section-title"><span>{icon}</span> {title}</h2>
          <Link to="/home" className="section-view-all">Xem tất cả →</Link>
        </div>
        <div className="prod-grid">
          {list.filter(x => x && x._id).map(item => (
            <ProductCard
              key={item._id} item={item}
              badge={badgeFn ? badgeFn(item) : null}
              onAddToCart={this.handleAddToCart}
            />
          ))}
        </div>
      </section>
    );
  }

  renderFeatures() {
    const features = [
      { icon: '🚚', title: 'Giao hàng miễn phí', sub: 'Đơn từ 500.000₫', detail: 'Áp dụng toàn quốc. Nhận hàng trong 2–4 ngày làm việc.' },
      { icon: '🔄', title: 'Đổi trả 30 ngày',   sub: 'Không cần lý do',  detail: 'Đổi mới miễn phí tận nhà. Hoàn tiền 100% nếu bạn không hài lòng.' },
      { icon: '🛡️', title: 'Bảo hành chính hãng', sub: 'Cam kết 12 tháng', detail: 'Bảo hành 12 tháng tại tất cả trạm dịch vụ ủy quyền toàn quốc.' },
      { icon: '💳', title: 'Thanh toán an toàn',  sub: 'Bảo mật SSL',      detail: 'Hỗ trợ COD, thẻ tín dụng, ví điện tử. Mã hóa an toàn tuyệt đối.' },
    ];
    return (
      <div className="home-features">
        {features.map(f => (
          <div className="home-feature-card" key={f.title}>
            <div className="home-feature-inner">
              <div className="home-feature-front">
                <span className="home-feature-icon">{f.icon}</span>
                <div>
                  <div className="home-feature-title">{f.title}</div>
                  <div className="home-feature-sub">{f.sub}</div>
                </div>
              </div>
              <div className="home-feature-back">
                <p className="home-feature-detail">{f.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  renderCategories() {
    const { categories } = this.state;
    if (!categories.length) return null;
    const topCats = categories.slice(0, 4);
    return (
      <section className="home-section">
        <div className="section-header">
          <h2 className="section-title"><span>🌟</span> Khám Phá Phong Cách</h2>
        </div>
        <div className="home-category-grid">
          {topCats.map((cat, idx) => (
            <Link key={cat._id} to={'/product/category/' + cat._id} className="home-cat-card">
              <img src={CAT_IMAGES[idx % CAT_IMAGES.length]} alt={cat.name} className="home-cat-img" crossOrigin="anonymous" />
              <div className="home-cat-overlay">
                <span className="home-cat-name">{cat.name}</span>
                <span className="home-cat-btn">Khám phá ngay →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  renderFlashSale() {
    const { hotprods, timeLeft } = this.state;
    if (!hotprods.length) return null;
    const saleProds = hotprods.slice(0, 5);
    return (
      <section className="flash-sale-section">
        {/* Header */}
        <div className="flash-sale-header">
          <div className="flash-sale-title-group">
            <span className="flash-fire">⚡</span>
            <h2 className="flash-sale-title">FLASH SALE</h2>
            <span className="flash-sale-badge">Hôm nay</span>
          </div>
          <div className="flash-countdown">
            <span className="flash-countdown-label">Kết thúc sau:</span>
            {[
              { num: timeLeft.h, unit: 'Giờ' },
              { num: timeLeft.m, unit: 'Phút' },
              { num: timeLeft.s, unit: 'Giây' },
            ].map((t, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="flash-sep">:</span>}
                <div className="flash-time-block">
                  <span className="flash-time-num">{t.num}</span>
                  <span className="flash-time-unit">{t.unit}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
          <Link to="/home" className="section-view-all">Xem tất cả →</Link>
        </div>

        {/* Products */}
        <div className="flash-sale-grid">
          {saleProds.filter(x => x && x._id).map(item => (
            <FlashSaleCard key={item._id} item={item} onAddToCart={this.handleAddToCart} />
          ))}
        </div>
      </section>
    );
  }

  renderPromoBanner() {
    return (
      <div className="home-promo-banner">
        <div className="promo-content">
          <h3>MÙA TỰU TRƯỜNG</h3>
          <h2>GIẢM NGAY 20% CHO HỌC SINH / SINH VIÊN</h2>
          <p>Nhập mã: <strong>BACK2SCHOOL</strong> khi thanh toán</p>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Mua Ngay →</button>
        </div>
      </div>
    );
  }

  renderBrands() {
    const doubled = [...BRANDS, ...BRANDS];
    return (
      <section className="home-section brands-section">
        <div className="section-header">
          <h2 className="section-title"><span>🏅</span> Thương Hiệu Nổi Bật</h2>
        </div>
        <div className="brands-marquee-wrapper">
          <div className="brands-marquee">
            {doubled.map((b, i) => (
              <div key={i} className="brand-logo-card">
                <img src={b.logo} alt={b.name} className="brand-logo-img"
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                />
                <span className="brand-logo-fallback" style={{ display: 'none' }}>{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  renderTestimonials() {
    const { reviewIdx } = this.state;
    const rev = REVIEWS[reviewIdx];
    return (
      <section className="home-section testimonials-section">
        <div className="section-header">
          <h2 className="section-title"><span>💬</span> Khách Hàng Nói Gì?</h2>
        </div>
        <div className="testimonials-wrapper">
          {/* Dots */}
          <div className="testimonials-dots-left">
            {REVIEWS.map((_, i) => (
              <button
                key={i}
                className={`testi-dot${i === reviewIdx ? ' active' : ''}`}
                onClick={() => this.setState({ reviewIdx: i })}
                aria-label={`Review ${i + 1}`}
              />
            ))}
          </div>

          {/* Active review */}
          <div className="testi-card-main" key={reviewIdx}>
            <div className="testi-quote">❝</div>
            <p className="testi-text">{rev.text}</p>
            <div className="testi-stars">{'★'.repeat(rev.rating)}</div>
            <div className="testi-author">
              <div className="testi-avatar">{rev.avatar}</div>
              <div>
                <div className="testi-name">{rev.name}</div>
                <div className="testi-role">{rev.role}</div>
              </div>
            </div>
          </div>

          {/* Side cards */}
          <div className="testi-side-cards">
            {REVIEWS.filter((_, i) => i !== reviewIdx).map((r, i) => (
              <div key={r.id} className="testi-card-side" onClick={() => this.setState({ reviewIdx: REVIEWS.indexOf(r) })}>
                <div className="testi-side-avatar">{r.avatar}</div>
                <div>
                  <div className="testi-side-name">{r.name}</div>
                  <div className="testi-side-stars">{'★'.repeat(r.rating)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  renderStats() {
    const { statsValues } = this.state;
    return (
      <section className="home-stats-section" ref={this.statsRef}>
        <div className="home-stats-bg" />
        <div className="home-stats-content">
          <h2 className="stats-heading">Con Số Nói Lên Tất Cả</h2>
          <p className="stats-sub">Hàng nghìn khách hàng tin tưởng mua sắm tại MyShop mỗi ngày</p>
          <div className="stats-grid">
            {STATS.map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value">
                  {statsValues[i]}{s.suffix}
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  render() {
    const { newprods, hotprods, toast } = this.state;

    return (
      <div className="home-wrap">

        {/* Toast */}
        {toast && (
          <div className={`home-toast home-toast--${toast.type}`}>
            {toast.msg}
          </div>
        )}

        {/* Hero Banner */}
        <BannerCarousel />

        {/* Feature strip */}
        {this.renderFeatures()}

        {/* Flash Sale */}
        {this.renderFlashSale()}

        {/* Categories */}
        {this.renderCategories()}

        {/* Hot products */}
        {this.renderSection('Bán Chạy Nhất', '🔥', hotprods, () => ({ type: 'hot', label: 'HOT' }))}

        {/* Promo banner */}
        {this.renderPromoBanner()}

        {/* Brand marquee */}
        {this.renderBrands()}

        {/* New products */}
        {this.renderSection('Mới Về', '✨', newprods, () => ({ type: 'new', label: 'NEW' }))}

        {/* Testimonials */}
        {this.renderTestimonials()}

        {/* Stats counter */}
        {this.renderStats()}

      </div>
    );
  }

  /* ── APIs ───────────────────────────────────────── */
  apiGetNewProducts() {
    axios.get('/api/customer/products/new')
      .then(res => { if (res.data) this.setState({ newprods: res.data }); })
      .catch(err => console.error(err));
  }
  apiGetHotProducts() {
    axios.get('/api/customer/products/hot')
      .then(res => { if (res.data) this.setState({ hotprods: res.data }); })
      .catch(err => console.error(err));
  }
  apiGetCategories() {
    axios.get('/api/customer/categories')
      .then(res => { if (res.data) this.setState({ categories: res.data }); })
      .catch(err => console.error(err));
  }
}

export default Home;