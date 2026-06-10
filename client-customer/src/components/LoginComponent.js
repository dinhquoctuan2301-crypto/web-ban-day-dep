import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import withRouter from '../utils/withRouter';
import './Login.css';

class Login extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtUsername: '',
      txtPassword: '',
      showForgotModal: false,
      resetEmail: '',
      toast: null
    };
  }

  showToast(msg, type = 'success') {
    this.setState({ toast: { msg, type } });
    setTimeout(() => this.setState({ toast: null }), 2500);
  }

  handleForgotPassword = () => {
    const { resetEmail } = this.state;
    if (!resetEmail) {
      this.showToast('Vui lòng nhập email của bạn', 'error');
      return;
    }

    axios.post('/api/customer/forgot-password', { email: resetEmail })
      .then((res) => {
        if (res.data.success) {
          this.showToast('Link khôi phục đã được gửi vào email!', 'success');
          setTimeout(() => this.setState({ showForgotModal: false, resetEmail: '' }), 2000);
        } else {
          this.showToast(res.data.message || 'Lỗi gửi email', 'error');
        }
      })
      .catch((err) => {
        console.error(err);
        this.showToast('Lỗi kết nối server', 'error');
      });
  }

  render() {
    const { toast, showForgotModal } = this.state;

    return (
      <div className="login-container">
        {toast && (
          <div className={`login-toast login-toast--${toast.type}`}>
            {toast.type === 'success' ? '✓' : '⚠'} {toast.msg}
          </div>
        )}

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
              <h3>Welcome Back</h3>
              <p>Online Shopping Store</p>
              <p className="login-subtitle">Login to your account</p>
            </div>
          </div>

          {/* Right - Form */}
          <div className="login-card">
            <h2 className="login-title">CUSTOMER LOGIN</h2>

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
                <div className="password-header">
                  <label className="form-label">Password</label>
                  <span className="forgot-pwd-link" onClick={() => this.setState({ showForgotModal: true })}>
                    Quên mật khẩu?
                  </span>
                </div>
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
              <p>Secure login to access your account</p>
            </div>
          </div>

        </div>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="forgot-modal-overlay">
            <div className="forgot-modal-content">
              <button className="forgot-modal-close" onClick={() => this.setState({ showForgotModal: false })}>✕</button>
              
              <div className="forgot-icon">🔐</div>
              <h3 className="forgot-title">Khôi phục mật khẩu</h3>
              <p className="forgot-desc">Vui lòng nhập địa chỉ email bạn đã dùng để đăng ký. Chúng tôi sẽ gửi một liên kết để lấy lại mật khẩu.</p>
              
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="login-input"
                  value={this.state.resetEmail}
                  onChange={(e) => this.setState({ resetEmail: e.target.value })}
                />
              </div>

              <button className="forgot-btn-submit" onClick={this.handleForgotPassword}>
                Gửi liên kết khôi phục
              </button>

              <p className="forgot-or-text">Đã có token từ email?{' '}
                <span className="forgot-direct-link" onClick={() => { this.setState({ showForgotModal: false }); this.props.navigate('/reset-password'); }}>
                  Đặt lại ngay
                </span>
              </p>
            </div>
          </div>
        )}

      </div>
    );
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
    axios.post('/api/customer/login', account).then((res) => {
      const result = res.data;
      if (result.success === true) {
        this.context.setToken(result.token);
        this.context.setCustomer(result.customer);
        this.props.navigate('/home');
      } else {
        alert(result.message);
        this.setState({ txtUsername: '', txtPassword: '' });
      }
    });
  }
}

export default withRouter(Login);

