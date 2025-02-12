const ArticleCategory = require("../../models/article-category.model");
const systemConfig = require("../../config/system");
const Account = require("../../models/account.model");
const filterHelper = require("../../helpers/filter.helper");
const paginationHelper = require("../../helpers/pagination.helper");

// [GET] /admin/article-category
module.exports.index = async (req, res) => {
  const find = {
    deleted: false
  }

  // Filter
  const filterStatus = filterHelper(req);

  if(req.query.status) {
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
  const countRecords = await ArticleCategory.countDocuments(find);
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

  const records = await ArticleCategory.find(find).sort(sort);

  for (const record of records) {
    const createdBy = await Account.findOne({
      _id: record.createdBy
    });
    const updatedBy = await Account.findOne({
      _id: record.updatedBy
    });
    record.createdByFullName = createdBy?.fullName;
    record.updatedByFullName = updatedBy?.fullName;
  }

  res.render("admin/pages/article-category/index", {
    pageTitle: "Danh mục bài viết",
    records: records,
    filterStatus: filterStatus,
    keyword: req.query.keyword,
    objectPagination: objectPagination
  });
}

// [GET] /admin/article-category/create
module.exports.create = (req, res) => {
  res.render("admin/pages/article-category/create", {
    pageTitle: "Tạo mới danh mục bài viết"
  });
}

// [POST] /admin/article-category/create
module.exports.createPost = async (req, res) => {
  if(!res.locals.permissions.includes("article-category_create")) {
    res.send("Cannot access");
    return;
  }

  try {
    if(req.body.position) {
      req.body.position = parseInt(req.body.position);
    }
    else {
      const count = await ArticleCategory.countDocuments();
      req.body.position = count + 1;
    }

    req.body.createdBy = res.locals.user.id;

    const record = new ArticleCategory(req.body);
    await record.save();

    req.flash("success", "Thêm mới danh mục bài viết thành công");
  } catch (error) {
    req.flash("error", "Thêm mới danh mục bài viết không thành công");
  }

  res.redirect(`/${systemConfig.prefixAdmin}/article-category`);
}

// [GET] /admin/article-category/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    
    const record = await ArticleCategory.findOne({
      _id: id,
      deleted: false
    });
    
    res.render("admin/pages/article-category/edit", {
      pageTitle: "Chỉnh sửa danh mục bài viết",
      record: record
    });
  } catch (error) {
    res.redirect(`/${systemConfig.prefixAdmin}/article-category`);
  }
}

// [PATCH] /admin/article-category/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  if(!res.locals.permissions.includes("article-category_edit")) {
    res.send("Cannot access");
    return;
  }

  try {
    const status = req.params.status;
    const id = req.params.id;

    await ArticleCategory.updateOne({
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

// [PATCH] /admin/article-category/edit/:id
module.exports.editPatch = async (req, res) => {
  if(!res.locals.permissions.includes("article-category_edit")) {
    res.send("Cannot access");
    return;
  }

  try {
    const id = req.params.id;
    req.body.position = parseInt(req.body.position);
    req.body.updatedBy = res.locals.user.id;

    await ArticleCategory.updateOne({
      _id: id
    }, req.body);

    req.flash("success", `Cập nhật danh mục thành công!`);
  } catch (error) {
    req.flash("error", `Cập nhật danh mục không thành công!`);
  }

  res.redirect("back");
}

// [GET] /admin/article-category/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;

    const record = await ArticleCategory.findOne({
      _id: id,
      deleted: false
    });

    res.render("admin/pages/article-category/detail", {
      pageTitle: "Chi tiết danh mục",
      record: record
    })
  } catch (error) {
    res.redirect(`/${systemConfig.prefixAdmin}/article-category`);
  }
}