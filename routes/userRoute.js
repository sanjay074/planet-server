const express = require("express");
const { createProfileController, updateProfileController, deleteProfileController, getAllProfileController, getSingleProfileController } = require("../controllers/Auth/userController");

const userRouter =express.Router()
    userRouter
     .post("/create",createProfileController)
     .put("/update/:id",updateProfileController)
     .delete("/delete/:id",deleteProfileController)
     .get("/get-single/:id",getSingleProfileController)
     .get("/get-all",getAllProfileController)


module.exports = userRouter