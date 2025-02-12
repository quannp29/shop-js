const Account = require("../../models/account.model");
const Article = require("../../models/article.model");
const ArticleCategory = require("../../models/article-category.model");
const systemConfig = require("../../config/system");
const filterHelper = require("../../helpers/filter.helper");
const paginationHelper = require("../../helpers/pagination.helper");

// [GET] /admin/articles
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
  const countRecords = await Article.countDocuments(find);
  const objectPagination = paginationHelper(req, countRecords);
  // End Pagination

  // Sort
  const sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    const sortKey = req.query.sortKey;
    const sortValue = req.query.sortValue;
    sort[sortKey] = sortValue;
  } else {
    sort.position = "desc";
  }
  // End Sort

  const records = await Article.find(find)
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

  res.render("admin/pages/article/index", {
    pageTitle: "Danh sách bài viết",
    records: records,
    filterStatus: filterStatus,
    keyword: req.query.keyword,
    objectPagination: objectPagination,
  });
};

// [GET] /admin/articles/create
module.exports.create = async (req, res) => {
  const articleCategory = await ArticleCategory.find({
    deleted: false,
  });

  res.render("admin/pages/article/create", {
    pageTitle: "Thêm mới bài viết",
    category: articleCategory,
  });
};

// [POST] /admin/articles/create
module.exports.createPost = async (req, res) => {
  try {
    if (req.body.position) {
      req.body.position = parseInt(req.body.position);
    } else {
      const countArticle = await Article.countDocuments();
      req.body.position = countArticle + 1;
    }

    req.body.createdBy = res.locals.user.id;

    const record = new Article(req.body);
    await record.save();

    req.flash("success", "Thêm mới bài viết thành công!");
  } catch (error) {
    req.flash("error", "Thêm mới bài viết không thành công!");
  }

  res.redirect(`/${systemConfig.prefixAdmin}/articles`);
};

// [GET] /admin/articles/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;

    const record = await Article.findOne({
      _id: id,
      deleted: false,
    });

    const categories = await ArticleCategory.find({
      deleted: false,
    });

    res.render("admin/pages/article/edit", {
      pageTitle: "Chỉnh sửa bài viết",
      record: record,
      categories: categories,
    });
  } catch (error) {
    res.redirect(`/${systemConfig.prefixAdmin}/articles`);
  }
};

// [PATCH] /admin/articles/edit/:id
module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;

    req.body.position = parseInt(req.body.position);
    req.body.updatedBy = res.locals.user.id;

    await Article.updateOne(
      {
        _id: id,
        deleted: false,
      },
      req.body
    );

    req.flash("success", "Cập nhật bài viết thành công!");
  } catch (error) {
    req.flash("error", "Cập nhật bài viết không thành công!");
  }

  res.redirect("back");
};

// [PATCH] /admin/articles/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  if(!res.locals.role.permissions.includes("article_edit")){
    res.send("Cannot access");
    return;
  }

  try {
    const status = req.params.status;
    const id = req.params.id;

    await Article.updateOne({
      _id: id
    }, {
      status: status
    });

    req.flash('success', `Cập nhật trạng thái bài viết thành công!`);
  } catch (error) {
    req.flash("error", "Cập nhật trạng thái bài viết không thành công");
  }

  res.redirect("back");
}

// [PATCH] /admin/articles/change-multi
module.exports.changeMulti = async (req, res) => {
  if(!res.locals.role.permissions.includes("article_edit")){
    res.send("Cannot access");
    return;
  }

  try {
    const type = req.body.type;
    let ids = req.body.ids;
    ids = ids.split(", ");

    switch (type) {
      case "active":
      case "inactive":
        await Article.updateMany({
          _id: { $in: ids }
        }, {
          status: type
        });
        req.flash('success', 'Cập nhật trạng thái thành công!');
        break;
      case "delete-all":
        await Article.updateMany({
          _id: { $in: ids }
        }, {
          deleted: true,
          deletedAt: new Date(),
          deletedBy: res.locals.user.id
        });
        req.flash('success', 'Xóa bài viết thành công!');
        break;
      case "change-position":
        for (const item of ids) {
          let [id, position] = item.split("-");
          position = parseInt(position);
          await Article.updateOne({
            _id: id
          }, {
            position: position
          });
        }
        req.flash('success', 'Thay đổi vị trí bài viết thành công!');
        break;
      default:
        break;
    }
  } catch (error) {
    req.flash('error', 'Đã xảy ra lỗi');
  }

  res.redirect("back");
}

// [GET] /admin/articles/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;

    const record = await Article.findOne({
      _id: id,
      deleted: false,
    });

    const category = await ArticleCategory.findOne({
      _id: record.article_category_id,
      deleted: false,
    });

    res.render("admin/pages/article/detail", {
      pageTitle: "Chi tiết bài viết",
      record: record,
      category: category,
    });
  } catch (error) {
    res.redirect(`/${systemConfig.prefixAdmin}/articles`);
  }
};

// [DELETE] /admin/articles/delete/:id
module.exports.deleteItem = async (req, res) => {
  if(!res.locals.role.permissions.includes("article_delete")){
    res.send("Cannot access");
    return;
  }

  try {
    const id = req.params.id;

    await Article.updateOne({
      _id: id
    }, {
      deleted: true,
      deletedAt: new Date(),
      deletedBy: res.locals.user.id
    });

    req.flash('success', 'Xóa bài viết thành công!');
  } catch (error) {
    req.flash('error', 'Xóa bài viết không thành công!');
  }

  res.redirect("back");
}