const paginationHelper = require("../../helpers/pagination.helper");
const Product = require("../../models/product.model");
const Account = require("../../models/account.model");

// [GET] /admin/productsBin
module.exports.index = async (req, res) => {
  const find = {
    deleted: true
  }

  // Search
  if (req.query.keyword) {
    const regex = new RegExp(req.query.keyword, "i");
    find.title = regex;
  }
  // End Search

  // Pagination
  const countRecords = await Product.countDocuments(find);
  const objectPagination = paginationHelper(req, countRecords);
  // End Pagination

  const products = await Product.find(find)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  for (const product of products) {
    const deletedBy = await Account.findOne({
      _id: product.deletedBy
    });

    product.deletedByFullName = deletedBy?.fullName;
  }

  res.render("admin/pages/productsBin/index", {
    pageTitle: "Khôi phục sản phẩm",
    keyword: req.query.keyword,
    products: products,
    objectPagination: objectPagination
  })
}

// [PATCH] /admin/productsBin/restore/:id
module.exports.restoreItem = async (req, res) => {
  if(!res.locals.role.permissions.includes("products_restore")) {
    res.send("Cannot access");
    return;
  }

  try {
    const id = req.params.id;
  
    await Product.updateOne({
      _id: id
    }, {
      deleted: false
    });
  
    req.flash("success", "Khôi phục sản phẩm thành công");
  } catch (error) {
    req.flash("error", "Khôi phục sản phẩm không thành công");
  }
  
  res.redirect("back");
}

// [PATCH] /admin/productsBin/restoreMulti
module.exports.restoreMulti = async (req, res) => {
  if(!res.locals.role.permissions.includes("products_restore")) {
    res.send("Cannot access");
    return;
  }

  try {
    let ids = req.body.ids;
    ids = ids.split(", ");
  
    await Product.updateMany({
      _id: { $in: ids }
    }, {
      deleted: false
    });
  
    req.flash("success", "Khôi phục sản phẩm thành công");
  } catch (error) {
    req.flash("error", "Khôi phục sản phẩm không thành công");
  }

  res.redirect(`back`);
}