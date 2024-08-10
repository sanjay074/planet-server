const express =require("express")
const { addTowhislist, getWhishList, deleteWhislist } = require("../controllers/whislistController")
const { authMiddleware } = require("../middleware/authMiddle")
const whislistRoute =express.Router()

//create route 
whislistRoute.post("/createWhislist",authMiddleware,addTowhislist)
whislistRoute.get("/getallWhislist/:id",getWhishList)
whislistRoute.post("/deleteWhislist",authMiddleware,deleteWhislist)

module.exports = whislistRoute
