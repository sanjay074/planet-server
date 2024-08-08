const express = require("express");
const userDetailsRoute =express.Router();

const { authMiddleware, isAdminMd } = require("../middleware/authMiddle");
const { getAllUserController } = require("../controllers/Auth/userPhoneController");

userDetailsRoute
     .get("/alluserDetails",authMiddleware,isAdminMd,getAllUserController)

module.exports =userDetailsRoute