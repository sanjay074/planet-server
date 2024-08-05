const express =require("express")

const { createRating, getAllRating, deleteReview, overAllReview } = require("../controllers/ratingAndReviewController")
const { authMiddleware } = require("../middleware/authMiddle")

const ratingAndReviewRoute = express.Router()

ratingAndReviewRoute.post("/createRating",authMiddleware,createRating)
ratingAndReviewRoute.get("/getallReview",getAllRating)
ratingAndReviewRoute.delete("/deleteReview/:id",authMiddleware,deleteReview)
ratingAndReviewRoute.get("/overallReview/:productId",overAllReview)



module.exports ={ratingAndReviewRoute}