import axios from 'axios';
import React, { Component } from 'react';
import withRouter from '../utils/withRouter';
import './ResetPassword.css';

class ResetPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txtID: '',
      txtToken: '',
      txtNewPassword: '',
      txtConfirmPassword: '',
      toast: null,
      loading: false,
      success: false
    };
  }

  showToast(msg, type = 'success') {
    this.setState({ toast: { msg, type } });
    setTimeout(() => this.setState({ toast: null }), 3000);
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { txtID, txtToken, txtNewPassword, txtConfirmPassword } = this.state;

    if (!txtID || !txtToken || !txtNewPassword || !txtConfirmPassword) {
      this.showToast('Vui lòng điền đầy đủ tất cả các trường', 'error');
      return;
    }

    if (txtNewPassword !== txtConfirmPassword) {
      this.showToast('Mật khẩu xác nhận không khớp', 'error');
      return;
    }

    if (txtNewPassword.length < 6) {
      this.showToast('Mật khẩu phải có ít nhất 6 ký tự', 'error');
      return;
    }

    this.setState({ loading: true });

    axios.post('/api/customer/reset-password', {
      id: txtID,
      token: txtToken,
      password: txtNewPassword
    })
      .then((res) => {
        this.setState({ loading: false });
        if (res.data.success) {
          this.setState({ success: true });
          this.showToast('Đặt lại mật khẩu thành công!', 'success');
          setTimeout(() => this.props.navigate('/login'), 2500);
        } else {
          this.showToast(res.data.message || 'Mã xác thực không hợp lệ', 'error');
        }
      })
      .catch((err) => {
        this.setState({ loading: false });
        console.error(err);
        this.showToast('Lỗi kết nối server', 'error');
      });
  }

  render() {
    const { txtID, txtToken, txtNewPassword, txtConfirmPassword, toast, loading, success } = this.state;

    return (
      <div className="rp-container">
        {/* Toast */}
        {toast && (
          <div className={`rp-toast rp-toast--${toast.type}`}>
            {toast.type === 'success' ? '✓' : '⚠'} {toast.msg}
          </div>
        )}

        <div className="rp-wrapper">
          {/* Left Decoration */}
          <div className="rp-left">
            <div className="rp-deco-icon">🔑</div>
            <div className="rp-info">
              <h3>Đặt lại mật khẩu</h3>
              <p>Nhập thông tin từ email khôi phục bạn đã nhận được và tạo mật khẩu mới an toàn.</p>
              <div className="rp-steps">
                <div className="rp-step">
                  <span className="rp-step-num">1</span>
                  <span>Kiểm tra email</span>
                </div>
                <div className="rp-step">
                  <span className="rp-step-num">2</span>
                  <span>Sao chép ID & Token</span>
                </div>
                <div className="rp-step">
                  <span className="rp-step-num">3</span>
                  <span>Nhập mật khẩu mới</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Form */}
          <div className="rp-card">
            {success ? (
              <div className="rp-success-state">
                <div className="rp-success-icon">🎉</div>
                <h2>Thành công!</h2>
                <p>Mật khẩu của bạn đã được đặt lại. Đang chuyển hướng về trang đăng nhập...</p>
              </div>
            ) : (
              <>
                <h2 className="rp-title">Đặt lại mật khẩu</h2>
                <p className="rp-subtitle">Nhập thông tin nhận được qua email</p>

                <form className="rp-form" onSubmit={this.handleSubmit}>
                  <div className="rp-form-group">
                    <label>ID tài khoản</label>
                    <input
                      type="text"
                      placeholder="Nhập ID từ email"
                      className="rp-input"
                      value={txtID}
                      onChange={(e) => this.setState({ txtID: e.target.value })}
                    />
                  </div>

                  <div className="rp-form-group">
                    <label>Token xác thực</label>
                    <input
                      type="text"
                      placeholder="Nhập Token từ email"
                      className="rp-input"
                      value={txtToken}
                      onChange={(e) => this.setState({ txtToken: e.target.value })}
                    />
                  </div>

                  <div className="rp-divider">
                    <span>Mật khẩu mới</span>
                  </div>

                  <div className="rp-form-group">
                    <label>Mật khẩu mới</label>
                    <input
                      type="password"
                      placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                      className="rp-input"
                      value={txtNewPassword}
                      onChange={(e) => this.setState({ txtNewPassword: e.target.value })}
                    />
                  </div>

                  <div className="rp-form-group">
                    <label>Xác nhận mật khẩu</label>
                    <input
                      type="password"
                      placeholder="Nhập lại mật khẩu mới"
                      className={`rp-input ${txtConfirmPassword && txtNewPassword !== txtConfirmPassword ? 'rp-input--error' : ''}`}
                      value={txtConfirmPassword}
                      onChange={(e) => this.setState({ txtConfirmPassword: e.target.value })}
                    />
                    {txtConfirmPassword && txtNewPassword !== txtConfirmPassword && (
                      <span className="rp-error-msg">Mật khẩu không khớp</span>
                    )}
                  </div>

                  <button type="submit" className="rp-btn" disabled={loading}>
                    {loading ? <span className="rp-spinner"></span> : 'ĐẶT LẠI MẬT KHẨU'}
                  </button>
                </form>

                <p className="rp-footer-link">
                  Nhớ mật khẩu rồi?{' '}
                  <span className="rp-link" onClick={() => this.props.navigate('/login')}>
                    Đăng nhập ngay
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(ResetPassword);
