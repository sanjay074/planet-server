const mongoose =require("mongoose");
const paymentHistorySchema =new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
        required:true
    },
    utrNumber:{
        type:Number,
        required:true
    },
    transactionId:{
        type:String,
        required:true
    },
    amount:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:["PROCESSED","PENDING","COMPLETED","FAILED","CANCELLED"],
        default:"PROCESSED"
    }
},{timestamps:true})

module.exports = mongoose.model("paymentHistory",paymentHistorySchema)
 