const jwt = require("jsonwebtoken");
const systemConfig = require("../../config/system");
const Account = require("../../models/account.model");
const Role = require("../../models/role.model");

module.exports.requireAuth = async (req, res, next) => {
  const token = req.cookies.token;

  if(!token) {
    res.redirect(`/${systemConfig.prefixAdmin}/auth/login`);
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const userId = decoded.id;

    const user = await Account.findOne({
      _id: userId,
      deleted: false,
      status: "active"
    });

    if(!user) {
      res.clearCookie("token");
      res.redirect(`/${systemConfig.prefixAdmin}/auth/login`);
      return;
    }

    const role = await Role.findOne({
      _id: user.role_id,
      deleted: false
    });

    res.locals.user = user;
    res.locals.role = role;
    
    next();
  } catch (error) {
    res.clearCookie("token");
    res.redirect(`/${systemConfig.prefixAdmin}/auth/login`);
    return;
  }

}