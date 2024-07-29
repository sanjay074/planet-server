const express =require("express")
const { addToCart, getcart, deleteFromCart } = require("../controllers/cartController")
const { authMiddleware } = require("../middleware/authMiddle")
const cartRoute =express.Router()

cartRoute.post("/add",authMiddleware,addToCart)
cartRoute.get("/get/:id",authMiddleware,getcart)
cartRoute.delete("/delete",authMiddleware,deleteFromCart)






module.exports=cartRoute