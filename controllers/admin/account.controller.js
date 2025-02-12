const md5 = require("md5");

const Account = require("../../models/account.model");
const Role = require("../../models/role.model");

const systemConfig = require("../../config/system");

// [GET] /admin/accounts/
module.exports.index = async (req, res) => {
  // Find
  let find = {
    deleted: false,
  };
  // End Find

  const records = await Account.find(find);

  for(const record of records) {
    const role = await Role.findOne({
      _id: record.role_id,
      deleted: false
    });
    
    const createdBy = await Account.findOne({
      _id: record.createdBy
    });
    const updatedBy = await Account.findOne({
      _id: record.updatedBy
    });
    record.createdByFullName = createdBy?.fullName;
    record.updatedByFullName = updatedBy?.fullName;

    record.roleTitle = role.title;
  }

  res.render("admin/pages/accounts/index", {
    pageTitle: "Danh sách tài khoản",
    records: records,
  });
};

// [GET] /admin/accounts/create
module.exports.create = async (req, res) => {
  const roles = await Role.find({
    deleted: false,
  });

  res.render("admin/pages/accounts/create", {
    pageTitle: "Thêm mới tài khoản",
    roles: roles
  });
};

// [POST] /admin/accounts/create
module.exports.createPost = async (req, res) => {
  if(!res.locals.role.permissions.includes("accounts_create")) {
    res.send("Cannot access");
    return;
  }

  try {
    req.body.password = md5(req.body.password);
    req.body.createdBy = res.locals.user.id;
  
    const account = new Account(req.body);
    await account.save();
    
    req.flash("success", "Tạo tài khoản thành công");
  } catch (error) {
    req.flash("error", "Tạo tài khoản không thành công");
  }
  res.redirect(`/${systemConfig.prefixAdmin}/accounts`);
};

// [GET] /admin/accounts/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const find = {
      _id: req.params.id,
      deleted: false,
    };

    const account = await Account.findOne(find);

    const roles = await Role.find({
      deleted: false
    });

    res.render("admin/pages/accounts/edit", {
      pageTitle: "Chỉnh sửa tài khoản",
      account: account,
      roles: roles,
    })
  } catch (error) {
    res.redirect(`/${systemConfig.prefixAdmin}/accounts`);
  }
}

// [PATCH] /admin/accounts/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  if(!res.locals.role.permissions.includes("accounts_edit")) {
    res.send("Cannot access");
    return;
  }

  try {
    const status = req.params.status;
    const id = req.params.id;

    await Account.updateOne({
      _id: id
    }, {
      status: status
    });

    req.flash('success', `Cập nhật trạng thái tài khoản thành công!`);
  } catch (error) {
    req.flash("error", "Cập nhật trạng thái tài khoản không thành công");
  }

  res.redirect(`back`);
}

// [PATCH] /admin/accounts/edit/:id
module.exports.editPatch = async (req, res) => {
  if(!res.locals.role.permissions.includes("accounts_edit")) {
    res.send("Cannot access");
    return;
  }
  
  try {
    if(req.body.password) {
      req.body.password = md5(req.body.password);
    }
    else {
      delete req.body.password;
    }

    req.body.updatedBy = res.locals.user.id;

    await Account.updateOne({
      _id: req.params.id,
      deleted: false
    }, req.body);

    req.flash("success", "Cập nhật tài khoản thành công!");
    res.redirect("back");
  } catch (error) {
    req.flash("error", "Cập nhật tài khoản không thành công!");
    res.redirect(`/${systemConfig.prefixAdmin}/accounts`);
  }
}

// [GET] /admin/accounts/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const find = {
      _id: req.params.id,
      deleted: false
    };

    const account = await Account.findOne(find);

    const data = await Role.findOne({
      _id: account.role_id,
      deleted: false
    });

    res.render("admin/pages/accounts/detail", {
      pageTitle: "Chi tiết tài khoản",
      account: account,
      data: data
    });
  } catch (error) {
    res.redirect(`/${systemConfig.prefixAdmin}/accounts`);
  }
}

// [DELETE] /admin/accounts/delete/:id
module.exports.deleteItem = async (req, res) => {
  if(!res.locals.role.permissions.includes("accounts_delete")) {
    res.send("Cannot access");
    return;
  }

  try {
    const id = req.params.id;
  
    await Account.updateOne({
      _id: id
    }, {
      deleted: true,
      deletedAt: new Date(),
      deletedBy: res.locals.user.id
    });
  
    req.flash('success', 'Xóa tài khoản thành công!');
  } catch (error) {
    req.flash('error', 'Xóa tài khoản không thành công!');    
  }
  res.redirect("back");
}