import axios from 'axios';
import React, { Component } from 'react';
import withRouter from '../utils/withRouter';
import './Active.css';

class Active extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txtID: '',
      txtToken: '',
      toast: null,
      loading: false,
      success: false
    };
  }

  showToast(msg, type = 'success') {
    this.setState({ toast: { msg, type } });
    setTimeout(() => this.setState({ toast: null }), 3000);
  }

  handleActive = (e) => {
    e.preventDefault();
    const { txtID, txtToken } = this.state;

    if (!txtID || !txtToken) {
      this.showToast('Vui lòng điền ID và Token từ email', 'error');
      return;
    }

    this.setState({ loading: true });

    axios.post('/api/customer/active', { id: txtID, token: txtToken })
      .then((res) => {
        this.setState({ loading: false });
        if (res.data) {
          this.setState({ success: true });
          this.showToast('Kích hoạt tài khoản thành công!', 'success');
          setTimeout(() => this.props.navigate('/login'), 2500);
        } else {
          this.showToast('ID hoặc Token không hợp lệ', 'error');
        }
      })
      .catch(() => {
        this.setState({ loading: false });
        this.showToast('Lỗi kết nối server', 'error');
      });
  }

  render() {
    const { txtID, txtToken, toast, loading, success } = this.state;

    return (
      <div className="active-container">
        {toast && (
          <div className={`active-toast active-toast--${toast.type}`}>
            {toast.type === 'success' ? '✓' : '⚠'} {toast.msg}
          </div>
        )}

        <div className="active-wrapper">
          {/* Left Decoration */}
          <div className="active-left">
            <div className="active-deco-icon">✉️</div>
            <div className="active-info">
              <h3>Kích hoạt tài khoản</h3>
              <p>
                Kiểm tra hộp thư email bạn đã đăng ký. Chúng tôi đã gửi một email chứa <strong>ID</strong> và <strong>Token</strong> để kích hoạt.
              </p>
              <div className="active-steps">
                <div className="active-step">
                  <span className="active-step-num">1</span>
                  <span>Mở email từ <strong>MyShop</strong></span>
                </div>
                <div className="active-step">
                  <span className="active-step-num">2</span>
                  <span>Sao chép <strong>ID</strong> và <strong>Token</strong></span>
                </div>
                <div className="active-step">
                  <span className="active-step-num">3</span>
                  <span>Nhập vào đây và bấm Kích hoạt</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card */}
          <div className="active-card">
            {success ? (
              <div className="active-success-state">
                <div className="active-success-icon">🎉</div>
                <h2>Kích hoạt thành công!</h2>
                <p>Tài khoản của bạn đã được kích hoạt. Đang chuyển hướng về trang đăng nhập...</p>
              </div>
            ) : (
              <>
                <h2 className="active-title">Kích hoạt tài khoản</h2>
                <p className="active-subtitle">Nhập thông tin từ email xác thực</p>

                <form className="active-form-new" onSubmit={this.handleActive}>
                  <div className="active-form-group">
                    <label>ID tài khoản</label>
                    <input
                      type="text"
                      placeholder="Nhập ID từ email"
                      className="active-input"
                      value={txtID}
                      onChange={(e) => this.setState({ txtID: e.target.value })}
                    />
                  </div>

                  <div className="active-form-group">
                    <label>Token xác thực</label>
                    <input
                      type="text"
                      placeholder="Nhập Token từ email"
                      className="active-input"
                      value={txtToken}
                      onChange={(e) => this.setState({ txtToken: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="active-btn-submit" disabled={loading}>
                    {loading ? <span className="active-spinner"></span> : 'KÍCH HOẠT TÀI KHOẢN'}
                  </button>
                </form>

                <p className="active-footer-link">
                  Chưa nhận được email?{' '}
                  <span className="active-link" onClick={() => this.props.navigate('/signup')}>
                    Đăng ký lại
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

export default withRouter(Active);