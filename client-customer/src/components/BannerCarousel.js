import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './BannerCarousel.css';

const BANNERS = [
  {
    id: 1,
    eyebrow: '🔥 Flash Sale · Hôm Nay',
    title: 'NEW ARRIVAL',
    subtitle: 'BIG SUMMER SALE',
    discount: 'GIẢM 50%',
    description: 'Bộ sưu tập mới nhất — Phong cách sành điệu, chất liệu cao cấp. Số lượng có hạn!',
    bg: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
    link: '/home',
    hasCountdown: true,
  },
  {
    id: 2,
    eyebrow: '✨ New Collection 2026',
    title: 'SNEAKERS',
    subtitle: 'PREMIUM COLLECTION',
    discount: 'MỚI VỀ',
    description: 'White / Black / Blue — Thiết kế tối giản, vật liệu bền vững. Mang đi mọi nơi.',
    bg: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)',
    imageUrl: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=500&h=500&fit=crop',
    link: '/home',
    hasCountdown: false,
  },
  {
    id: 3,
    eyebrow: '⚡ Ưu Đãi Đặc Biệt',
    title: 'BLACK FRIDAY',
    subtitle: 'SPECIAL OFFER',
    discount: 'ĐẾN -60%',
    description: 'Đặt hàng ngay để nhận ưu đãi độc quyền. Miễn phí vận chuyển toàn quốc.',
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    imageUrl: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&h=500&fit=crop',
    link: '/home',
    hasCountdown: false,
  },
  {
    id: 4,
    eyebrow: '🏆 Best Seller 2026',
    title: 'TOP PICKS',
    subtitle: 'ĐƯỢC YÊU THÍCH NHẤT',
    discount: 'SHOP NOW',
    description: 'Những đôi giày bán chạy nhất — Được hàng nghìn khách hàng tin chọn.',
    bg: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #f97316 100%)',
    imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500&h=500&fit=crop',
    link: '/home',
    hasCountdown: false,
  },
];

/* ---- Countdown helper ---- */
function getFlashSaleEnd() {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end;
}

function calcTimeLeft(target) {
  const diff = Math.max(0, target - Date.now());
  return {
    h: String(Math.floor(diff / 3600000)).padStart(2, '0'),
    m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
    s: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
  };
}

class BannerCarousel extends Component {
  constructor(props) {
    super(props);
    const target = getFlashSaleEnd();
    this.state = {
      current: 0,
      timeLeft: calcTimeLeft(target),
      saleEnd: target,
    };
    this.slideTimer  = null;
    this.clockTimer  = null;
    this.progressKey = 0;
  }

  componentDidMount() {
    this.startSlide();
    this.startClock();
  }

  componentWillUnmount() {
    clearInterval(this.slideTimer);
    clearInterval(this.clockTimer);
  }

  startSlide = () => {
    clearInterval(this.slideTimer);
    this.slideTimer = setInterval(() => {
      this.setState(s => ({ current: (s.current + 1) % BANNERS.length }));
      this.progressKey++;
    }, 5000);
  };

  startClock = () => {
    this.clockTimer = setInterval(() => {
      this.setState(s => ({ timeLeft: calcTimeLeft(s.saleEnd) }));
    }, 1000);
  };

  goTo = (idx) => {
    this.setState({ current: idx });
    this.progressKey++;
    this.startSlide();
  };

  prev = () => this.goTo((this.state.current - 1 + BANNERS.length) % BANNERS.length);
  next = () => this.goTo((this.state.current + 1) % BANNERS.length);

  render() {
    const { current, timeLeft } = this.state;

    return (
      <div className="banner-carousel-container">

        {/* Slides */}
        <div className="banner-slides-wrapper" style={{ transform: `translateX(-${current * 100}%)` }}>
          {BANNERS.map((b, i) => (
            <div key={b.id} className="banner-slide" style={{ background: b.bg }}>

              {/* Floating particles */}
              <div className="banner-particles">
                {[...Array(5)].map((_, pi) => <div key={pi} className="banner-particle" />)}
              </div>

              <div className="banner-content">
                {/* Left */}
                <div className="banner-left">
                  <div className="banner-eyebrow">{b.eyebrow}</div>
                  <div className="banner-label">{b.title}</div>
                  <div className="banner-main">{b.subtitle}</div>
                  <div className="banner-discount">{b.discount}</div>
                  <p className="banner-description">{b.description}</p>

                  {/* Countdown only for first banner */}
                  {b.hasCountdown && i === current && (
                    <div className="banner-countdown">
                      <span className="countdown-label">Kết thúc sau:</span>
                      {[
                        { num: timeLeft.h, unit: 'Giờ' },
                        { num: timeLeft.m, unit: 'Phút' },
                        { num: timeLeft.s, unit: 'Giây' },
                      ].map((t, ti) => (
                        <React.Fragment key={ti}>
                          {ti > 0 && <span className="countdown-sep">:</span>}
                          <div className="countdown-block">
                            <span className="countdown-num">{t.num}</span>
                            <span className="countdown-unit">{t.unit}</span>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  <div className="banner-cta-group">
                    <Link to={b.link}>
                      <button className="banner-btn">Mua Ngay →</button>
                    </Link>
                    <Link to="/home">
                      <button className="banner-btn-outline">Xem Tất Cả</button>
                    </Link>
                  </div>
                </div>

                {/* Right image */}
                <div className="banner-right">
                  <div className="banner-image-display">
                    <div className="banner-image-glow" />
                    <img
                      src={b.imageUrl}
                      alt={b.subtitle}
                      className="banner-product-img"
                      crossOrigin="anonymous"
                      onError={e => { e.target.src = 'https://via.placeholder.com/350x320?text=MyShop'; }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Prev / Next */}
        <button className="carousel-btn carousel-prev" onClick={this.prev} aria-label="Slide trước">‹</button>
        <button className="carousel-btn carousel-next" onClick={this.next} aria-label="Slide tiếp theo">›</button>

        {/* Dots */}
        <div className="carousel-dots">
          {BANNERS.map((_, i) => (
            <button
              key={i}
              className={`dot${i === current ? ' active' : ''}`}
              onClick={() => this.goTo(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Progress bar (resets each slide) */}
        <div key={this.progressKey} className="banner-progress" />

      </div>
    );
  }
}

export default BannerCarousel;
