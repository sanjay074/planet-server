const express =require("express")
const { addToCart, getcart, deleteFromCart,updateItemQuantity, deleteCartController } = require("../controllers/cartController")
const { authMiddleware } = require("../middleware/authMiddle")
const cartRoute = express.Router()

cartRoute.post("/add",authMiddleware,addToCart)
cartRoute.get("/get",authMiddleware,getcart)
cartRoute.post("/delete",authMiddleware,deleteFromCart)
cartRoute.put("/updateItemQuantity",authMiddleware,updateItemQuantity)
cartRoute.delete("/deleteCart/:id",authMiddleware,deleteCartController)

module.exports=cartRoute