const { required } = require("joi");
const mongoose =require("mongoose");
const paymentHistorySchema =new mongoose.Schema({
    orderId: {
       type:String,
       required:true
    },
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
        type: String, 
        enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
        default: 'Completed' 
    }
},{timestamps:true})

module.exports = mongoose.model("paymentHistory",paymentHistorySchema)
 