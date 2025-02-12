const User = require("../../models/user.model");
const jwt = require("jsonwebtoken");

module.exports.infoUser = async (req, res, next) => {
  if(req.cookies.tokenUser) {
    try {
      const decoded = jwt.verify(req.cookies.tokenUser, process.env.JWT_KEY);
      const userId = decoded.id;

      const user = await User.findOne({
        _id: userId,
        deleted: false,
        status: "active"
      });

      if(user) {
        res.locals.user = user;
      }
      
    } catch (error) {
      res.clearCookie("tokenUser");
      res.redirect("/");
      return;
    }
  }

  next();
}