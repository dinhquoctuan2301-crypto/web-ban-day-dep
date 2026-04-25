import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import './ProductDetail.css';

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
      imgProduct: ''
    };
  }

  render() {
    const cates = this.state.categories.map((cate) => (
      <option key={cate._id} value={cate._id}>
        {cate.name}
      </option>
    ));

    return (
      <div className="product-detail-card">

        <h2 className="product-detail-title">PRODUCT DETAIL</h2>

        <form className="product-form">

          <label>ID</label>
          <input
            type="text"
            value={this.state.txtID}
            readOnly
          />

          <label>Name</label>
          <input
            type="text"
            value={this.state.txtName}
            onChange={(e) => this.setState({ txtName: e.target.value })}
          />

          <label>Price</label>
          <input
            type="text"
            value={this.state.txtPriceVND}
            onChange={(e) => this.setState({ txtPriceVND: e.target.value })}
            onBlur={(e) => this.setState({
              txtPrice: parseVNDString(e.target.value),
              txtPriceVND: formatVND(parseVNDString(e.target.value))
            })}
          />

          <label>Category</label>
          <select
            value={this.state.cmbCategory}
            onChange={(e) => this.setState({ cmbCategory: e.target.value })}
          >
            <option value="">-- Select Category --</option>
            {cates}
          </select>

          <label>Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => this.previewImage(e)}
          />

          {/* PREVIEW */}
          {this.state.imgProduct && (
            <img
              src={this.state.imgProduct}
              alt=""
              className="preview-img"
            />
          )}

          {/* BUTTONS */}
          <div className="btn-group">
            <button className="btn add" onClick={(e) => this.btnAddClick(e)}>
              ADD
            </button>
            <button className="btn update" onClick={(e) => this.btnUpdateClick(e)}>
              UPDATE
            </button>
            <button className="btn delete" onClick={(e) => this.btnDeleteClick(e)}>
              DELETE
            </button>
          </div>

        </form>
      </div>
    );
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
        imgProduct: 'data:ibase64mage/jpg;,' + this.props.item.image
      });
    }
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

  // BUTTONS
  btnAddClick(e) {
    e.preventDefault();
    const { txtName, txtPrice, cmbCategory, imgProduct } = this.state;

    const image = imgProduct.replace(/^data:image\/[a-z]+;base64,/, '');

    if (txtName && txtPrice !== '' && cmbCategory && image) {
      const prod = {
        name: txtName,
        price: txtPrice,
        category: cmbCategory,
        image: image
      };
      this.apiPostProduct(prod);
    } else {
      alert('Please fill all fields');
    }
  }

  btnUpdateClick(e) {
    e.preventDefault();
    const { txtID, txtName, txtPrice, cmbCategory, imgProduct } = this.state;

    const image = imgProduct.replace(/^data:image\/[a-z]+;base64,/, '');

    if (txtID && txtName && txtPrice !== '' && cmbCategory && image) {
      const prod = {
        name: txtName,
        price: txtPrice,
        category: cmbCategory,
        image: image
      };
      this.apiPutProduct(txtID, prod);
    } else {
      alert('Please fill all fields');
    }
  }

  btnDeleteClick(e) {
    e.preventDefault();
    if (window.confirm('Are you sure?')) {
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
        alert('Added successfully!');
        this.apiGetProducts();
      }
    });
  }

  apiPutProduct(id, prod) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/admin/products/' + id, prod, config).then((res) => {
      if (res.data) {
        alert('Updated successfully!');
        this.apiGetProducts();
      }
    });
  }

  apiDeleteProduct(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete('/api/admin/products/' + id, config).then((res) => {
      if (res.data) {
        alert('Deleted successfully!');
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