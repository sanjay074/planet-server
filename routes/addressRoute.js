const express =require("express")
const addressRoute =express.Router()
const { createAddress, updateAddress, getAddress, deleteAddress } = require("../controllers/addressController")


addressRoute.post("/",createAddress)
addressRoute.put("/:id",updateAddress)
addressRoute.get("/:id",getAddress)
addressRoute.delete("/:id",deleteAddress)





module.exports =addressRoute