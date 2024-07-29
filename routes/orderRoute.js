const express =require("express")
const { createOrder, getAllOrder, getmyOrder } = require("../controllers/orderController")
const { authMiddleware,isAdminMd} = require("../middleware/authMiddle")

const orderRoute = express.Router()
//create order 
orderRoute.post("/createOrder",authMiddleware,createOrder)
//admin can see the all orders
orderRoute.get("/getAllorder",authMiddleware,isAdminMd,getAllOrder)
//user all order 
orderRoute.get("/getMyOrder",authMiddleware,getmyOrder)





module.exports = orderRoute 