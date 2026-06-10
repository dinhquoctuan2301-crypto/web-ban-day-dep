import axios from 'axios';
import React, { Component } from 'react';
import withRouter from '../utils/withRouter';
import './Signup.css';

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txtUsername: '',
      txtPassword: '',
      txtName: '',
      txtPhone: '',
      txtEmail: '',
      toast: null
    };
  }

  showToast(msg, type = 'success') {
    this.setState({ toast: { msg, type } });
    setTimeout(() => this.setState({ toast: null }), 3000);
  }

  render() {
    const { toast } = this.state;
    return (
      <div className="signup-container">
        {toast && (
          <div className={`signup-toast signup-toast--${toast.type}`}>
            {toast.type === 'success' ? '✓' : '⚠'} {toast.msg}
          </div>
        )}
        <div className="signup-wrapper">
          
          {/* Left - Decoration */}
          <div className="signup-left">
            <div className="signup-decoration">
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
            <div className="signup-info">
              <h3>Join Us Today</h3>
              <p>Online Shopping Store</p>
              <p className="signup-subtitle">Create your account</p>
            </div>
          </div>

          {/* Right - Form */}
          <div className="signup-card">
            <h2 className="signup-title">CREATE ACCOUNT</h2>

            <form className="signup-form">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  placeholder="Choose a username"
                  className="signup-input"
                  value={this.state.txtUsername}
                  onChange={(e) => this.setState({ txtUsername: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  placeholder="Create a password"
                  className="signup-input"
                  value={this.state.txtPassword}
                  onChange={(e) => this.setState({ txtPassword: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="signup-input"
                  value={this.state.txtName}
                  onChange={(e) => this.setState({ txtName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  className="signup-input"
                  value={this.state.txtPhone}
                  onChange={(e) => this.setState({ txtPhone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="signup-input"
                  value={this.state.txtEmail}
                  onChange={(e) => this.setState({ txtEmail: e.target.value })}
                />
              </div>

              <button
                className="signup-btn"
                onClick={(e) => this.btnSignupClick(e)}
              >
                SIGN UP
              </button>
            </form>

            <div className="signup-footer">
              <p>Your information is secure with us</p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // event
  btnSignupClick(e) {
    e.preventDefault();

    const { txtUsername, txtPassword, txtName, txtPhone, txtEmail } = this.state;

    if (txtUsername && txtPassword && txtName && txtPhone && txtEmail) {
      const account = {
        username: txtUsername,
        password: txtPassword,
        name: txtName,
        phone: txtPhone,
        email: txtEmail
      };

      this.apiSignup(account);
    } else {
      this.showToast('Vui lòng điền đầy đủ thông tin', 'error');
    }
  }

  // api
  apiSignup(account) {
    axios.post('/api/customer/signup', account).then((res) => {
      if (res.data.success === true) {
        this.showToast(res.data.message, 'success');
        setTimeout(() => this.props.navigate('/active'), 1500);
      } else {
        this.showToast(res.data.message, 'error');
      }
    }).catch(err => {
      this.showToast('Lỗi kết nối server', 'error');
    });
  }
}

export default withRouter(Signup);