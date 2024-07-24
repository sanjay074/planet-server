const express = require("express");
const categoryRouter = require("./categoryRoute");
const subCategoryRouter = require("./subCategoryRoute");
const brandRouter = require("./brandRoute");
const productRouter = require("./productRoute");
const router = express.Router();

router.use("/categories", categoryRouter);
router.use("/subCategories", subCategoryRouter);
router.use("/brands", brandRouter);
router.use("/products", productRouter);

module.exports = router;
