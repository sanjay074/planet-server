const  mongoose  = require("mongoose");
const  vendorPayOutSchema =  mongoose.Schema({
   userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"users",
    required:true
},
  beneficiaryName:{
    type:String,
    required:true
  },
  accountNum:{
    type:String,
    required:true,
  },
  accountIFSC:{
    type:String,
    required:true
  },
  bankName:{
    type:String,
    required:true,
  },
  payoutsRef:{
    type:String,
    required:true
  },
  remarks:{
    type:String,
    required:true,
  },
  amount:{
    type:Number,
    required:true
  },
  narration:{
    type:String
  },
},{timestamps:true})
module.exports = mongoose.model("VendorPayOut",vendorPayOutSchema) 
