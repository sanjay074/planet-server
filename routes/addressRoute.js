const express =require("express")
const addressRoute =express.Router()
const { createAddress, updateAddress, getAddress, deleteAddress } = require("../controllers/addressController")
const {authMiddleware}  =require("../middleware/authMiddle")

addressRoute.post("/",authMiddleware,createAddress)
addressRoute.put("/:id",authMiddleware,updateAddress)
addressRoute.get("/:id",authMiddleware,getAddress)
addressRoute.delete("/:id",authMiddleware,deleteAddress)





module.exports =addressRoute