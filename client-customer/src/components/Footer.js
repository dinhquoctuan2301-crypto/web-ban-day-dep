import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Footer.css";

const POLICIES = [
  {
    title: 'Chính sách giao hàng',
    content: 'MyShop cung cấp dịch vụ giao hàng Miễn phí toàn quốc cho đơn từ 500.000 VNĐ.\n\nThời gian giao hàng:\n- Nội thành: 1–2 ngày làm việc.\n- Ngoại thành & Tỉnh khác: 2–4 ngày làm việc.'
  },
  {
    title: 'Chính sách đổi trả',
    content: 'Hỗ trợ đổi trả miễn phí trong vòng 30 ngày kể từ ngày nhận hàng.\n\nĐiều kiện:\n- Còn nguyên tem mác, hộp đựng.\n- Chưa qua sử dụng.\n- Lỗi từ nhà sản xuất hoặc không vừa size.'
  },
  {
    title: 'Hướng dẫn bảo quản',
    content: 'Để giày bền đẹp:\n\n1. Hạn chế tiếp xúc nước lâu.\n2. Không phơi dưới nắng gắt.\n3. Dùng bàn chải mềm + dung dịch chuyên dụng.\n4. Nhét giấy báo khi không sử dụng.'
  },
  {
    title: 'Liên hệ Hotline',
    content: 'Hỗ trợ khách hàng:\n\n📞 Tổng đài: 1900 1234 (Phím 1)\n💬 Zalo: 0909 123 456\n⏰ Giờ làm việc: 8:00–22:00 tất cả các ngày.'
  },
];

const TRUST_BADGES = [
  { icon: '🏛️', label: 'Đăng ký Bộ Công Thương' },
  { icon: '🔒', label: 'SSL Secured' },
  { icon: '✅', label: 'Hàng Chính Hãng 100%' },
  { icon: '⚡', label: 'Giao Nhanh 24h' },
];

const PAYMENTS = ['VISA', 'MC', 'JCB', 'Momo', 'ZaloPay', 'COD'];

function Footer() {
  const [categories, setCategories]   = useState([]);
  const [modalContent, setModalContent] = useState(null);
  const [email, setEmail]             = useState('');
  const [subMsg, setSubMsg]           = useState('');

  useEffect(() => {
    axios.get('/api/customer/categories')
      .then(res => { if (res.data) setCategories(res.data); })
      .catch(err => console.error(err));
  }, []);

  const openModal  = (title, content) => setModalContent({ title, content });
  const closeModal = () => setModalContent(null);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.includes('@')) { setSubMsg('⚠ Email không hợp lệ!'); return; }
    setSubMsg('✓ Đăng ký thành công! Cảm ơn bạn.');
    setEmail('');
    setTimeout(() => setSubMsg(''), 3500);
  };

  return (
    <footer className="footer">

      {/* Trust badges strip */}
      <div className="footer-trust-strip">
        <div className="footer-trust-inner">
          {TRUST_BADGES.map((b, i) => (
            <div key={i} className="trust-badge-item">
              <span className="trust-badge-icon">{b.icon}</span>
              <span className="trust-badge-label">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="footer-newsletter">
        <div className="newsletter-inner">
          <div className="newsletter-text">
            <h3>📬 Đăng Ký Nhận Ưu Đãi</h3>
            <p>Nhận ngay voucher 50.000₫ cho đơn hàng đầu tiên!</p>
          </div>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email" value={email} placeholder="Nhập email của bạn..."
              onChange={e => setEmail(e.target.value)}
              className="newsletter-input" aria-label="Email đăng ký nhận bản tin"
            />
            <button type="submit" className="newsletter-btn">Đăng Ký</button>
          </form>
          {subMsg && <p className="newsletter-msg">{subMsg}</p>}
        </div>
      </div>

      {/* Main columns */}
      <div className="footer-container">

        {/* Col 1 — Brand */}
        <div className="footer-col footer-col--brand">
          <div className="footer-logo">
            <span className="footer-logo-icon">🛍️</span>
            <span className="footer-logo-text">MyShop</span>
          </div>
          <p className="footer-brand-desc">
            Website bán giày chất lượng cao — Mang đến những bước đi tự tin và thoải mái nhất cho bạn.
          </p>
          <div className="footer-socials">
            {[
              { href: 'https://facebook.com',  icon: '📘', label: 'Facebook' },
              { href: 'https://instagram.com', icon: '📸', label: 'Instagram' },
              { href: 'https://tiktok.com',    icon: '🎵', label: 'TikTok' },
              { href: 'mailto:support@myshop.com', icon: '✉️', label: 'Email' },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                className="footer-social-btn" title={s.label} aria-label={s.label}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Col 2 — Categories */}
        <div className="footer-col">
          <h4 className="footer-col-title">Danh Mục</h4>
          <nav className="footer-links">
            {categories.slice(0, 6).map(cat => (
              <Link key={cat._id} to={'/product/category/' + cat._id} className="footer-link">
                → {cat.name}
              </Link>
            ))}
            {categories.length === 0 && <p className="footer-loading">Đang tải...</p>}
          </nav>
        </div>

        {/* Col 3 — Support */}
        <div className="footer-col">
          <h4 className="footer-col-title">Hỗ Trợ</h4>
          <nav className="footer-links">
            {POLICIES.map(p => (
              <button key={p.title} className="footer-link footer-link--btn"
                onClick={() => openModal(p.title, p.content)}>
                → {p.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Col 4 — Contact */}
        <div className="footer-col">
          <h4 className="footer-col-title">Liên Hệ</h4>
          <div className="footer-contact-list">
            <div className="footer-contact-item"><span>📍</span> 123 Đường ABC, Q.1, TP.HCM</div>
            <div className="footer-contact-item"><span>📞</span> 1900 1234</div>
            <div className="footer-contact-item"><span>✉️</span> support@myshop.com</div>
            <div className="footer-contact-item"><span>⏰</span> 8:00 – 22:00 mỗi ngày</div>
          </div>
          <div className="footer-payments">
            <p className="footer-payment-title">Thanh toán</p>
            <div className="footer-payment-icons">
              {PAYMENTS.map(p => (
                <span key={p} className="payment-chip">{p}</span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <span>© 2026 MyShop. All rights reserved.</span>
        <span className="footer-bottom-sep">·</span>
        <span>Made with ❤️ in Vietnam</span>
      </div>

      {/* Modal */}
      {modalContent && (
        <div className="footer-modal-overlay" onClick={closeModal}>
          <div className="footer-modal-content" onClick={e => e.stopPropagation()}>
            <button className="footer-modal-close" onClick={closeModal} aria-label="Đóng">✕</button>
            <h3>{modalContent.title}</h3>
            <div className="footer-modal-body">
              {modalContent.content.split('\n').map((line, idx) => (
                <p key={idx}>{line || <br />}</p>
              ))}
            </div>
          </div>
        </div>
      )}

    </footer>
  );
}

export default Footer;