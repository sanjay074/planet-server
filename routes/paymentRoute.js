const express =require("express")
const paymentRoute =express.Router()
const {authMiddleware}  =require("../middleware/authMiddle")


module.exports =paymentRoute ;