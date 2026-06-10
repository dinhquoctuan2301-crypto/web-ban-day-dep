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

  componentDidUpdate(prevProps) {
    if (this.props.item !== prevProps.item) {
      if (this.props.item) {
        this.setState({
          txtID: this.props.item._id,
          txtName: this.props.item.name
        });
      } else {
        this.clearForm();
      }
    }
  }

  clearForm = () => {
    this.setState({ txtID: '', txtName: '' });
    if (this.props.onClearSelection) this.props.onClearSelection();
  }

  render() {
    const { txtID, txtName } = this.state;
    const isEditing = !!txtID;

    return (
      <div className="admin-panel">
        <div className="panel-header">
          <h3>{isEditing ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</h3>
          {isEditing && (
            <button className="btn-clear" onClick={this.clearForm}>Hủy chọn</button>
          )}
        </div>

        <div className="panel-body">
          <form className="cate-form" onSubmit={e => e.preventDefault()}>
            
            {isEditing && (
              <div className="form-group">
                <label>ID Danh mục</label>
                <input
                  type="text"
                  className="form-control"
                  value={txtID}
                  readOnly
                  disabled
                />
              </div>
            )}

            <div className="form-group">
              <label>Tên danh mục *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập tên danh mục..."
                value={txtName}
                onChange={(e) => this.setState({ txtName: e.target.value })}
              />
            </div>

            <div className="cate-form-actions">
              {isEditing ? (
                <>
                  <button className="btn-primary" onClick={this.btnUpdateClick}>
                    LƯU
                  </button>
                  <button className="btn-danger" onClick={this.btnDeleteClick}>
                    XÓA
                  </button>
                </>
              ) : (
                <button className="btn-success" onClick={this.btnAddClick} style={{width:'100%'}}>
                  THÊM MỚI
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    );
  }

  // ACTIONS
  btnAddClick = () => {
    const name = this.state.txtName;
    if (name) {
      this.apiPostCategory({ name });
    } else {
      this.props.showToast('Vui lòng nhập tên danh mục', 'error');
    }
  }

  btnUpdateClick = () => {
    const { txtID, txtName } = this.state;
    if (txtID && txtName) {
      this.apiPutCategory(txtID, { name: txtName });
    } else {
      this.props.showToast('Vui lòng nhập tên danh mục', 'error');
    }
  }

  btnDeleteClick = () => {
    if (window.confirm('Bạn có chắc muốn xóa danh mục này?')) {
      if (this.state.txtID) {
        this.apiDeleteCategory(this.state.txtID);
      }
    }
  }

  // API
  apiPostCategory(cate) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.post('/api/admin/categories', cate, config).then(() => {
      this.props.showToast('Đã thêm danh mục!', 'success');
      this.clearForm();
      this.apiGetCategories();
    });
  }

  apiPutCategory(id, cate) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/admin/categories/' + id, cate, config).then(() => {
      this.props.showToast('Đã cập nhật danh mục!', 'success');
      this.apiGetCategories();
    });
  }

  apiDeleteCategory(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete('/api/admin/categories/' + id, config).then(() => {
      this.props.showToast('Đã xóa danh mục!', 'success');
      this.clearForm();
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