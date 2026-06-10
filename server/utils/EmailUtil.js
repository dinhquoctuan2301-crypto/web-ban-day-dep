//CLI: npm install nodemailer --save
const nodemailer = require('nodemailer');
const MyConstants = require('./MyConstants');
const transporter = nodemailer.createTransport({
  service: 'gmail', // Sử dụng Gmail
  auth: {
    user: MyConstants.EMAIL_USER, 
    pass: MyConstants.EMAIL_PASS 
  }
});
const EmailUtil = {
  send(email, id, token) {
    const text = `Cảm ơn bạn đã đăng ký MyShop!\n\nVui lòng kích hoạt tài khoản của bạn bằng cách nhập ID và Token sau tại trang Active:\n\nID: ${id}\nToken: ${token}\n\nHoặc có thể bấm vào link sau nếu đã code xử lý link: http://localhost:3000/active?id=${id}&token=${token}`;
    return new Promise(function (resolve, reject) {
      const mailOptions = {
        from: MyConstants.EMAIL_USER,
        to: email,
        subject: 'MyShop - Xác thực tài khoản',
        text: text
      };
      transporter.sendMail(mailOptions, function (err, result) {
        if (err) {
          console.error('Email Error:', err.message);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  },
  sendResetPassword(email, id, token) {
    const text = `Bạn đã yêu cầu khôi phục mật khẩu tại MyShop.\n\nVui lòng sử dụng mã bảo mật sau để đặt lại mật khẩu:\n\nID: ${id}\nToken (Mã bảo mật): ${token}\n\nHãy nhập các thông tin trên tại trang Khôi phục mật khẩu của ứng dụng.`;
    return new Promise(function (resolve, reject) {
      const mailOptions = {
        from: MyConstants.EMAIL_USER,
        to: email,
        subject: 'MyShop - Khôi phục mật khẩu',
        text: text
      };
      transporter.sendMail(mailOptions, function (err, result) {
        if (err) {
          console.error('Email Error:', err.message);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
};
module.exports = EmailUtil;