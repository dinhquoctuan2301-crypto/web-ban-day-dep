import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import MyContext from '../contexts/MyContext';
import './Inform.css';

class Inform extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      darkMode: false
    };
  }

  toggleTheme() {
    const isDark = !this.state.darkMode;
    this.setState({ darkMode: isDark });
    document.body.classList.toggle('dark-theme', isDark);
  }

  render() {
    const isLoggedIn = this.context.token !== '';
    const welcomeText = isLoggedIn
      ? `Xin chào, ${this.context.customer?.name || 'Khách'}`
      : 'Chào mừng đến với shop';

    return (
      <div className="inform-container">

        {/* LEFT */}
        <div className="inform-left">
          <div className="inform-banner">
            <div className="inform-welcome">{welcomeText}</div>
            {!isLoggedIn && (
              <div className="inform-subtitle">
                Khám phá sản phẩm hot & ưu đãi siêu hấp dẫn
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="inform-right">
          <div className="inform-links">
            {isLoggedIn ? (
              <>
                <button
                  type="button"
                  className={`inform-item theme-toggle ${this.state.darkMode ? 'active' : ''}`}
                  onClick={() => this.toggleTheme()}
                >
                  {this.state.darkMode ? '🌙' : '☀️'}
                </button>

                <span className="welcome-text">
                  Hello <b>{this.context.customer.name}</b>
                </span>

                <NavLink to="/home" className="inform-item" onClick={() => this.lnkLogoutClick()}>
                  Logout
                </NavLink>

                <NavLink to="/myprofile" className="inform-item">
                  My profile
                </NavLink>

                <NavLink to="/myorders" className="inform-item">
                  My orders
                </NavLink>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={`inform-item theme-toggle ${this.state.darkMode ? 'active' : ''}`}
                  onClick={() => this.toggleTheme()}
                >
                  {this.state.darkMode ? '🌙' : '☀️'}
                </button>

                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    isActive ? 'inform-item login active' : 'inform-item login'
                  }
                >
                  Login
                </NavLink>

                <NavLink
                  to="/signup"
                  className={({ isActive }) =>
                    isActive ? 'inform-item signup active' : 'inform-item signup'
                  }
                >
                  Sign-up
                </NavLink>

                <NavLink
                  to="/active"
                  className={({ isActive }) =>
                    isActive ? 'inform-item activate active' : 'inform-item activate'
                  }
                >
                  Active
                </NavLink>
              </>
            )}
          </div>

          <NavLink to="/mycart" className="cart-box">
            🛒 My cart
            <span className="cart-count">
              {this.context.mycart.length}
            </span>
          </NavLink>
        </div>

      </div>
    );
  }

  // LOGOUT
  lnkLogoutClick() {
    this.context.setToken('');
    this.context.setCustomer(null);
    this.context.setMycart([]);
  }
}

export default Inform;