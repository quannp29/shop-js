const Product = require("../../models/product.model");

// [GET] /
module.exports.index = async (req, res) => {
  const productFeatured = await Product.find({
    deleted: false,
    status: "active",
    featured: "1"
  }).limit(6).select("-description");

  for (const product of productFeatured) {
    product.priceNew = (product.price * (100 - product.discountPercentage) / 100).toFixed(0);
  }

  const productsNew = await Product.find({
    deleted: false,
    status: "active",
  }).sort({ position: "desc" }).limit(6).select("-description");

  for (const product of productsNew) {
    product.priceNew = (product.price * (100 - product.discountPercentage)/100).toFixed(0);
  }

  res.render("client/pages/home/index", {
    pageTitle: "Trang chủ",
    productFeatured: productFeatured,
    productsNew: productsNew
  });
};