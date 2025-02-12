const md5 = require("md5");
const Account = require("../../models/account.model");
const jwt = require("jsonwebtoken");

const systemConfig = require("../../config/system");

// [GET] /admin/auth/login
module.exports.login = async (req, res) => {
  res.render("admin/pages/auth/login", {
    pageTitle: "Đăng nhập",
  });
}

// [POST] /admin/auth/login
module.exports.loginPost = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await Account.findOne({
    email: email,
    deleted: false  
  });

  if(!user) {
    req.flash("error","Email hoặc mật khẩu không đúng!");
    res.redirect("back");
    return;
  }
  
  if(md5(password) != user.password) {
    req.flash("error", "Email hoặc mật khẩu không đúng!");
    res.redirect("back");
    return;
  }
  
  if(user.status != "active") {
    req.flash("error", "Tài khoản đã bị khóa!");
    res.redirect("back");
    return;
  }

  const token = jwt.sign({id: user.id}, process.env.JWT_KEY, {
    expiresIn: "1d"
  });

  res.cookie("token", token);

  res.redirect(`/${systemConfig.prefixAdmin}/dashboard`);
};

// [GET] /admin/auth/logout
module.exports.logout = async (req, res) => {
  res.clearCookie("token");
  res.redirect(`/${systemConfig.prefixAdmin}/auth/login`);
}