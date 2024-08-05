const express = require("express");
const adminRouter  = express.Router();

const { requireSignIn, isAdminMd } = require("../middleware/authMiddle");

const { singupController, signinController, getAllController } = require("../controllers/Auth/adminController");

adminRouter
   .post("/signup",singupController)
   .post("/signin",signinController)
   .get("/get-all",requireSignIn,isAdminMd,getAllController)
   
   

module.exports  = adminRouter