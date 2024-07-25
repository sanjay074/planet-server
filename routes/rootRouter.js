const express = require("express");
const categoryRouter = require("./categoryRoute");
const subCategoryRouter = require("./subCategoryRoute");
const brandRouter = require("./brandRoute");
const productRouter = require("./productRoute");
const adminRouter =require("./adminRoute");
const userRouter = require("./userRoute");

const router = express.Router();

router.use("/categories", categoryRouter);
router.use("/subCategories", subCategoryRouter);
router.use("/brands", brandRouter);
router.use("/products", productRouter);
router.use("/admin",adminRouter);
router.use("/user",userRouter)

module.exports = router;
