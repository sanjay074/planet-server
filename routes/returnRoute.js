const express =require("express")
const {createReturn, approveReturn} = require("../controllers/returnOrderController")
const { authMiddleware, isAdminMd } = require("../middleware/authMiddle")
const returnRoute =express.Router()

returnRoute.post("/createReturn",createReturn);
returnRoute.post("/approveReturn",authMiddleware,isAdminMd,approveReturn);

module.exports =returnRoute