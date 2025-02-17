const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    password: String,
    phone: String,
    avatar: String,
    role_id: String,
    status: String,
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    createdBy: String,
    updatedBy: String,
    deletedBy: String
  },
  {
    timestamps: true,
  }
);

const Account = mongoose.model("Account", accountSchema, "accounts");

module.exports = Account;