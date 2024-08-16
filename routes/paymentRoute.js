const express =require("express")
const {paymentType,getAllPaymentType}=require("../controllers/paymentController");
const {authMiddleware,isAdminMd}  =require("../middleware/authMiddle")
const {upload} = require("../middleware/singleFileUpload")
const paymentRoute =express.Router()
paymentRoute.post("/add",authMiddleware,isAdminMd,upload, paymentType);
paymentRoute.get("/getAllPaymentType",authMiddleware,isAdminMd,getAllPaymentType);
module.exports =paymentRoute ;