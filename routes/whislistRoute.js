const express =require("express")
const { addTowhislist, getWhishList, deleteWhislist, deleteSingleItemWhislist } = require("../controllers/whislistController")
const { authMiddleware } = require("../middleware/authMiddle")
const whislistRoute =express.Router()

//create route 
whislistRoute.post("/createWhislist",authMiddleware,addTowhislist)
whislistRoute.get("/getallWhislist",authMiddleware,getWhishList)
whislistRoute.delete("/deleteWhislist/:id",authMiddleware,deleteWhislist)
whislistRoute.post("/deleteSingleItem",authMiddleware,deleteSingleItemWhislist)

module.exports = whislistRoute
