const express =require("express")
const { createOrder, getAllOrder, getmyOrder, updateOrder, newOrder, getRecentOrder } = require("../controllers/orderController")
const { authMiddleware,isAdminMd} = require("../middleware/authMiddle")

const orderRoute = express.Router()
//create order 
orderRoute.post("/createOrder",authMiddleware,createOrder)
//admin can see the all orders
orderRoute.get("/getAllorder",authMiddleware,isAdminMd,getAllOrder)
//user all order 
orderRoute.get("/getMyOrder",authMiddleware,getmyOrder)

orderRoute.put("/updateOrder/:id",authMiddleware,isAdminMd,updateOrder)

//all recent order 
orderRoute.get("/getNewOrder",authMiddleware,isAdminMd,newOrder)
//get recent order 
orderRoute.get("/getRecentOrder",authMiddleware,isAdminMd,getRecentOrder)





module.exports = orderRoute