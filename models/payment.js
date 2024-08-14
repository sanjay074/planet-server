const  mongoose  = require("mongoose");
const  paymentSchema =  mongoose.Schema({
  paymentType:{
    type:String,
    required:true
  },
  orCode:{
    type:String,
    required:true,
  },
  upiNumber:{
    type:String,
    required:true
  },
},{timestamps:true})
module.exports = mongoose.model("Payment",paymentSchema) 
