const express = require("express");
const categoryRouter = require("./categoryRoute");
const subCategoryRouter = require("./subCategoryRoute");
const brandRouter = require("./brandRoute");
const productRouter = require("./productRoute");
const adminRouter =require("./adminRoute");
const userRouter = require("./ProfileRoute");
const contactRoute = require("./contactRoute");
const addressRoute = require("./addressRoute");
const cartRoute =require("./cartRoute")

const router = express.Router();

router.use("/categories", categoryRouter);
router.use("/subCategories", subCategoryRouter);
router.use("/brands", brandRouter);
router.use("/products", productRouter);
router.use("/admin",adminRouter);
router.use("/user",userRouter);
router.use("/contact",contactRoute)
router.use("/address",addressRoute)
router.use("/cart",cartRoute)

module.exports = router;
