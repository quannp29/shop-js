const Role = require("../../models/role.model");
const systemConfig = require("../../config/system");
const Account = require("../../models/account.model");

// [GET] /admin/roles/
module.exports.index = async (req, res) => {
  // Find
  let find = {
    deleted: false,
  };
  // End Find

  const records = await Role.find(find);

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
  
  res.render("admin/pages/roles/index", {
    pageTitle: "Nhóm quyền",
    records: records,
  });
};

// [GET] /admin/roles/create
module.exports.create = async (req, res) => {
  res.render("admin/pages/roles/create", {
    pageTitle: "Tạo mới nhóm quyền",
  });
};

// [POST] /admin/roles/create
module.exports.createPost = async (req, res) => {
  if(!res.locals.role.permissions.includes("roles_create")) {
    res.send("Cannot access");
    return;
  }

  req.body.createdBy = res.locals.user.id;

  try {
    const record = new Role(req.body);
  
    await record.save();
  
    req.flash("success", "Thêm mới nhóm quyền thành công");    
  } catch (error) {
    req.flash("error", "Thêm mới nhóm quyền không thành công");
  }

  res.redirect(`/${systemConfig.prefixAdmin}/roles`);
};

// [GET] /admin/roles/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const data = await Role.findOne({
      _id: req.params.id,
      deleted: false,
    });

    res.render("admin/pages/roles/edit", {
      pageTitle: "Chỉnh sửa nhóm quyền",
      data: data,
    });
  } catch (error) {
    res.redirect(`/${systemConfig.prefixAdmin}/roles`);
  }
};

// [PATCH] /admin/roles/edit/:id
module.exports.editPatch = async (req, res) => {
  if(!res.locals.role.permissions.includes("roles_edit")) {
    res.send("Cannot access");
    return;
  }

  try {
    const id = req.params.id;
    req.body.updatedBy = res.locals.user.id;

    await Role.updateOne({ _id: id }, req.body);

    req.flash("success", `Cập nhật nhóm quyền thành công!`);
  } catch (error) {
    req.flash("error", `Cập nhật nhóm quyền không thành công!`);
  }

  res.redirect("back");
};

// [GET] /admin/roles/permissions
module.exports.permissions = async (req, res) => {
  // Find
  let find = {
    deleted: false,
  };
  // End Find
  const records = await Role.find(find);

  res.render("admin/pages/roles/permissions", {
    pageTitle: "Phân quyền",
    records: records,
  });
};

// [PATCH] /admin/roles/permissions
module.exports.permissionsPatch = async (req, res) => {
  if(!res.locals.role.permissions.includes("roles_permissions")) {
    res.send("Cannot access");
    return;
  }

  try {
    const roles = JSON.parse(req.body.roles);
    for (const role of roles) {
      await Role.updateOne({
        _id: role.id,
        deleted: false
      }, {
        permissions: role.permissions
      });
    }
    req.flash("success", "Cập nhật phân quyền thành công!");
  } catch (error) {
    req.flash("error", "Cập nhật phân quyền không thành công!");        
  }
  res.redirect("back");
}

// [GET] /admin/roles/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const data = await Role.findOne({
      _id: req.params.id,
      deleted: false,
    });

    res.render("admin/pages/roles/detail", {
      pageTitle: "Chi tiết nhóm quyền",
      data: data,
    });
  } catch (error) {
    res.redirect(`/${systemConfig.prefixAdmin}/roles`);
  }
}

// [DELETE] /admin/roles/delete/:id
module.exports.deleteItem = async (req, res) => {
  if(!res.locals.role.permissions.includes("roles_delete")) {
    res.send("Cannot access");
    return;
  }

  try {
    const id = req.params.id;
  
    await Role.updateOne({
      _id: id
    }, {
      deleted: true,
      deletedAt: new Date(),
      deletedBy: res.locals.user.id
    });
  
    req.flash('success', 'Xóa nhóm quyền thành công!');
  } catch (error) {
    req.flash('error', 'Xóa nhóm quyền không thành công!');    
  }
  res.redirect("back");  
}