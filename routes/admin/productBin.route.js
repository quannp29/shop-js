const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/productBin.controller");

router.get("/", controller.index);

router.patch("/restore/:id", controller.restoreItem);

router.patch("/restoreMulti", controller.restoreMulti);

module.exports = router;