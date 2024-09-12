const express = require("express");
const userDetailsRoute =express.Router();

const { authMiddleware, isAdminMd } = require("../middleware/authMiddle");
const { getAllUserController,registrationUser,UserLogin } = require("../controllers/Auth/userPhoneController");

userDetailsRoute
     .get("/alluserDetails",authMiddleware,isAdminMd,getAllUserController)
userDetailsRoute.post("/signup",registrationUser);     
userDetailsRoute.post("/login",UserLogin);
module.exports =userDetailsRoute