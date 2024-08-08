const express = require("express");
const userRouter =express.Router();

const { createProfileController,
     updateProfileController, 
     deleteProfileController,
      getAllProfileController, 
      getSingleProfileController,
      getUserProfile 
    } = require("../controllers/Auth/profileController");

const {phoneLogin} =require("../controllers/Auth/PhoneLogin.js")
const {verifyOTP} =require("../controllers/Auth/verifyLogin.js")
const { authMiddleware, isAdminMd } = require("../middleware/authMiddle");

    userRouter
     .post("/create",authMiddleware,createProfileController)
     .put("/update/:id",authMiddleware,updateProfileController)
     .delete("/delete/:id",authMiddleware,deleteProfileController)
     .get("/get-single/:id",authMiddleware,getSingleProfileController)
     .get("/get-all",authMiddleware,isAdminMd,getAllProfileController)
     .post("/phone-login",phoneLogin)
     .post("/phone-verify",verifyOTP)
     .get("/userDetails",authMiddleware,getUserProfile)
     

module.exports = userRouter