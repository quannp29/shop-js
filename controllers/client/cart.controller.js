const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");

// [GET] /cart/
module.exports.index = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      _id: req.cookies.cartId
    });

    cart.totalPrice = 0;

    for (const item of cart.products) {
      const infoProduct = await Product.findOne({
        _id: item.product_id
      }).select("thumbnail title price discountPercentage stock slug");

      infoProduct.priceNew = (infoProduct.price * (100 - infoProduct.discountPercentage) / 100).toFixed(0);

      infoProduct.totalPrice = infoProduct.priceNew * item.quantity;

      cart.totalPrice += infoProduct.totalPrice;

      item.infoProduct = infoProduct;
    }

    res.render("client/pages/cart/index", {
      pageTitle: "Giỏ hàng",
      cartDetail: cart
    });
  } catch (error) {
    res.redirect("/");
  }
}

// [POST] /cart/add/:productId
module.exports.addPost = async (req, res) => {
  const productId = req.params.productId;
  const quantity = parseInt(req.body.quantity);
  const cartId = req.cookies.cartId;

  try {
    const cart = await Cart.findOne({
      _id: cartId
    });

    // Cach 1
    // const existIndex = cart.products.findIndex(item => item.product_id == productId);

    // if(existIndex != -1) {
    //   cart.products[existIndex].quantity += quantity;

    //   await Cart.updateOne({
    //     _id: cartId,
    //   }, {
    //     products: cart.products
    //   })
    // }

    // Cach 2
    const existProductInCart = cart.products.find(item => item.product_id == productId);
    
    if(existProductInCart) {
      const quantityUpdate = existProductInCart.quantity + quantity;

      await Cart.updateOne({
        _id: cartId,
        "products.product_id": productId
      }, {
        $set: { "products.$.quantity": quantityUpdate }
      });
    } else {
      const objectCart = {
        product_id: productId,
        quantity: quantity,
      };

      await Cart.updateOne({
        _id: cartId
      }, {
        $push: { products: objectCart }
      });
    }

    req.flash("success", "Đã thêm sản phẩm vào giỏ hàng.");
  } catch (error) {
    req.flash("error", "Thêm sản phẩm vào giỏ hàng không thành công!");
  }

  res.redirect("back");
}

// [GET] /cart/delete/:productId
module.exports.deleteItem = async (req, res) => {
  try {
    const productId = req.params.productId;
    const cartId = req.cookies.cartId;

    await Cart.updateOne({
      _id: cartId
    }, {
      $pull: { products: { product_id: productId } }
    });

    req.flash("success", "Đã xóa sản phẩm khỏi giỏ hàng!");

    res.redirect("back");
  } catch (error) {
    res.redirect("/");
  }
}

// [GET] /cart/update/:productId/:quantity
module.exports.updateItem = async (req, res) => {
  try {
    const productId = req.params.productId;
    const quantity = parseInt(req.params.quantity);
    const cartId = req.cookies.cartId;

    await Cart.updateOne({
      _id: cartId,
      "products.product_id": productId
    }, {
      $set: { "products.$.quantity": quantity }
    });

    req.flash("success", "Cập nhật sản phẩm thành công!");

    res.redirect("back");
  } catch (error) {
    res.redirect("/");
  }
}