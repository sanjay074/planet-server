const { default: mongoose } = require("mongoose")
const Order = require("../models/Order")
const ratingReview = require("../models/rating&review")

const createRating =async(req,res)=>{
    try{
        //req from body
        const userId = req.userId
        const {productId,rating,review}=req.body
        // validate review and rating 
        if(rating <1 ||rating > 5){
            return res.status(400).send({
                success:false,
                message:"this rating is not valid "
            })
        }
        //order check is it available
        const order =await Order.findOne({userId,
                'orderItems.productId':productId
        })
        if(!order){
                return res.status(400).send({
                success:false,
                message:"this order is not available"
            })
        }
        //check the user already review or not 
        const existReview  = await ratingReview.findOne({userId,productId})
        if(existReview){
                return res.status(400).send({
                success:false,
                message:"you have already review the product"
            })
        } 
        const NewRatingReview =await ratingReview({
            userId,productId,rating,review
        })
         await NewRatingReview.save()  
        
         return res.status(200).send({
            success:true,
            message:"your rating and Review is completed succesfully", 
         })
         }catch(error){
            return res.status(400).send({
            success:false,
            message:"fail to create rate and review"
        })
    }
}
//get all review 
const getAllRating = async(req,res) => {
    try{
        //all data getting 
        const alldata =await ratingReview.find({})
                                         .populate("")
                                         .exec()
        //return response
        return res.status(200).send({
            success:true,
            message:"here is your all data",
            totalReview:alldata.length,
            alldata
        })

    }catch(error){
            return res.status(400).send({
            success:false,
            message:"error in getting the all review"
        })
    }
} 
const deleteReview = async(req,res)=>{
    try{
        const userId =req.userId
        const _id =req.params.id
        if(!mongoose.Types.ObjectId.isValid(_id)){
            return res.status(400).send({
                success:true,
                message:"id is not valid"
            })
        }
        //find by their id and delete  
        const deleteReview =await ratingReview.findByIdAndDelete(_id)

        if(!deleteReview){
            return res.status(400).send({
                success:false,
                message:"your review will alreaday deleted"
            })
        }
       //return  reposne 
       return res.status(200).send({
               success:true,
               message:"your review will deleted successfully",
       })

       }catch(error){
            return res.status(400).send({
            success:true,
            message:"error in deleting the review"
        })
    }
}
//over all review and rate 
  
const overAllReview = async (req, res) => {
  try {
    // Correctly extract productId from params
    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).send({
        success: false,
        message: "This ID is not valid"
      });
    }

    // Fetch all ratings for the specific product
    const ratings = await ratingReview.find({ productId });

    // If no ratings are available
    if (ratings.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No ratings are available for this product"
      });
    }

    // Calculate the total and average rating
    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const avgRating = totalRating / ratings.length;

    // Return response with the average rating
    return res.status(200).send({
      success: true,
      message: "Your overall review is",
      avgRating: avgRating.toFixed(2)  
    });
  } catch (error) {
    return res.status(500).json({  
      success: false,
      message: "Error in getting the overall data",
      error: error.message  // Optional: include error message for debugging
    });
  }
}



module.exports ={createRating,getAllRating,deleteReview,overAllReview}