import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import CategoryDetail from './CategoryDetailComponent';
import './Category.css';

class Category extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      itemSelected: null,
      toast: null
    };
  }

  showToast = (msg, type = 'success') => {
    this.setState({ toast: { msg, type } });
    setTimeout(() => this.setState({ toast: null }), 2500);
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

  render() {
    const { categories, itemSelected, toast } = this.state;

    return (
      <div className="category-wrap">

        {toast && (
          <div className={`admin-toast admin-toast--${toast.type}`}>{toast.msg}</div>
        )}

        <div className="category-layout">
          {/* CATEGORY LIST (Left) */}
          <div className="admin-panel">
            <div className="panel-header">
              <h3>Danh sách danh mục</h3>
              <span>{categories.length} danh mục</span>
            </div>
            
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{width: '30%'}}>ID Danh mục</th>
                    <th>Tên danh mục</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(item => {
                    const isSelected = itemSelected?._id === item._id;
                    return (
                      <tr
                        key={item._id}
                        className={`category-row ${isSelected ? 'selected' : ''}`}
                        onClick={() => this.trItemClick(item)}
                      >
                        <td><code className="category-id-code">{item._id}</code></td>
                        <td><strong>{item.name}</strong></td>
                      </tr>
                    );
                  })}
                  {categories.length === 0 && (
                    <tr><td colSpan="2" className="no-data">Chưa có danh mục nào.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* CATEGORY DETAIL FORM (Right) */}
          <div className="category-form-panel">
            <CategoryDetail
              item={itemSelected}
              updateCategories={this.updateCategories}
              showToast={this.showToast}
              onClearSelection={() => this.setState({ itemSelected: null })}
            />
          </div>
        </div>

      </div>
    );
  }

  apiGetCategories() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/categories', config).then((res) => {
      this.setState({ categories: res.data });
    });
  }
}

export default Category;