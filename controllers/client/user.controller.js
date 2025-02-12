const md5 = require("md5");
const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");
const Cart = require("../../models/cart.model");

const generateHelper = require("../../helpers/generate.helper");
const ForgotPassword = require("../../models/forgot-password.model");
const sendEmailHelper = require("../../helpers/sendEmail.helper");

// [GET] /user/register
module.exports.register = async (req, res) => {
  res.render("client/pages/user/register", {
    pageTitle: "Đăng ký tài khoản",
  });
}

// [POST] /user/register
module.exports.registerPost = async (req, res) => {
  const existUser = await User.findOne({
    email: req.body.email,
    deleted: false
  });

  if(existUser) {
    req.flash("error", "Email đã tồn tại!");
    res.redirect("back");
    return;
  }

  const userInfo = {
    fullName: req.body.fullName,
    email: req.body.email,
    password: md5(req.body.password)
  };

  const user = new User(userInfo);
  await user.save();

  const tokenUser = jwt.sign({id: user.id}, process.env.JWT_KEY, {
    expiresIn: "1d"
  });

  res.cookie("tokenUser", tokenUser);

  res.redirect("/");
}

// [GET] /user/login
module.exports.login = async (req, res) => {
  res.render("client/pages/user/login", {
    pageTitle: "Đăng nhập tài khoản",
  });
};

// [POST] /user/login
module.exports.loginPost = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({
    email: email,
    deleted: false
  });

  if(!user) {
    req.flash("error", "Email hoặc mật khẩu không đúng!");
    res.redirect("back");
    return;
  }

  if(md5(password) != user.password) {
    req.flash("error", "Email hoặc mật khẩu không đúng!");
    res.redirect("back");
    return;
  }

  if(user.status != "active") {
    req.flash("error", "Tài khoản đang bị khóa!");
    res.redirect("back");
    return;
  }

  const cart = await Cart.findOne({
    user_id: user.id
  });

  if(cart) {
    await Cart.updateOne({
      _id: cart.id
    }, {
      expireAt: Date.now() + 30 * 24 * 60 * 60 * 1000
    });
    res.cookie("cartId", cart.id, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  }
  else {
    const newCart = new Cart({
      user_id: user.id,
      expireAt: Date.now() + 30 * 24 * 60 * 60 * 1000
    });
    await newCart.save();
    res.cookie("cartId", newCart.id, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  }

  const tokenUser = jwt.sign({id: user.id}, process.env.JWT_KEY, {
    expiresIn: "1d"
  });

  res.cookie("tokenUser", tokenUser);

  res.redirect("/");
}

// [GET] /user/logout
module.exports.logout = async (req, res) => {
  res.clearCookie("tokenUser");
  res.clearCookie("cartId");
  res.redirect("/");
};

// [GET] /user/password/forgot
module.exports.forgotPassword = async (req, res) => {
  res.render("client/pages/user/forgot-password", {
    pageTitle: "Lấy lại mật khẩu",
  });
};

// [POST] /user/password/fotgot
module.exports.forgotPasswordPost = async (req, res) => {
  const email = req.body.email;

  const user = await User.findOne({
    email: email,
    deleted: false
  });

  if(!user) {
    req.flash("error", "Email không tồn tại!");
    res.redirect("back");
    return;
  }

  const otp = generateHelper.generateRandomNumber(6);

  const objectForgotPassword = {
    email: email,
    otp: otp,
    expireAt: Date.now() + 3 * 60 * 1000
  };

  const forgotPassword = new ForgotPassword(objectForgotPassword);
  await forgotPassword.save();

  const subject = "Lấy lại mật khẩu.";
  const text = `Mã OTP xác thực tài khoản của bạn là: ${otp}. Mã OTP có hiệu lực trong vòng 3 phút. Vui lòng không cung cấp mã OTP này với bất kỳ ai.`;
  sendEmailHelper.sendEmail(email, subject, text);

  res.redirect(`/user/password/otp?email=${email}`);
}

// [GET] /user/password/otp
module.exports.otpPassword = async (req, res) => {
  const email = req.query.email;

  res.render("client/pages/user/otp-password", {
    pageTitle: "Nhập mã OTP",
    email: email
  });
};

// [POST] /user/password/otp
module.exports.otpPasswordPost = async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;

  const result = await ForgotPassword.findOne({
    email: email,
    otp: otp
  });

  if(!result) {
    req.flash("error", "Mã OTP không hợp lệ!");
    res.redirect("back");
    return;
  }

  const user = await User.findOne({
    email: email
  });

  const tokenUser = jwt.sign({id: user.id}, process.env.JWT_KEY, {
    expiresIn: "1d"
  });

  res.cookie("tokenUser", tokenUser);

  res.redirect("/user/password/reset");
}

// [GET] /user/password/reset
module.exports.resetPassword = async (req, res) => {
  res.render("client/pages/user/reset-password", {
    pageTitle: "Đổi mật khẩu"
  });
}

// [POST] /user/password/reset
module.exports.resetPasswordPost = async (req, res) => {
  const tokenUser = req.cookies.tokenUser;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  if(password != confirmPassword) {
    req.flash("error", "Xác nhận mật khẩu không khớp!");
    res.redirect("back");
    return;
  }

  try {
    const decoded = jwt.verify(tokenUser, process.env.JWT_KEY);
    const userId = decoded.id;

    await User.updateOne({
      _id: userId
    }, {
      password: md5(password)
    });

    req.flash("success", "Đổi mật khẩu thành công!");
    res.redirect("/");
  } catch (error) {
    res.clearCookie("tokenUser");
    res.redirect("/");
    return;
  }
}

// [GET] /user/info
module.exports.info = async (req, res) => {
  const user = await User.findOne({
    _id: req.body.userId,
    deleted: false
  }).select("-password");

  res.render("client/pages/user/info", {
    pageTitle: "Thông tin tài khoản",
    infoUser: user
  });
};