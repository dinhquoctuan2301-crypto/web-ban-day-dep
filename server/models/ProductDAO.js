require('../utils/MongooseUtil');
const mongoose = require('mongoose');
const Models = require('./Models');

const ProductDAO = {
  async getSoldCount(productId) {
    const id = new mongoose.Types.ObjectId(productId);
    const items = await Models.Order.aggregate([
      { $match: { status: 'APPROVED' } },
      { $unwind: '$items' },
      { $match: { 'items.product._id': id } },
      { $group: { _id: null, total: { $sum: '$items.quantity' } } }
    ]).exec();
    return items.length ? items[0].total : 0;
  },
  async attachSoldCount(product) {
    if (!product) return product;
    const prod = product.toObject ? product.toObject() : { ...product };
    prod.soldCount = await ProductDAO.getSoldCount(prod._id);
    return prod;
  },
  async attachSoldCountList(products) {
    if (!Array.isArray(products)) return products;
    return Promise.all(products.map((product) => ProductDAO.attachSoldCount(product)));
  },
  async selectByCount() {
    const query = {};
    const noProducts = await Models.Product.find(query).count().exec();
    return noProducts;
  },
  async selectBySkipLimit(skip, limit) {
    const query = {};
    const products = await Models.Product.find(query).skip(skip).limit(limit).exec();
    return products;
  },
  async insert(product) {
    const mongoose = require('mongoose');
    product._id = new mongoose.Types.ObjectId();
    const result = await Models.Product.create(product);
    return result;
  },
  async selectByID(_id) {
    const product = await Models.Product.findById(_id).exec();
    return product;
  },
  async update(product) {
    const newvalues = { name: product.name, price: product.price, image: product.image, category: product.category };
    const result = await Models.Product.findByIdAndUpdate(product._id, newvalues, { new: true });
    return result;
  },
  async delete(_id) {
    const result = await Models.Product.findByIdAndRemove(_id);
    return result;
  },
  async selectByID(_id) {
    const product = await Models.Product.findById(_id).exec();
    return ProductDAO.attachSoldCount(product);
  },
  async selectTopNew(top) {
    const query = {};
    const mysort = { cdate: -1 }; // descending
    const products = await Models.Product.find(query).sort(mysort).limit(top).exec();
    return ProductDAO.attachSoldCountList(products);
  },
  async selectTopHot(top) {
    const items = await Models.Order.aggregate([
      { $match: { status: 'APPROVED' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product._id', sum: { $sum: '$items.quantity' } } },
      { $sort: { sum: -1 } }, // descending
      { $limit: top }
    ]).exec();
    var products = [];
    for (const item of items) {
      const product = await ProductDAO.selectByID(item._id);
      products.push(product);
    }
    return ProductDAO.attachSoldCountList(products);
  },
  async selectByCatID(_cid) {
    const query = { 'category._id': _cid };
    const products = await Models.Product.find(query).exec();
    return ProductDAO.attachSoldCountList(products);
  },
  async selectByKeyword(keyword) {
    const query = { name: { $regex: new RegExp(keyword, "i") } };
    const products = await Models.Product.find(query).exec();
    return ProductDAO.attachSoldCountList(products);
  }
};
module.exports = ProductDAO;