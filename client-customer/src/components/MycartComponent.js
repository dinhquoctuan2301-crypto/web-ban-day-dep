import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import MyContext from '../contexts/MyContext';
import CartUtil from '../utils/CartUtil';
import withRouter from '../utils/withRouter';
import './Mycart.css';

const VND_RATE = 24000;

function formatVND(usd) {
  const value = Number(usd) || 0;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(value * VND_RATE));
}

function getImgSrc(image) {
  if (!image) return 'https://via.placeholder.com/150x150?text=No+Image';
  if (image.startsWith('data:') || image.startsWith('http')) return image;
  return 'data:image/jpeg;base64,' + image;
}

class Mycart extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      toast: null,
      paymentMethod: 'COD', // COD or BANK
      showQRModal: false,
      showConfirmModal: false,
      showSuccessModal: false
    };
  }

  showToast(msg, type = 'success') {
    this.setState({ toast: { msg, type } });
    setTimeout(() => this.setState({ toast: null }), 2500);
  }

  /* ---- Quantity Controls ---- */
  updateQuantity(id, color, size, delta) {
    const mycart = [...this.context.mycart];
    const index = mycart.findIndex(x => x.product._id === id && x.color === color && x.size === size);
    if (index !== -1) {
      const newQty = mycart[index].quantity + delta;
      if (newQty > 0) {
        mycart[index].quantity = newQty;
        this.context.setMycart(mycart);
      }
    }
  }

  handleRemoveItem(id, color, size, name) {
    const mycart = [...this.context.mycart];
    const index = mycart.findIndex(x => x.product._id === id && x.color === color && x.size === size);
    if (index !== -1) {
      mycart.splice(index, 1);
      this.context.setMycart(mycart);
      this.showToast(`Đã xóa "${name}" khỏi giỏ hàng`, 'success');
    }
  }

  /* ---- Checkout Flow ---- */
  handleCheckoutClick = () => {
    if (this.context.mycart.length === 0) {
      this.showToast('Giỏ hàng của bạn đang trống', 'error');
      return;
    }

    const { customer, token } = this.context;
    if (!customer || !token) {
      this.showToast('Vui lòng đăng nhập để thanh toán', 'error');
      this.props.navigate('/login');
      return;
    }

    if (this.state.paymentMethod === 'BANK') {
      // Mở modal quét mã QR thay vì checkout ngay
      this.setState({ showQRModal: true });
    } else {
      // Mở modal xác nhận COD thay vì window.confirm
      this.setState({ showConfirmModal: true });
    }
  }

  handleConfirmCOD = () => {
    this.setState({ showConfirmModal: false });
    this.executeCheckout();
  }

  handleConfirmBankTransfer = () => {
    this.setState({ showQRModal: false });
    this.executeCheckout();
  }

  executeCheckout() {
    const total = CartUtil.getTotal(this.context.mycart);
    const items = this.context.mycart;
    const { customer } = this.context;
    
    const body = { total, items, customer };
    const config = { headers: { 'x-access-token': this.context.token } };

    axios.post('/api/customer/checkout', body, config)
      .then((res) => {
        if (res.data) {
          this.context.setMycart([]);
          // Thay thế alert bằng Modal thành công
          this.setState({ showSuccessModal: true });
        } else {
          this.showToast('Có lỗi xảy ra. Vui lòng thử lại!', 'error');
        }
      })
      .catch((err) => {
        console.error(err);
        this.showToast('Lỗi kết nối. Vui lòng thử lại!', 'error');
      });
  }

  handleSuccessClose = () => {
    this.setState({ showSuccessModal: false });
    this.props.navigate('/myorders');
  }

  render() {
    const { mycart } = this.context;
    const { toast, paymentMethod, showQRModal, showConfirmModal, showSuccessModal } = this.state;
    const totalUSD = CartUtil.getTotal(mycart);
    const totalVNDNum = Math.round((Number(totalUSD) || 0) * VND_RATE);

    // Link tạo mã VietQR tự động dựa trên số tiền
    const bankAccount = "19036789123456"; // Số tài khoản ảo ví dụ
    const bankName = "TCB"; // Techcombank
    const accountName = "CONG TY TNHH MYSHOP";
    const qrUrl = `https://img.vietqr.io/image/${bankName}-${bankAccount}-compact2.jpg?amount=${totalVNDNum}&addInfo=Thanh toan don hang&accountName=${encodeURIComponent(accountName)}`;

    return (
      <div className="cart-wrap">
        {/* Toast */}
        {toast && (
          <div className={`cart-toast cart-toast--${toast.type}`}>
            {toast.type === 'success' ? '✓' : '⚠'} {toast.msg}
          </div>
        )}

        <div className="cart-header">
          <h2 className="cart-title">Giỏ hàng của bạn</h2>
          <span className="cart-count-badge">{mycart.length} sản phẩm</span>
        </div>

        {mycart.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <p>Giỏ hàng của bạn đang trống.</p>
            <Link to="/home" className="cart-empty-btn">Tiếp tục mua sắm</Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Left: Item List */}
            <div className="cart-items-col">
              {mycart.map((item, idx) => (
                <div key={item.product._id + idx} className="cart-item-card">
                  <Link to={'/product/' + item.product._id} className="cart-item-img-wrap">
                    <img 
                      src={getImgSrc(item.product.image)} 
                      alt={item.product.name} 
                      className="cart-item-img"
                      crossOrigin="anonymous" 
                    />
                  </Link>
                  
                  <div className="cart-item-info">
                    {item.product.category && (
                      <span className="cart-item-cat">{item.product.category.name}</span>
                    )}
                    <Link to={'/product/' + item.product._id} className="cart-item-name">
                      {item.product.name}
                    </Link>
                    <div className="cart-item-price">{formatVND(item.product.price)}</div>
                    {(item.color || item.size) && (
                      <div className="cart-item-variant">
                        <span className="badge badge-muted" style={{fontSize: '11px', padding: '2px 6px', marginRight: '4px'}}>
                          {item.color} {item.size ? '- Size ' + item.size : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="cart-item-actions">
                    <div className="cart-qty-control">
                      <button 
                        className="cart-qty-btn" 
                        onClick={() => this.updateQuantity(item.product._id, item.color, item.size, -1)}
                        disabled={item.quantity <= 1}
                      >−</button>
                      <span className="cart-qty-val">{item.quantity}</span>
                      <button 
                        className="cart-qty-btn" 
                        onClick={() => this.updateQuantity(item.product._id, item.color, item.size, 1)}
                      >+</button>
                    </div>
                    
                    <div className="cart-item-total">
                      {formatVND(item.product.price * item.quantity)}
                    </div>

                    <button 
                      className="cart-remove-btn" 
                      onClick={() => this.handleRemoveItem(item.product._id, item.color, item.size, item.product.name)}
                      title="Xóa sản phẩm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Order Summary */}
            <div className="cart-summary-col">
              <div className="cart-summary-card">
                <h3 className="summary-title">Tóm tắt đơn hàng</h3>
                
                <div className="summary-row">
                  <span className="summary-label">Tạm tính</span>
                  <span className="summary-val">{formatVND(totalUSD)}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Phí giao hàng</span>
                  <span className="summary-val">Miễn phí</span>
                </div>
                
                <div className="summary-divider"></div>

                {/* Chọn phương thức thanh toán */}
                <div className="payment-methods">
                  <h4 className="payment-methods-title">Phương thức thanh toán</h4>
                  
                  <label className={`payment-option ${paymentMethod === 'COD' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="COD" 
                      checked={paymentMethod === 'COD'}
                      onChange={(e) => this.setState({ paymentMethod: e.target.value })}
                    />
                    <div className="payment-option-info">
                      <strong>Thanh toán khi nhận hàng (COD)</strong>
                      <p>Thanh toán bằng tiền mặt khi giao hàng</p>
                    </div>
                  </label>

                  <label className={`payment-option ${paymentMethod === 'BANK' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="BANK" 
                      checked={paymentMethod === 'BANK'}
                      onChange={(e) => this.setState({ paymentMethod: e.target.value })}
                    />
                    <div className="payment-option-info">
                      <strong>Chuyển khoản / Quét mã QR</strong>
                      <p>Thanh toán nhanh chóng qua Internet Banking</p>
                    </div>
                  </label>
                </div>
                
                <div className="summary-divider"></div>

                <div className="summary-row total-row">
                  <span className="summary-label">Tổng cộng</span>
                  <span className="summary-val total-val">{formatVND(totalUSD)}</span>
                </div>

                <button className="summary-checkout-btn" onClick={this.handleCheckoutClick}>
                  {paymentMethod === 'BANK' ? 'THANH TOÁN QUA NGÂN HÀNG' : 'ĐẶT HÀNG NGAY'}
                </button>
                
                <div className="summary-note">
                  <p>🔒 Thanh toán an toàn và bảo mật.</p>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* QR Code Modal for Bank Transfer */}
        {showQRModal && (
          <div className="qr-modal-overlay">
            <div className="qr-modal-content">
              <button className="qr-modal-close" onClick={() => this.setState({ showQRModal: false })}>✕</button>
              
              <h3 className="qr-modal-title">Thanh toán bằng mã QR</h3>
              <p className="qr-modal-subtitle">Vui lòng quét mã QR dưới đây bằng ứng dụng ngân hàng hoặc ví điện tử để thanh toán.</p>
              
              <div className="qr-code-box">
                <img src={qrUrl} alt="VietQR Code" className="qr-code-img" />
              </div>

              <div className="bank-info-box">
                <div className="bank-info-row">
                  <span>Ngân hàng:</span>
                  <strong>Techcombank (TCB)</strong>
                </div>
                <div className="bank-info-row">
                  <span>Chủ tài khoản:</span>
                  <strong>{accountName}</strong>
                </div>
                <div className="bank-info-row">
                  <span>Số tài khoản:</span>
                  <strong className="bank-acc-num">{bankAccount}</strong>
                </div>
                <div className="bank-info-row">
                  <span>Số tiền:</span>
                  <strong className="bank-amount">{formatVND(totalUSD)}</strong>
                </div>
                <div className="bank-info-row">
                  <span>Nội dung CK:</span>
                  <strong>Thanh toan don hang</strong>
                </div>
              </div>

              <div className="qr-modal-actions">
                <button className="btn-cancel-qr" onClick={() => this.setState({ showQRModal: false })}>
                  Quay lại
                </button>
                <button className="btn-confirm-qr" onClick={this.handleConfirmBankTransfer}>
                  Tôi đã chuyển khoản thành công
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm COD Modal */}
        {showConfirmModal && (
          <div className="qr-modal-overlay">
            <div className="qr-modal-content confirm-modal-content">
              <div className="confirm-icon">❓</div>
              <h3 className="qr-modal-title">Xác nhận đặt hàng</h3>
              <p className="qr-modal-subtitle" style={{marginBottom: '32px'}}>
                Bạn có chắc chắn muốn tiến hành đặt hàng với hình thức <strong>Thanh toán khi nhận hàng (COD)</strong>?
              </p>
              
              <div className="qr-modal-actions">
                <button className="btn-cancel-qr" onClick={() => this.setState({ showConfirmModal: false })}>
                  Hủy bỏ
                </button>
                <button className="btn-confirm-qr" onClick={this.handleConfirmCOD}>
                  Xác nhận đặt hàng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="qr-modal-overlay">
            <div className="qr-modal-content confirm-modal-content">
              <div className="success-icon">🎉</div>
              <h3 className="qr-modal-title" style={{color: 'var(--success)'}}>Đặt hàng thành công!</h3>
              <p className="qr-modal-subtitle" style={{marginBottom: '32px'}}>
                Cảm ơn bạn đã mua sắm tại MyShop. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn.
              </p>
              
              <div className="qr-modal-actions">
                <button className="btn-confirm-qr" style={{width: '100%'}} onClick={this.handleSuccessClose}>
                  Xem chi tiết đơn hàng
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }
}

export default withRouter(Mycart);