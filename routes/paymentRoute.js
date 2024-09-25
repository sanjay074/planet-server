const express =require("express")
const {paymentType,getAllPaymentType,deletePaymentType,getPaymentType,getAllVendorPayOuts,vendorPayOut,generateUpiQrcode, paymentHistory,validateQrcode}=require("../controllers/paymentController");
const {authMiddleware,isAdminMd}  =require("../middleware/authMiddle")
const {upload} = require("../middleware/singleFileUpload")
const paymentRoute =express.Router()
paymentRoute.post("/add",authMiddleware,isAdminMd,upload, paymentType);
paymentRoute.get("/getAllPaymentType",authMiddleware,isAdminMd,getAllPaymentType);
paymentRoute.delete("/remove/:id",authMiddleware,isAdminMd,deletePaymentType);
paymentRoute.get("/get/:id",authMiddleware,isAdminMd,getPaymentType);
paymentRoute.post("/generateUpiQrcode",generateUpiQrcode);
paymentRoute.post("/utrVerify",authMiddleware,paymentHistory);
paymentRoute.post("/validateQr",validateQrcode);
paymentRoute.post("/vendorPayOut",authMiddleware,vendorPayOut);
paymentRoute.get("/getVendorPayOuts",authMiddleware,isAdminMd,getAllVendorPayOuts)
module.exports =paymentRoute ;