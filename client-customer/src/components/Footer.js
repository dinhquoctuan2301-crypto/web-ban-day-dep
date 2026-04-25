import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <div className="footer">

      <div className="footer-container">

        {/* CỘT 1 */}
        <div className="footer-col">
          <h3>MyShop</h3>
          <p>Website bán giày chất lượng cao.</p>
        </div>

        {/* CỘT 2 */}
        <div className="footer-col">
          <h4>Danh mục</h4>
          <p>Sneakers</p>
          <p>Running Shoes</p>
          <p>Sandals</p>
        </div>

        {/* CỘT 3 */}
        <div className="footer-col">
          <h4>Hỗ trợ</h4>
          <p>Liên hệ</p>
          <p>Chính sách</p>
          <p>Đổi trả</p>
        </div>

        {/* CỘT 4 */}
        <div className="footer-col">
          <h4>Kết nối</h4>
          <p>Facebook</p>
          <p>Instagram</p>
          <p>Email</p>
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 MyShop. All rights reserved.
      </div>

    </div>
  );
}

export default Footer;