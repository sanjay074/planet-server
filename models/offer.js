const  mongoose  = require("mongoose");

const offerSchema = new  mongoose.Schema({
name:{
    type:String,
    required:[true,"offer name is required"]
},

offerImage:{
   type:String,
//    required:[true,"offer image is required"]
},
offerPrice:{
    type:Number
},
validUpto:{
   type:Date
}

},{timestamps:true})

const offer = mongoose.model("offer",offerSchema)
module.exports = offer ;

