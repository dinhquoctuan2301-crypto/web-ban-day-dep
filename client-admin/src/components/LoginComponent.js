import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import './Login.css';

class Login extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtUsername: 'admin',
      txtPassword: '123456'
    };
  }

  render() {
    if (this.context.token === '') {
      return (
        <div className="login-container">
          <div className="login-wrapper">
            
            {/* Left - Decoration */}
            <div className="login-left">
              <div className="login-decoration">
                <svg viewBox="0 0 200 200" className="decoration-svg">
                  <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                  <circle cx="100" cy="100" r="75" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                  <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                  <path d="M 80 80 Q 100 60 120 80 Q 120 100 100 110 Q 80 100 80 80" fill="rgba(255,255,255,0.3)" />
                  <circle cx="70" cy="60" r="8" fill="rgba(255,255,255,0.4)" />
                  <circle cx="130" cy="70" r="6" fill="rgba(255,255,255,0.3)" />
                  <circle cx="140" cy="120" r="7" fill="rgba(255,255,255,0.35)" />
                </svg>
              </div>
              <div className="login-info">
                <h3>Admin Dashboard</h3>
                <p>Online Shopping Store</p>
                <p className="login-subtitle">Manage your store efficiently</p>
              </div>
            </div>

            {/* Right - Form */}
            <div className="login-card">
              <h2 className="login-title">
                <span className="title-icon">🔐</span>
                ADMIN LOGIN
              </h2>

              <form className="login-form">
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    className="login-input"
                    value={this.state.txtUsername}
                    onChange={(e) => this.setState({ txtUsername: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="login-input"
                    value={this.state.txtPassword}
                    onChange={(e) => this.setState({ txtPassword: e.target.value })}
                  />
                </div>

                <button
                  className="login-btn"
                  onClick={(e) => this.btnLoginClick(e)}
                >
                  LOGIN
                </button>
              </form>

              <div className="login-footer">
                <p>Only authorized personnel</p>
              </div>
            </div>

          </div>
        </div>
      );
    }
    return (<div />);
  }

  // event
  btnLoginClick(e) {
    e.preventDefault();
    const { txtUsername, txtPassword } = this.state;

    if (txtUsername && txtPassword) {
      const account = { username: txtUsername, password: txtPassword };
      this.apiLogin(account);
    } else {
      alert('Please input username and password');
    }
  }

  // API
  apiLogin(account) {
    axios.post('/api/admin/login', account).then((res) => {
      const result = res.data;
      if (result.success === true) {
        this.context.setToken(result.token);
        this.context.setUsername(account.username);
      } else {
        alert(result.message);
        this.setState({ txtUsername: '', txtPassword: '' });
      }
    });
  }
}

export default Login;