const MyConstants = {
  DB_SERVER: process.env.DB_SERVER || 'cluster0.xnyxe6u.mongodb.net',
  DB_USER: process.env.DB_USER || 'bestlucikiel_db_user',
  DB_PASS: process.env.DB_PASS || 'rXe37HAXanNlh9aY',
  DB_DATABASE: process.env.DB_DATABASE || 'shoppingonline',

  JWT_SECRET: process.env.JWT_SECRET || '79301b8bf026f3a38abf9ed094f523fd17f12d00f2980d3fa7dc0ec469906a712491c5a6ac2823f5efcb74078f693af5e8d1c1c5dad8c71ddbd38bf0fa4fc2eb',
  JWT_EXPIRES: process.env.JWT_EXPIRES || '1y',

  EMAIL_USER: process.env.EMAIL_USER || 'bestlucikiel@gmail.com',
  EMAIL_PASS: process.env.EMAIL_PASS || 'qazwsxedc123@123....'
};

module.exports = MyConstants;