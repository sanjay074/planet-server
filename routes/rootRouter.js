const express = require("express");
const categoryRouter = require("./categoryRoute");
const subCategoryRouter = require("./subCategoryRoute");
const brandRouter = require("./brandRoute");
const productRouter = require("./productRoute");
const adminRouter =require("./adminRoute");
const userRouter = require("./ProfileRoute");
const contactRoute = require("./contactRoute");
const addressRoute = require("./addressRoute");
const cartRoute =require("./cartRoute");
const orderRoute =require("./orderRoute");
const returnOrder = require("../models/returnOrder");
const returnRoute = require("./returnRoute");
const whislistRoute = require("./whislistRoute");
const  ratingAndReviewRoute  = require("./ratingAndReviewRoute");
const  searchRoute  = require("./searchRoute");
const userDetailsRoute = require("./userDetailsRoute");
const paymentRoute = require("../routes/paymentRoute");
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
router.use("/order",orderRoute)
router.use("/return",returnRoute)
router.use("/whislist",whislistRoute)
router.use("/ratingReview",ratingAndReviewRoute)
router.use("/searchRoute",searchRoute)
router.use("/userDetails",userDetailsRoute)
router.use("/payment",paymentRoute);

module.exports = router;
