const express  =require("express")
const { searchController, latestProductController } = require("../controllers/searchController")
const searchRoute = express.Router()

searchRoute.post("/createSearch",searchController)
searchRoute.get("/getLatestItems",latestProductController)



module.exports ={searchRoute}

