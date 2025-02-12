const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user_id: String,
    products: [
      {
        product_id: String,
        quantity: Number,
      },
    ],
    expireAt: {
      type: Date,
      expires: 0
    }
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model("Cart", cartSchema, "carts");

module.exports = Cart;