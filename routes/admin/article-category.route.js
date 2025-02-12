const express = require("express");
const router = express.Router();
const multer = require("multer");

const controller = require("../../controllers/admin/article-category.controller");
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");
const upload = multer();

const validate = require("../../validates/admin/article-category.validate");

router.get("/", controller.index);

router.get("/create", controller.create);

router.post(
  "/create",
  upload.single("thumbnail"),
  uploadCloud.uploadSingle,
  validate.createPost,
  controller.createPost
)

router.get("/edit/:id", controller.edit);

router.patch(
  "/edit/:id",
  upload.single("thumbnail"),
  uploadCloud.uploadSingle,
  validate.createPost,
  controller.editPatch
);

router.patch("/change-status/:status/:id", controller.changeStatus);

router.get("/detail/:id", controller.detail);

module.exports = router;