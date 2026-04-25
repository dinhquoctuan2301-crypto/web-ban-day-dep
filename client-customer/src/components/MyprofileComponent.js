import axios from 'axios';
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import MyContext from '../contexts/MyContext';
import './Myprofile.css'; // 👈 thêm

class Myprofile extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtUsername: '',
      txtPassword: '',
      txtName: '',
      txtPhone: '',
      txtEmail: ''
    };
  }

  render() {
    if (this.context.token === '') return <Navigate replace to="/login" />;

    return (
      <div className="profile-container">

        <h2 className="profile-title">👤 MY PROFILE</h2>

        <form className="profile-form">
          <table>
            <tbody>

              <tr>
                <td className="label">Username</td>
                <td>
                  <input
                    className="input"
                    type="text"
                    value={this.state.txtUsername}
                    onChange={(e) =>
                      this.setState({ txtUsername: e.target.value })
                    }
                  />
                </td>
              </tr>

              <tr>
                <td className="label">Password</td>
                <td>
                  <input
                    className="input"
                    type="password"
                    value={this.state.txtPassword}
                    onChange={(e) =>
                      this.setState({ txtPassword: e.target.value })
                    }
                  />
                </td>
              </tr>

              <tr>
                <td className="label">Name</td>
                <td>
                  <input
                    className="input"
                    type="text"
                    value={this.state.txtName}
                    onChange={(e) =>
                      this.setState({ txtName: e.target.value })
                    }
                  />
                </td>
              </tr>

              <tr>
                <td className="label">Phone</td>
                <td>
                  <input
                    className="input"
                    type="tel"
                    value={this.state.txtPhone}
                    onChange={(e) =>
                      this.setState({ txtPhone: e.target.value })
                    }
                  />
                </td>
              </tr>

              <tr>
                <td className="label">Email</td>
                <td>
                  <input
                    className="input"
                    type="email"
                    value={this.state.txtEmail}
                    onChange={(e) =>
                      this.setState({ txtEmail: e.target.value })
                    }
                  />
                </td>
              </tr>

              <tr>
                <td></td>
                <td>
                  <input
                    className="btn-update"
                    type="submit"
                    value="UPDATE"
                    onClick={(e) => this.btnUpdateClick(e)}
                  />
                </td>
              </tr>

            </tbody>
          </table>
        </form>

      </div>
    );
  }

  componentDidMount() {
    if (this.context.customer) {
      this.setState({
        txtUsername: this.context.customer.username,
        txtPassword: this.context.customer.password,
        txtName: this.context.customer.name,
        txtPhone: this.context.customer.phone,
        txtEmail: this.context.customer.email
      });
    }
  }

  // event
  btnUpdateClick(e) {
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
      alert('Please fill all fields');
    }
  }

  // api
  apiPutCustomer(id, customer) {
    const config = { headers: { 'x-access-token': this.context.token } };

    axios.put('/api/customer/customers/' + id, customer, config).then((res) => {
      if (res.data) {
        alert('Update success!');
        this.context.setCustomer(res.data);
      } else {
        alert('Error! Please try again.');
      }
    });
  }
}

export default Myprofile;