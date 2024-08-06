const express =require("express")
const { addToCart, getcart, deleteFromCart,updateItemQuantity } = require("../controllers/cartController")
const { authMiddleware } = require("../middleware/authMiddle")
const cartRoute =express.Router()

cartRoute.post("/add",authMiddleware,addToCart)
cartRoute.get("/get/:id",authMiddleware,getcart)
cartRoute.delete("/delete",authMiddleware,deleteFromCart)
cartRoute.put("/updateItemQuantity",authMiddleware,updateItemQuantity);






module.exports=cartRoute