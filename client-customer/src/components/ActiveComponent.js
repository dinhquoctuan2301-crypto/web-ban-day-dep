import axios from 'axios';
import React, { Component } from 'react';
import './Active.css'; // 👈 thêm

class Active extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txtID: '',
      txtToken: ''
    };
  }

  render() {
    return (
      <div className="active-container">
        <div className="active-wrapper">
          <div className="active-left">
            <div className="active-decoration">
              <span className="title-icon">🔐</span>
            </div>
            <div className="active-info">
              <h3>Active Your Account</h3>
              <p>
                Nhập ID và token để kích hoạt tài khoản của bạn ngay lập tức.
                Quá trình nhanh chóng và bảo mật, giống như giao diện Login.
              </p>
              <p className="login-subtitle">
                Nếu bạn đã có tài khoản, hãy dùng thông tin được cấp để kích hoạt.
              </p>
            </div>
          </div>

          <div className="active-right">
            <div className="active-card">
              <h2 className="active-title">Active Account</h2>

              <form className="active-form">
                <table>
                  <tbody>
                    <tr>
                      <td className="label">ID</td>
                      <td>
                        <input
                          className="input"
                          type="text"
                          value={this.state.txtID}
                          onChange={(e) =>
                            this.setState({ txtID: e.target.value })
                          }
                        />
                      </td>
                    </tr>

                    <tr>
                      <td className="label">Token</td>
                      <td>
                        <input
                          className="input"
                          type="text"
                          value={this.state.txtToken}
                          onChange={(e) =>
                            this.setState({ txtToken: e.target.value })
                          }
                        />
                      </td>
                    </tr>

                    <tr>
                      <td></td>
                      <td>
                        <input
                          className="btn-active"
                          type="submit"
                          value="ACTIVE"
                          onClick={(e) => this.btnActiveClick(e)}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // event-handlers
  btnActiveClick(e) {
    e.preventDefault();
    const id = this.state.txtID;
    const token = this.state.txtToken;

    if (id && token) {
      this.apiActive(id, token);
    } else {
      alert('Please input id and token');
    }
  }

  // apis
  apiActive(id, token) {
    const body = { id: id, token: token };

    axios.post('/api/customer/active', body).then((res) => {
      const result = res.data;
      if (result) {
        alert('Good job!');
      } else {
        alert('Error! Please try again later.');
      }
    });
  }
}

export default Active;