const express = require("express");
const multer = require("multer");
const router = express.Router();

const upload = multer();

const controller = require("../../controllers/client/user.controller");

const authMiddleware = require("../../middlewares/client/auth.middleware");

const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");

const validate = require("../../validates/client/user.validate");

router.get("/register", controller.register);

router.post("/register", controller.registerPost);

router.get("/login", controller.login);

router.post("/login", controller.loginPost);

router.get("/logout", controller.logout);

router.get("/password/forgot", controller.forgotPassword);

router.post("/password/forgot", controller.forgotPasswordPost);

router.get("/password/otp", controller.otpPassword);

router.post("/password/otp", controller.otpPasswordPost);

router.get("/password/reset", controller.resetPassword);

router.post("/password/reset", controller.resetPasswordPost);

router.get("/info", authMiddleware.requireAuth, controller.info);

router.patch(
  "/edit",
  upload.single("avatar"),
  uploadCloud.uploadSingle,
  authMiddleware.requireAuth,
  validate.editPatch,
  controller.editPatch
);

router.get("/change-pass", authMiddleware.requireAuth, controller.changePassword);

router.patch("/change-pass", authMiddleware.requireAuth, controller.changePasswordPatch);

module.exports = router;
