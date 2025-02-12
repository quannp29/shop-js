const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const paginationHelper = require("../../helpers/pagination.helper");

// [GET] /products/
module.exports.index = async (req, res) => {
  const find = {
    status: "active",
    deleted: false,
  };

  // Pagination
  const countRecords = await Product.countDocuments(find);
  const objectPagination = paginationHelper(req, countRecords, 6);
  // End Pagination

  const products = await Product.find(find)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip)
    .sort({ position: "desc" });

  for (const item of products) {
    item.priceNew = (
      (item.price * (100 - item.discountPercentage)) /
      100
    ).toFixed(0);
  }
  res.render("client/pages/products/index", {
    pageTitle: "Danh sách sản phẩm",
    products: products,
    objectPagination: objectPagination
  });
};

// [GET] /products/:slugCategory
module.exports.category = async (req, res) => {
  const slugCategory = req.params.slugCategory;

  const category = await ProductCategory.findOne({
    slug: slugCategory,
    deleted: false,
    status: "active",
  });

  if (!category) {
    res.redirect("/");
    return;
  }

  const getSubCategory = async (parent_id) => {
    let allSubs = [];

    const listSub = await ProductCategory.find({
      parent_id: parent_id,
      deleted: false,
      status: "active",
    }).select("id title");

    allSubs = [...listSub];

    for (const sub of listSub) {
      const childs = await getSubCategory(sub.id);
      allSubs = allSubs.concat(childs);
    }

    return allSubs;
  };

  const listSubCategory = await getSubCategory(category.id);
  const listIdSubCategory = listSubCategory.map((item) => item.id);

  const products = await Product.find({
    product_category_id: { $in: [category.id, ...listIdSubCategory] },
    status: "active",
    deleted: false,
  }).sort({ position: "desc" });

  for (const item of products) {
    item.priceNew = (
      (item.price * (100 - item.discountPercentage)) /
      100
    ).toFixed(0);
  }

  res.render("client/pages/products/index", {
    pageTitle: category.title,
    products: products,
  });
};

// [GET] /products/detail/:slug
module.exports.detail = async (req, res) => {
  const slug = req.params.slug;

  const product = await Product.findOne({
    slug: slug,
    deleted: false,
    status: "active",
  });

  const category = await ProductCategory.findOne({
    _id: product.product_category_id,
    deleted: false,
    status: "active",
  });

  product.category = category;
  product.priceNew = (
    (product.price * (100 - product.discountPercentage)) /
    100
  ).toFixed(0);

  if (product) {
    res.render("client/pages/products/detail", {
      pageTitle: product.title,
      product: product,
    });
  } else {
    res.redirect("/");
  }
};
