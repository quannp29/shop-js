const express = require("express");
const multer = require("multer");
const router = express.Router();

const controller = require("../../controllers/admin/article.controller");
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");
const upload = multer();
const validate = require("../../validates/admin/article.validate");

router.get("/", controller.index);

router.get("/create", controller.create);

router.post(
  "/create",
  upload.single("thumbnail"),
  uploadCloud.uploadSingle,
  validate.createPost,
  controller.createPost
);

router.get("/edit/:id", controller.edit);

router.patch(
  "/edit/:id",
  upload.single("thumbnail"),
  uploadCloud.uploadSingle,
  validate.createPost,
  controller.editPatch
);

router.patch("/change-status/:status/:id", controller.changeStatus);

router.patch("/change-multi", controller.changeMulti);

router.get("/detail/:id", controller.detail);

router.delete("/delete/:id", controller.deleteItem);

module.exports = router;
