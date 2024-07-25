const express = require("express");
const { createProfileController } = require("../controllers/Auth/userController");

const userRouter =express.Router()
    userRouter
     .post("/create",createProfileController)


module.exports = userRouter