import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import './Menu.css';

class Menu extends Component {
  static contextType = MyContext;

  render() {
    return (
      <div className="admin-topbar">

        <div className="topbar-left">
          ADMIN SYSTEM
        </div>

        <div className="topbar-right">
          Hello <b>{this.context.username}</b>

          <button
            className="logout-btn"
            onClick={() => this.lnkLogoutClick()}
          >
            Logout
          </button>
        </div>

      </div>
    );
  }

  lnkLogoutClick() {
    this.context.setToken('');
    this.context.setUsername('');
  }
}

export default Menu;