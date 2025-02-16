const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/order.controller");

router.get("/", controller.index);

router.get("/detail/:id", controller.detail);

router.get("/change-status/:id", controller.changeStatus);

router.patch("/change-status/:id", controller.changeStatusPatch);

module.exports = router;