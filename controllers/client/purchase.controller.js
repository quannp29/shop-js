const Order = require("../../models/order.model");
const Product = require("../../models/product.model");

// [GET] /purchase
module.exports.index = async (req, res) => {
  const userId = req.body.userId;
  
  const orders = await Order.find({
    user_id: userId,
  });
  
  for (const order of orders) {
    let total = 0;

    for (const item of order.products) {
      const priceNew = (item.price * (100 - item.discountPercentage) / 100).toFixed(0);
      const totalPrice = priceNew * item.quantity;
      total += totalPrice;
    }

    order.total = total;
  };

  res.render("client/pages/purchase/index", {
    pageTitle: "Đơn hàng",
    orders: orders
  })
}

// [GET] /purchase/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;

    const order = await Order.findOne({
      _id: id
    });

    order.totalPrice = 0;

    for (const product of order.products) {
      const productInfo = await Product.findOne({
        _id: product.product_id
      });

      product.title = productInfo.title;
      product.thumbnail = productInfo.thumbnail;
      product.priceNew = (product.price * (100 - product.discountPercentage)/100).toFixed(0);
      product.totalPrice = product.priceNew * product.quantity;

      order.totalPrice += product.totalPrice;
    }

    res.render("client/pages/purchase/detail", {
      pageTitle: "Chi tiết đơn hàng",
      order: order
    })
  } catch (error) {
    res.redirect("/");
  }
}