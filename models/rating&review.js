const mongoose = require("mongoose");

const RatingReviewSchema=new mongoose.Schema({
   userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'users',
    required:true
 },
   productId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Product'
 },
    rating:{
        type:Number,
        min:1,
        max:5
},
  review:{
        type:String
 }




},{timestamps:true})
module.exports =mongoose.model("Rating&Review",RatingReviewSchema)
