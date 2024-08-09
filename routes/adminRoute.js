const express = require("express");
const adminRouter  = express.Router();

const { isAdminMd, authMiddleware } = require("../middleware/authMiddle");

const { singupController, signinController, getAllController } = require("../controllers/Auth/adminController");

adminRouter
   .post("/signup",singupController)
   .post("/signin",signinController)
   .get("/get-all",authMiddleware,isAdminMd,getAllController)
   
   

module.exports  = adminRouter