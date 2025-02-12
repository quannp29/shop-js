const ProductCategory = require("../../models/product-category.model");
const Account = require("../../models/account.model");
const systemConfig = require("../../config/system");
const createTreeHelper = require("../../helpers/createTree.helper");
const filterHelper = require("../../helpers/filter.helper");
const paginationHelper = require("../../helpers/pagination.helper");

// [GET] /admin/products-category/
module.exports.index = async (req, res) => {
  const find = {
    deleted: false,
  };

  // Filter
  const filterStatus = filterHelper(req);

  if (req.query.status) {
    find.status = req.query.status;
  }
  // End Filter

  // Search
  if (req.query.keyword) {
    const regex = new RegExp(req.query.keyword, "i");
    find.title = regex;
  }
  // End Search

  // Pagination
  const countRecords = await ProductCategory.countDocuments(find);
  const objectPagination = paginationHelper(req, countRecords);
  // End Pagination

  // Sort
  const sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    const sortKey = req.query.sortKey;
    const sortValue = req.query.sortValue;
    sort[sortKey] = sortValue;
  } else {
    sort.position = "asc";
  }
  // End Sort

  const records = await ProductCategory.find(find)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip)
    .sort(sort);

  for (const record of records) {
    const createdBy = await Account.findOne({
      _id: record.createdBy,
    });
    const updatedBy = await Account.findOne({
      _id: record.updatedBy,
    });
    record.createdByFullName = createdBy?.fullName;
    record.updatedByFullName = updatedBy?.fullName;
  }

  res.render("admin/pages/products-category/index", {
    pageTitle: "Danh mục sản phẩm",
    records: records,
    filterStatus: filterStatus,
    keyword: req.query.keyword,
    objectPagination: objectPagination,
  });
};

// [GET] /admin/products-category/create
module.exports.create = async (req, res) => {
  const records = await ProductCategory.find({
    deleted: false,
  });

  const newRecords = createTreeHelper(records);

  res.render("admin/pages/products-category/create", {
    pageTitle: "Thêm mới danh mục sản phẩm",
    records: newRecords,
  });
};

// [POST] /admin/products-category/create
module.exports.createPost = async (req, res) => {
  if (!res.locals.role.permissions.includes("products-category_create")) {
    res.send("Cannot access");
    return;
  }

  try {
    if (req.body.position) {
      req.body.position = parseInt(req.body.position);
    } else {
      const count = await ProductCategory.countDocuments();
      req.body.position = count + 1;
    }

    req.body.createdBy = res.locals.user.id;

    const record = new ProductCategory(req.body);
    await record.save();

    req.flash("success", "Thêm mới danh mục sản phẩm thành công");
  } catch (error) {
    req.flash("error", "Thêm mới danh mục sản phẩm không thành công");
  }

  res.redirect(`/${systemConfig.prefixAdmin}/products-category`);
};

// [PATCH] /admin/products-category/:status/:id
module.exports.changeStatus = async (req, res) => {
  if(!res.locals.role.permissions.includes("products-category_edit")) {
    res.send("Cannot access");
    return;
  }

  try {
    const status = req.params.status;
    const id = req.params.id;

    await ProductCategory.updateOne({
      _id: id
    }, {
      status: status
    });

    req.flash('success', `Cập nhật trạng thái danh mục thành công!`);
  } catch (error) {
    req.flash("error", "Cập nhật trạng thái danh mục không thành công");
  }

  res.redirect(`back`);
}

// [GET] /admin/products-category/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const find = {
      _id: req.params.id,
      deleted: false,
    };

    const data = await ProductCategory.findOne(find);

    const records = await ProductCategory.find({
      deleted: false,
    });

    const newRecords = createTreeHelper(records);

    res.render("admin/pages/products-category/edit", {
      pageTitle: "Chỉnh sửa danh mục sản phẩm",
      data: data,
      records: newRecords,
    });
  } catch (error) {
    res.redirect(`/${systemConfig.prefixAdmin}/products-category`);
  }
};

// [PATCH] /admin/products-category/edit/:id
module.exports.editPatch = async (req, res) => {
  if (!res.locals.role.permissions.includes("products-category_edit")) {
    res.send("Cannot access");
    return;
  }

  const id = req.params.id;
  req.body.position = parseInt(req.body.position);
  req.body.updatedBy = res.locals.user.id;

  try {
    await ProductCategory.updateOne({ _id: id }, req.body);
    req.flash("success", `Cập nhật danh mục thành công!`);
  } catch (error) {
    req.flash("error", `Cập nhật danh mục không thành công!`);
  }
  res.redirect("back");
};

// [GET] /admin/products-category/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;

    const category = await ProductCategory.findOne({
      _id: id,
      deleted: false,
    });

    let parentName = "";

    if (category.parent_id != "") {
      const parentCategory = await ProductCategory.findOne({
        _id: category.parent_id,
        deleted: false,
      });
      parentName = parentCategory.title;
    }

    res.render("admin/pages/products-category/detail", {
      pageTitle: `Danh mục: ${category.title}`,
      category: category,
      parentName: parentName,
    });
  } catch (error) {
    res.redirect(`/${systemConfig.prefixAdmin}/products-category`);
  }
};