import axios from 'axios';
import React, { Component } from 'react';
import { NavLink } from 'react-router-dom'; // 👈 dùng NavLink
import withRouter from '../utils/withRouter';
import MyContext from '../contexts/MyContext';
import './Menu.css';

class Menu extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      txtKeyword: ''
    };
  }

  render() {
    // CATEGORY LIST
    const cates = this.state.categories.map((item) => (
      <li key={item._id}>
        <NavLink
          to={'/product/category/' + item._id}
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          {item.name}
        </NavLink>
      </li>
    ));

    return (
      <div className="menu-container">

        {/* LEFT MENU */}
        <div className="menu-left">
          <ul className="menu-list">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "menu-item active" : "menu-item"
                }
              >
                Home
              </NavLink>
            </li>

            {cates}
          </ul>
        </div>

        {/* SEARCH */}
        <div className="menu-right">
          <form className="search-box">
            <input
              type="search"
              placeholder="Search products..."
              value={this.state.txtKeyword}
              onChange={(e) =>
                this.setState({ txtKeyword: e.target.value })
              }
            />
            <button onClick={(e) => this.btnSearchClick(e)}>
              🔍
            </button>
          </form>
        </div>

      </div>
    );
  }

  componentDidMount() {
    this.apiGetCategories();
  }

  // SEARCH
  btnSearchClick(e) {
    e.preventDefault();
    this.props.navigate('/product/search/' + this.state.txtKeyword);
  }

  // API
  apiGetCategories() {
    axios.get('/api/customer/categories').then((res) => {
      this.setState({ categories: res.data });
    });
  }
}

export default withRouter(Menu);