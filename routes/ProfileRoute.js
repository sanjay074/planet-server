const express = require("express");
const userRouter =express.Router();

const { createProfileController, updateProfileController, deleteProfileController, getAllProfileController, getSingleProfileController ,getUserProfile } = require("../controllers/Auth/profileController");
const {phoneLogin} =require("../controllers/Auth/PhoneLogin.js")
const {verifyOTP} =require("../controllers/Auth/verifyLogin.js")
const { authMiddleware } = require("../middleware/authMiddle")
    userRouter
     .post("/create",createProfileController)
     .put("/update/:id",updateProfileController)
     .delete("/delete/:id",deleteProfileController)
     .get("/get-single/:id",getSingleProfileController)
     .get("/get-all",getAllProfileController)
     .post("/phone-login",phoneLogin)
     .post("/phone-verify",verifyOTP)
     .get("/userDetails",authMiddleware,getUserProfile)


module.exports = userRouter