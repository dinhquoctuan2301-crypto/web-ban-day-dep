import axios from 'axios';
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import MyContext from '../contexts/MyContext';
import './Myprofile.css';

class Myprofile extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtUsername: '',
      txtPassword: '',
      txtName: '',
      txtPhone: '',
      txtEmail: '',
      toast: null,
      isEditing: false
    };
  }

  componentDidMount() {
    if (this.context.customer) {
      const { username, password, name, phone, email } = this.context.customer;
      this.setState({
        txtUsername: username,
        txtPassword: password,
        txtName: name,
        txtPhone: phone,
        txtEmail: email
      });
    }
  }

  showToast(msg, type = 'success') {
    this.setState({ toast: { msg, type } });
    setTimeout(() => this.setState({ toast: null }), 2500);
  }

  // EVENT HANDLERS
  handleUpdate = (e) => {
    e.preventDefault();
    const { txtUsername, txtPassword, txtName, txtPhone, txtEmail } = this.state;
    if (txtUsername && txtPassword && txtName && txtPhone && txtEmail) {
      const customer = { 
        username: txtUsername, 
        password: txtPassword, 
        name: txtName, 
        phone: txtPhone, 
        email: txtEmail 
      };
      this.apiPutCustomer(this.context.customer._id, customer);
    } else {
      this.showToast('Vui lòng nhập đầy đủ thông tin', 'error');
    }
  }

  // API
  apiPutCustomer(id, customer) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/customer/customers/' + id, customer, config)
      .then((res) => {
        if (res.data) {
          this.showToast('Cập nhật hồ sơ thành công!', 'success');
          this.context.setCustomer(res.data);
          this.setState({ isEditing: false });
        } else {
          this.showToast('Có lỗi xảy ra', 'error');
        }
      })
      .catch(err => {
        console.error(err);
        this.showToast('Lỗi kết nối', 'error');
      });
  }

  getAvatarLetter() {
    const name = this.state.txtName || 'U';
    return name.charAt(0).toUpperCase();
  }

  render() {
    if (this.context.token === '') return <Navigate replace to='/login' />;
    
    const { txtUsername, txtPassword, txtName, txtPhone, txtEmail, toast, isEditing } = this.state;

    return (
      <div className="profile-wrap">
        {toast && (
          <div className={`profile-toast profile-toast--${toast.type}`}>
            {toast.type === 'success' ? '✓' : '⚠'} {toast.msg}
          </div>
        )}

        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {this.getAvatarLetter()}
            </div>
            <div className="profile-header-info">
              <h2 className="profile-name">{this.context.customer?.name}</h2>
              <p className="profile-role">Thành viên MyShop</p>
            </div>
            {!isEditing && (
              <button className="profile-edit-toggle" onClick={() => this.setState({ isEditing: true })}>
                ✏️ Chỉnh sửa
              </button>
            )}
          </div>

          <div className="profile-body">
            <h3 className="profile-section-title">Thông tin cá nhân</h3>
            
            <form className="profile-form" onSubmit={this.handleUpdate}>
              
              <div className="form-group">
                <label className="form-label">Tên tài khoản</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={txtUsername} 
                  onChange={(e) => this.setState({ txtUsername: e.target.value })} 
                  disabled={true} // username usually shouldn't be changed easily or depends on logic, but keeping original logic:
                  readOnly
                  title="Tên tài khoản không thể thay đổi"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mật khẩu</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={txtPassword} 
                  onChange={(e) => this.setState({ txtPassword: e.target.value })} 
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Họ và tên</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={txtName} 
                  onChange={(e) => this.setState({ txtName: e.target.value })} 
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  value={txtPhone} 
                  onChange={(e) => this.setState({ txtPhone: e.target.value })} 
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={txtEmail} 
                  onChange={(e) => this.setState({ txtEmail: e.target.value })} 
                  disabled={!isEditing}
                  required
                />
              </div>

              {isEditing && (
                <div className="profile-actions">
                  <button type="button" className="btn-cancel" onClick={() => this.setState({ isEditing: false })}>
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn-save">
                    Lưu thay đổi
                  </button>
                </div>
              )}

            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default Myprofile;