const express = require("express");

const { requireSignIn, isAdminMd } = require("../middleware/authMiddle");

const { singupController, signinController, getAllController } = require("../controllers/Auth/adminController");
const { verifyOTP } = require("../controllers/Auth/verifyLogin");
const {phoneLogin} =require("../controllers/Auth/PhoneLogin")

const adminRouter  = express.Router();

adminRouter
   .post("/signup",singupController)
   .post("/signin",signinController)
   .get("/get-all",requireSignIn,isAdminMd,getAllController)
   
   //otp method
   .post("/phone-login",phoneLogin)
   .post("/phone-verify",verifyOTP)


module.exports =adminRouter