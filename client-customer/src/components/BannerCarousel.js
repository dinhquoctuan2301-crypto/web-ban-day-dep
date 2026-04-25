import axios from 'axios';
import React, { Component } from 'react';
import './BannerCarousel.css';

class BannerCarousel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentBanner: 0,
      bannerProducts: [],
      banners: [
        {
          id: 1,
          title: 'NEW ARRIVAL',
          subtitle: 'BIG SALE',
          discount: '50% OFF',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
          bgColor: 'linear-gradient(135deg, #00b4db 0%, #0083b0 100%)',
          productId: 0,
          imageUrl: 'https://en.pimg.jp/107/713/783/1/107713783.jpg'
        },
        {
          id: 2,
          title: 'NEW COLLECTION',
          subtitle: 'SNEAKERS',
          discount: '40% OFF',
          description: 'Blue / White / Black / Grey - Premium Quality',
          bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          productId: 1,
          imageUrl: 'https://thumbs.dreamstime.com/b/clean-white-sneakers-bright-surface-new-modern-footwear-presented-pair-leather-shoes-isolated-casual-style-minimal-design-422020214.jpg?w=768'
        },
        {
          id: 3,
          title: 'SPECIAL OFFER',
          subtitle: 'BLACK FRIDAY',
          discount: '50% OFF',
          description: 'Order now and get exclusive deals',
          bgColor: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
          productId: 2,
          imageUrl: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&h=500&fit=crop'
        }
      ]
    };
    this.autoSlideTimer = null;
  }

  componentDidMount() {
    this.loadBannerProducts();
    this.startAutoSlide();
  }

  componentWillUnmount() {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
    }
  }

  loadBannerProducts = () => {
    axios.get('/api/customer/products/hot')
      .then((res) => {
        this.setState({ bannerProducts: res.data || [] });
      })
      .catch(err => console.error('Lỗi tải banner products:', err));
  };

  startAutoSlide = () => {
    this.autoSlideTimer = setInterval(() => {
      this.nextBanner();
    }, 5000);
  };

  nextBanner = () => {
    this.setState(prevState => ({
      currentBanner: (prevState.currentBanner + 1) % prevState.banners.length
    }));
  };

  goToPrevious = () => {
    if (this.autoSlideTimer) clearInterval(this.autoSlideTimer);
    
    this.setState(prevState => ({
      currentBanner: prevState.currentBanner === 0 
        ? prevState.banners.length - 1 
        : prevState.currentBanner - 1
    }));
    
    this.startAutoSlide();
  };

  goToNext = () => {
    if (this.autoSlideTimer) clearInterval(this.autoSlideTimer);
    
    this.setState(prevState => ({
      currentBanner: (prevState.currentBanner + 1) % prevState.banners.length
    }));
    
    this.startAutoSlide();
  };

  goToSlide = (index) => {
    if (this.autoSlideTimer) clearInterval(this.autoSlideTimer);
    
    this.setState({ currentBanner: index });
    this.startAutoSlide();
  };

  getProductImage = (bannerIndex) => {
    const { bannerProducts, banners } = this.state;
    const banner = banners[bannerIndex];

    // Ưu tiên dùng imageUrl từ banner config
    if (banner.imageUrl) {
      return banner.imageUrl;
    }

    // Fallback: lấy từ product API
    const product = bannerProducts[banner.productId];
    if (product && product.image) {
      const imgSrc = product.image.startsWith('data:') || product.image.startsWith('http')
        ? product.image
        : "data:image/jpeg;base64," + product.image;
      return imgSrc;
    }

    return 'https://via.placeholder.com/350x320?text=Shoe+Collection';
  };

  render() {
    const { currentBanner, banners } = this.state;
    const banner = banners[currentBanner];
    const productImage = this.getProductImage(currentBanner);

    return (
      <div className="banner-carousel-container">
        <div 
          className="banner-slide"
          style={{ background: banner.bgColor }}
        >
          <div className="banner-content">
            <div className="banner-left">
              <div className="banner-label">{banner.title}</div>
              <div className="banner-main">{banner.subtitle}</div>
              <div className="banner-discount">{banner.discount}</div>
              <p className="banner-description">{banner.description}</p>
              <button className="banner-btn">SHOP NOW</button>
            </div>

            <div className="banner-right">
              <div className="banner-image-display">
                <img 
                  src={productImage}
                  alt={banner.subtitle}
                  className="banner-product-img"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/350x320?text=Shoe+Collection';
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <button className="carousel-btn carousel-prev" onClick={this.goToPrevious}>
          ‹
        </button>
        <button className="carousel-btn carousel-next" onClick={this.goToNext}>
          ›
        </button>

        {/* Dots Indicator */}
        <div className="carousel-dots">
          {banners.map((_, index) => (
            <div
              key={index}
              className={`dot ${index === currentBanner ? 'active' : ''}`}
              onClick={() => this.goToSlide(index)}
            ></div>
          ))}
        </div>
      </div>
    );
  }
}

export default BannerCarousel;
