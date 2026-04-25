import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import CategoryDetail from './CategoryDetailComponent';
import './Category.css'; // 👈 thêm

class Category extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      itemSelected: null
    };
  }

  render() {
    const cates = this.state.categories.map((item) => {
      return (
        <tr
          key={item._id}
          className="table-row"
          onClick={() => this.trItemClick(item)}
        >
          <td>{item._id}</td>
          <td>{item.name}</td>
        </tr>
      );
    });

    return (
      <div className="admin-container">

        {/* LEFT: LIST */}
        <div className="category-list-card">
          <h2 className="admin-title">CATEGORY LIST</h2>

          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>{cates}</tbody>
          </table>
        </div>

        {/* RIGHT: DETAIL */}
        <div className="category-detail-card">
          <CategoryDetail
            item={this.state.itemSelected}
            updateCategories={this.updateCategories}
          />
        </div>

      </div>
    );
  }

  componentDidMount() {
    this.apiGetCategories();
  }

  updateCategories = (categories) => {
    this.setState({ categories: categories });
  }

  trItemClick(item) {
    this.setState({ itemSelected: item });
  }

  apiGetCategories() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/categories', config).then((res) => {
      this.setState({ categories: res.data });
    });
  }
}

export default Category;