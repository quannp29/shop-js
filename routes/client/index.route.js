const homeRoutes = require("./home.route");
const productRoutes = require("./product.route");
const searchRoutes = require("./search.route");
const cartRoutes = require("./cart.route");
const checkoutRoutes = require("./checkout.route");
const userRoutes = require("./user.route");
const purchaseRoutes = require("./purchase.route");

const categoryMiddleware = require("../../middlewares/client/category.middleware");
const cartMiddleware = require("../../middlewares/client/cart.middleware");
const userMiddleware = require("../../middlewares/client/user.middleware");
const authMiddleware = require("../../middlewares/client/auth.middleware");
const settingMiddleware = require("../../middlewares/client/setting.middleware");

module.exports = (app) => {
  app.use(categoryMiddleware.category);

  app.use(cartMiddleware.cart);

  app.use(userMiddleware.infoUser);

  app.use(settingMiddleware.settingGeneral);

  app.use("/", homeRoutes);
  
  app.use("/products", productRoutes);
  
  app.use("/search", searchRoutes);

  app.use("/cart", authMiddleware.requireAuth, cartRoutes);

  app.use("/checkout", authMiddleware.requireAuth, checkoutRoutes);

  app.use("/purchase", authMiddleware.requireAuth, purchaseRoutes)

  app.use("/user", userRoutes);
}