import axios from 'axios';
import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom';
import withRouter from '../utils/withRouter';
import MyContext from '../contexts/MyContext';
import './Menu.css';

const ANNOUNCEMENTS = [
  '🚚 Miễn phí vận chuyển cho đơn hàng trên 500.000₫',
  '🎁 Nhập mã BACK2SCHOOL giảm thêm 20% cho học sinh/sinh viên',
  '⭐ Đánh giá 5 sao nhận ngay voucher 30.000₫ cho lần mua tiếp theo',
  '🔥 Flash Sale mỗi ngày — Giảm đến 60% sản phẩm chọn lọc',
];

class Menu extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      categories:      [],
      txtKeyword:      '',
      userMenuOpen:    false,
      darkMode:        false,
      announceIdx:     0,
      announceVisible: true,
      wishlist:        [],
      wishlistOpen:    false,
      searchFocused:   false,
    };
    this.userMenuRef  = React.createRef();
    this.wishlistRef  = React.createRef();
    this.announceTimer = null;
  }

  componentDidMount() {
    this.apiGetCategories();
    document.addEventListener('mousedown', this.handleOutsideClick);

    // Rotate announcement messages
    this.announceTimer = setInterval(() => {
      this.setState({ announceVisible: false });
      setTimeout(() => {
        this.setState(s => ({
          announceIdx: (s.announceIdx + 1) % ANNOUNCEMENTS.length,
          announceVisible: true,
        }));
      }, 400);
    }, 4000);

    // Restore wishlist from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('myshop_wishlist') || '[]');
      this.setState({ wishlist: saved });
    } catch (_) {}
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleOutsideClick);
    clearInterval(this.announceTimer);
  }

  handleOutsideClick = (e) => {
    if (this.userMenuRef.current  && !this.userMenuRef.current.contains(e.target))
      this.setState({ userMenuOpen: false });
    if (this.wishlistRef.current  && !this.wishlistRef.current.contains(e.target))
      this.setState({ wishlistOpen: false });
  };

  handleSearch = (e) => {
    e.preventDefault();
    const kw = this.state.txtKeyword.trim();
    if (kw) this.props.navigate('/product/search/' + kw);
  };

  toggleTheme = () => {
    const next = !this.state.darkMode;
    this.setState({ darkMode: next });
    document.body.classList.toggle('dark-theme', next);
  };

  handleLogout = () => {
    this.context.setToken('');
    this.context.setCustomer(null);
    this.context.setMycart([]);
    this.setState({ userMenuOpen: false });
    this.props.navigate('/home');
  };

  getAvatarLetter = () => {
    const name = this.context.customer?.name || '';
    return name.charAt(0).toUpperCase() || '?';
  };

  render() {
    const {
      categories, txtKeyword, userMenuOpen, darkMode,
      announceIdx, announceVisible, wishlist, wishlistOpen, searchFocused,
    } = this.state;
    const { token, customer, mycart } = this.context;
    const isLoggedIn = token !== '';
    const cartCount  = mycart.length;
    const wishCount  = wishlist.length;

    return (
      <div className="navbar-wrapper">

        {/* ── Announcement bar ── */}
        <div className="announce-bar">
          <div className="announce-inner">
            <span className={`announce-text${announceVisible ? ' visible' : ''}`}>
              {ANNOUNCEMENTS[announceIdx]}
            </span>
          </div>
        </div>

        {/* ── Main navbar ── */}
        <nav className="navbar" id="main-navbar">
          <div className="navbar-inner">

            {/* Logo */}
            <Link to="/home" className="navbar-logo" aria-label="MyShop trang chủ">
              <div className="navbar-logo-icon">🛍️</div>
              <span className="navbar-logo-text">MyShop</span>
            </Link>

            {/* Category links */}
            <ul className="navbar-categories">
              <li>
                <NavLink to="/home" end
                  className={({ isActive }) => 'nav-cat-link' + (isActive ? ' active' : '')}>
                  Trang chủ
                </NavLink>
              </li>
              {categories.map(cat => (
                <li key={cat._id}>
                  <NavLink
                    to={'/product/category/' + cat._id}
                    className={({ isActive }) => 'nav-cat-link' + (isActive ? ' active' : '')}>
                    {cat.name}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Search */}
            <form
              className={`navbar-search${searchFocused ? ' focused' : ''}`}
              onSubmit={this.handleSearch}>
              <input
                type="search"
                placeholder="Tìm sản phẩm..."
                value={txtKeyword}
                onChange={e => this.setState({ txtKeyword: e.target.value })}
                onFocus={() => this.setState({ searchFocused: true })}
                onBlur={() => this.setState({ searchFocused: false })}
                aria-label="Tìm kiếm sản phẩm"
              />
              <button type="submit" className="navbar-search-btn" aria-label="Tìm kiếm">🔍</button>
            </form>

            {/* Right actions */}
            <div className="navbar-actions">

              {/* Dark mode */}
              <button className="navbar-icon-btn" onClick={this.toggleTheme}
                title={darkMode ? 'Chế độ sáng' : 'Chế độ tối'}
                aria-label="Chuyển chế độ">
                {darkMode ? '☀️' : '🌙'}
              </button>

              {/* Wishlist */}
              <div className="navbar-wishlist-wrap" ref={this.wishlistRef}>
                <button
                  className="navbar-icon-btn"
                  onClick={() => this.setState({ wishlistOpen: !wishlistOpen })}
                  aria-label="Danh sách yêu thích">
                  ♡
                  {wishCount > 0 && (
                    <span className="cart-badge" aria-label={`${wishCount} sản phẩm`}>{wishCount}</span>
                  )}
                </button>
                {wishlistOpen && (
                  <div className="wishlist-dropdown" role="dialog" aria-label="Danh sách yêu thích">
                    <div className="wishlist-header">❤️ Yêu Thích ({wishCount})</div>
                    {wishCount === 0
                      ? <p className="wishlist-empty">Chưa có sản phẩm yêu thích</p>
                      : wishlist.map((p, i) => (
                        <div key={i} className="wishlist-item">
                          <span className="wishlist-item-name">{p.name}</span>
                        </div>
                      ))
                    }
                    <div className="wishlist-hint">💡 Nhấn ♡ trên sản phẩm để lưu</div>
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link to="/mycart" className="navbar-cart-btn" aria-label="Giỏ hàng">
                🛒 <span>Giỏ hàng</span>
                {cartCount > 0 && (
                  <span className="cart-badge" aria-label={`${cartCount} sản phẩm`}>{cartCount}</span>
                )}
              </Link>

              {/* User area */}
              {isLoggedIn ? (
                <div className={`navbar-user${userMenuOpen ? ' open' : ''}`} ref={this.userMenuRef}>
                  <button
                    className="navbar-user-btn"
                    onClick={() => this.setState({ userMenuOpen: !userMenuOpen })}
                    aria-expanded={userMenuOpen} aria-haspopup="true" id="user-menu-btn">
                    <div className="navbar-avatar" aria-hidden="true">{this.getAvatarLetter()}</div>
                    <span className="navbar-user-name">{customer?.name}</span>
                    <span className="navbar-chevron" aria-hidden="true">▼</span>
                  </button>

                  {userMenuOpen && (
                    <div className="user-dropdown" role="menu" aria-labelledby="user-menu-btn">
                      <div className="dropdown-header">
                        <div className="dropdown-header-name">{customer?.name}</div>
                        <div className="dropdown-header-email">{customer?.email}</div>
                      </div>
                      <Link to="/myprofile" className="dropdown-item" role="menuitem"
                        onClick={() => this.setState({ userMenuOpen: false })}>
                        <span className="dropdown-item-icon">👤</span> Hồ sơ cá nhân
                      </Link>
                      <Link to="/myorders" className="dropdown-item" role="menuitem"
                        onClick={() => this.setState({ userMenuOpen: false })}>
                        <span className="dropdown-item-icon">📦</span> Đơn hàng của tôi
                      </Link>
                      <button className="dropdown-item logout" role="menuitem" onClick={this.handleLogout}>
                        <span className="dropdown-item-icon">🚪</span> Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login"  className="navbar-auth-btn login">Đăng nhập</Link>
                  <Link to="/signup" className="navbar-auth-btn signup">Đăng ký</Link>
                </>
              )}
            </div>

          </div>
        </nav>
      </div>
    );
  }

  apiGetCategories() {
    axios.get('/api/customer/categories')
      .then(res => { if (res.data) this.setState({ categories: res.data }); })
      .catch(err => console.error(err));
  }
}

export default withRouter(Menu);