const jwt = require("jsonwebtoken");

module.exports.requireAuth = async (req, res, next) => {
  if(!req.cookies.tokenUser) {
    res.redirect("/user/login");
    return;
  }

  try {
    const decoded = jwt.verify(req.cookies.tokenUser, process.env.JWT_KEY);
    const userId = decoded.id;

    req.body.userId = userId;

    next();
  } catch (error) {
    res.clearCookie("tokenUser");
    res.redirect(`/user/login`);
    return;
  }
}