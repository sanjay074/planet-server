const express = require("express");
const userDetailsRoute =express.Router();

const { authMiddleware, isAdminMd } = require("../middleware/authMiddle");
const { getAllUserController,registrationUser,UserLogin ,refreshAccessToken,Logout} = require("../controllers/Auth/userPhoneController");

userDetailsRoute
     .get("/alluserDetails",authMiddleware,isAdminMd,getAllUserController)
userDetailsRoute.post("/signup",registrationUser);     
userDetailsRoute.post("/login",UserLogin);
userDetailsRoute.post("/refresh-token",refreshAccessToken);
userDetailsRoute.post("/logout",authMiddleware,Logout);
module.exports =userDetailsRoute