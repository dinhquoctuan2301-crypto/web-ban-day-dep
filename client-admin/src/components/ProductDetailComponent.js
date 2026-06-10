import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import './Product.css';

const VND_RATE = 24000;
function formatVND(usd) {
  const value = Number(usd) || 0;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(value * VND_RATE));
}

function parseVNDString(value) {
  const raw = String(value).replace(/[^0-9]/g, '');
  const vnd = Number(raw) || 0;
  return Math.round(vnd / VND_RATE);
}

class ProductDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      txtID: '',
      txtName: '',
      txtPrice: '',
      txtPriceVND: '',
      cmbCategory: '',
      imgProduct: '',
      isUploading: false,
      variants: []
    };
  }

  componentDidMount() {
    this.apiGetCategories();
  }

  componentDidUpdate(prevProps) {
    if (this.props.item && this.props.item !== prevProps.item) {
      this.setState({
        txtID: this.props.item._id,
        txtName: this.props.item.name,
        txtPrice: this.props.item.price,
        txtPriceVND: formatVND(this.props.item.price),
        cmbCategory: this.props.item.category?._id || '',
        imgProduct: this.props.item.image.startsWith('data:') ? this.props.item.image : 'data:image/jpg;base64,' + this.props.item.image,
        variants: this.props.item.variants || []
      });
    } else if (!this.props.item && prevProps.item) {
      this.clearForm();
    }
  }

  clearForm = () => {
    this.setState({
      txtID: '',
      txtName: '',
      txtPrice: '',
      txtPriceVND: '',
      cmbCategory: '',
      imgProduct: '',
      isUploading: false,
      variants: []
    });
    if (this.props.onClearSelection) this.props.onClearSelection();
  }

  render() {
    const { txtID, txtName, txtPriceVND, cmbCategory, imgProduct, categories } = this.state;
    const isEditing = !!txtID;

    return (
      <div className="admin-panel product-detail-panel">
        <div className="panel-header">
          <h3>{isEditing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h3>
          {isEditing && (
            <button className="btn-clear" onClick={this.clearForm}>Hủy chọn</button>
          )}
        </div>

        <div className="panel-body">
          <form className="prod-form" onSubmit={e => e.preventDefault()}>
            
            {isEditing && (
              <div className="form-group">
                <label>Mã sản phẩm</label>
                <input type="text" className="form-control" value={txtID} readOnly disabled />
              </div>
            )}

            <div className="form-group">
              <label>Tên sản phẩm *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập tên sản phẩm..."
                value={txtName}
                onChange={(e) => this.setState({ txtName: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group" style={{flex: 1}}>
                <label>Giá bán (VND) *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="0 đ"
                  value={txtPriceVND}
                  onChange={(e) => this.setState({ txtPriceVND: e.target.value })}
                  onBlur={(e) => {
                    const price = parseVNDString(e.target.value);
                    this.setState({
                      txtPrice: price,
                      txtPriceVND: formatVND(price)
                    });
                  }}
                />
              </div>

              <div className="form-group" style={{flex: 1}}>
                <label>Danh mục *</label>
                <select
                  className="form-control"
                  value={cmbCategory}
                  onChange={(e) => this.setState({ cmbCategory: e.target.value })}
                >
                  <option value="" disabled>-- Chọn danh mục --</option>
                  {categories.map((cate) => (
                    <option key={cate._id} value={cate._id}>{cate.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Hình ảnh *</label>
              <div className="upload-box">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => this.previewImage(e)}
                  id="prod-img-upload"
                  className="upload-input"
                />
                <label htmlFor="prod-img-upload" className="upload-label">
                  {imgProduct ? (
                    <img src={imgProduct} alt="Preview" className="upload-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <span>Click để tải ảnh lên</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* VARIANTS SECTION */}
            <div className="form-group">
              <label>Biến thể (Size, Màu sắc & Tồn kho)</label>
              <table className="admin-table" style={{marginTop:'8px', marginBottom:'8px'}}>
                <thead>
                  <tr>
                    <th>Màu sắc</th>
                    <th>Size</th>
                    <th>Tồn kho</th>
                    <th style={{width:'40px'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.variants.map((v, i) => (
                    <tr key={i}>
                      <td>
                        <input type="text" className="form-control" style={{padding:'4px 8px'}} value={v.color} onChange={e => this.updateVariant(i, 'color', e.target.value)} placeholder="Ví dụ: Đen" />
                      </td>
                      <td>
                        <input type="text" className="form-control" style={{padding:'4px 8px'}} value={v.size} onChange={e => this.updateVariant(i, 'size', e.target.value)} placeholder="Ví dụ: 40" />
                      </td>
                      <td>
                        <input type="number" className="form-control" style={{padding:'4px 8px'}} value={v.stock} onChange={e => this.updateVariant(i, 'stock', e.target.value)} placeholder="0" min="0" />
                      </td>
                      <td>
                        <button type="button" className="btn-danger" style={{padding:'4px 8px'}} onClick={() => this.removeVariant(i)}>✕</button>
                      </td>
                    </tr>
                  ))}
                  {this.state.variants.length === 0 && (
                    <tr><td colSpan="4" className="no-data">Chưa có biến thể nào.</td></tr>
                  )}
                </tbody>
              </table>
              <button type="button" className="btn-success" style={{fontSize:'13px', padding:'6px 12px'}} onClick={this.addVariant}>
                + Thêm biến thể
              </button>
            </div>

            <div className="prod-form-actions">
              {isEditing ? (
                <>
                  <button className="btn-primary" onClick={this.btnUpdateClick}>
                    LƯU CẬP NHẬT
                  </button>
                  <button className="btn-danger" onClick={this.btnDeleteClick}>
                    XÓA SẢN PHẨM
                  </button>
                </>
              ) : (
                <button className="btn-success" onClick={this.btnAddClick} style={{width:'100%'}}>
                  THÊM SẢN PHẨM
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    );
  }

  // IMAGE PREVIEW
  previewImage(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        this.setState({ imgProduct: evt.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  // VARIANTS METHODS
  addVariant = () => {
    this.setState({ variants: [...this.state.variants, { color: '', size: '', stock: 0 }] });
  }

  updateVariant = (index, field, value) => {
    const variants = [...this.state.variants];
    variants[index][field] = field === 'stock' ? Number(value) : value;
    this.setState({ variants });
  }

  removeVariant = (index) => {
    const variants = [...this.state.variants];
    variants.splice(index, 1);
    this.setState({ variants });
  }

  // ACTIONS
  btnAddClick = () => {
    const { txtName, txtPrice, cmbCategory, imgProduct, variants } = this.state;
    const image = imgProduct.replace(/^data:image\/[a-z]+;base64,/, '');

    if (txtName && txtPrice !== '' && cmbCategory && image) {
      const prod = { name: txtName, price: txtPrice, category: cmbCategory, image: image, variants: variants };
      this.apiPostProduct(prod);
    } else {
      this.props.showToast('Vui lòng điền đủ thông tin và chọn ảnh', 'error');
    }
  }

  btnUpdateClick = () => {
    const { txtID, txtName, txtPrice, cmbCategory, imgProduct, variants } = this.state;
    const image = imgProduct.replace(/^data:image\/[a-z]+;base64,/, '');

    if (txtID && txtName && txtPrice !== '' && cmbCategory && image) {
      const prod = { name: txtName, price: txtPrice, category: cmbCategory, image: image, variants: variants };
      this.apiPutProduct(txtID, prod);
    } else {
      this.props.showToast('Vui lòng điền đủ thông tin', 'error');
    }
  }

  btnDeleteClick = () => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      if (this.state.txtID) {
        this.apiDeleteProduct(this.state.txtID);
      }
    }
  }

  // API
  apiGetCategories() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/categories', config).then((res) => {
      this.setState({ categories: res.data });
    });
  }

  apiPostProduct(prod) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.post('/api/admin/products', prod, config).then((res) => {
      if (res.data) {
        this.props.showToast('Thêm sản phẩm thành công!', 'success');
        this.clearForm();
        this.apiGetProducts();
      }
    });
  }

  apiPutProduct(id, prod) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/admin/products/' + id, prod, config).then((res) => {
      if (res.data) {
        this.props.showToast('Cập nhật sản phẩm thành công!', 'success');
        this.apiGetProducts();
      }
    });
  }

  apiDeleteProduct(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete('/api/admin/products/' + id, config).then((res) => {
      if (res.data) {
        this.props.showToast('Đã xóa sản phẩm!', 'success');
        this.clearForm();
        this.apiGetProducts();
      }
    });
  }

  apiGetProducts() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/products?page=' + this.props.curPage, config).then((res) => {
      const result = res.data;
      this.props.updateProducts(result.products, result.noPages, result.curPage);
    });
  }
}

export default ProductDetail;