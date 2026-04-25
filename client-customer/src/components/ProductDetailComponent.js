import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import withRouter from '../utils/withRouter';
import './ProductDetail.css'; // 👈 thêm

const VND_RATE = 24000;
function formatVND(usd) {
  const price = Number(usd) || 0;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(price * VND_RATE));
}
function formatDate(ms) {
  return ms ? new Date(ms).toLocaleString('vi-VN') : 'Chưa cập nhật';
}

class ProductDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      product: null,
      txtQuantity: 1
    };
  }

  render() {
    const prod = this.state.product;

    if (prod != null) {
      return (
        <div className="detail-container">

          <h2 className="detail-title">🛍️ SHOE DETAILS</h2>

          <div className="detail-card">

            {/* IMAGE */}
            <div className="detail-left">
              <img
                src={"data:image/jpg;base64," + prod.image}
                alt=""
                className="detail-img"
              />
            </div>

            {/* INFO */}
            <div className="detail-right">

              <h3 className="detail-name">{prod.name}</h3>
              <div className="detail-badge">Premium Shoe</div>

              <p className="detail-price">{formatVND(prod.price)}</p>

              <p className="detail-meta">Cập nhật: {formatDate(prod.cdate)}</p>
              <p className="detail-meta">Đã bán: {prod.soldCount || 0}</p>

              <p className="detail-category">
                Category: <b>{prod.category.name}</b>
              </p>

              <form className="detail-form">

                <div className="quantity-box">
                  <label>Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={this.state.txtQuantity}
                    onChange={(e) =>
                      this.setState({ txtQuantity: e.target.value })
                    }
                  />
                </div>

                <button
                  className="btn-add"
                  onClick={(e) => this.btnAdd2CartClick(e)}
                >
                  🛒 ADD TO CART
                </button>

              </form>

            </div>

          </div>

        </div>
      );
    }

    return <div />;
  }

  componentDidMount() {
    const params = this.props.params;
    this.apiGetProduct(params.id);
  }

  // event
  btnAdd2CartClick(e) {
    e.preventDefault();

    const product = this.state.product;
    const quantity = parseInt(this.state.txtQuantity);

    if (quantity) {
      const mycart = this.context.mycart;
      const index = mycart.findIndex(
        (x) => x.product._id === product._id
      );

      if (index === -1) {
        mycart.push({ product, quantity });
      } else {
        mycart[index].quantity += quantity;
      }

      this.context.setMycart(mycart);
      alert('Added to cart!');
    } else {
      alert('Please input quantity');
    }
  }

  // api
  apiGetProduct(id) {
    axios.get('/api/customer/products/' + id).then((res) => {
      this.setState({ product: res.data });
    });
  }
}

export default withRouter(ProductDetail);