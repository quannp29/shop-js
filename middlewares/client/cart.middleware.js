const Cart = require("../../models/cart.model");

module.exports.cart = async (req, res, next) => {
  if(req.cookies.cartId) {
    const cart = await Cart.findOne({
      _id: req.cookies.cartId
    });

    res.locals.miniCart = cart;
  }
  next();
}