import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class CategoryDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtID: '',
      txtName: ''
    };
  }

  render() {
    return (
      <div>
        <h2 className="admin-title">CATEGORY DETAIL</h2>

        <form className="form-card">
          <div className="form-group">
            <label>ID</label>
            <input
              type="text"
              value={this.state.txtID}
              readOnly
            />
          </div>

          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={this.state.txtName}
              onChange={(e) => this.setState({ txtName: e.target.value })}
            />
          </div>

          <div className="btn-group">
            <button onClick={(e) => this.btnAddClick(e)} className="btn add">
              ADD
            </button>

            <button onClick={(e) => this.btnUpdateClick(e)} className="btn update">
              UPDATE
            </button>

            <button onClick={(e) => this.btnDeleteClick(e)} className="btn delete">
              DELETE
            </button>
          </div>
        </form>
      </div>
    );
  }

  componentDidUpdate(prevProps) {
    if (this.props.item !== prevProps.item && this.props.item) {
      this.setState({
        txtID: this.props.item._id,
        txtName: this.props.item.name
      });
    }
  }

  btnAddClick(e) {
    e.preventDefault();
    const name = this.state.txtName;

    if (name) {
      this.apiPostCategory({ name });
    } else {
      alert('Please input name');
    }
  }

  btnUpdateClick(e) {
    e.preventDefault();
    const { txtID, txtName } = this.state;

    if (txtID && txtName) {
      this.apiPutCategory(txtID, { name: txtName });
    } else {
      alert('Missing data');
    }
  }

  btnDeleteClick(e) {
    e.preventDefault();

    if (window.confirm('Delete this category?')) {
      this.apiDeleteCategory(this.state.txtID);
    }
  }

  apiPostCategory(cate) {
    const config = { headers: { 'x-access-token': this.context.token } };

    axios.post('/api/admin/categories', cate, config).then(() => {
      this.apiGetCategories();
    });
  }

  apiPutCategory(id, cate) {
    const config = { headers: { 'x-access-token': this.context.token } };

    axios.put('/api/admin/categories/' + id, cate, config).then(() => {
      this.apiGetCategories();
    });
  }

  apiDeleteCategory(id) {
    const config = { headers: { 'x-access-token': this.context.token } };

    axios.delete('/api/admin/categories/' + id, config).then(() => {
      this.apiGetCategories();
    });
  }

  apiGetCategories() {
    const config = { headers: { 'x-access-token': this.context.token } };

    axios.get('/api/admin/categories', config).then((res) => {
      this.props.updateCategories(res.data);
    });
  }
}

export default CategoryDetail;