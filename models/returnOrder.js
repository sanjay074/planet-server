
const mongoose  =require("mongoose")

const returnSchema =mongoose.Schema({
    orderId:{ 
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order",
        required:true
    },
    reason:{
        type:String,
        enum:[
            'received wrong item', 
            'quality of product not matched', 
            'product is missing',
            'don’t like the size'
            
        ],
        required:true
    },
    message:{
        type:String
    },
    status:{
       type:String,
       enum:["pending","Approved"],
       default:'pending'
    },
    createdAt:{ 
        type:Date,
        default:Date.now()        
    }

})
module.exports =mongoose.model("returnOrder",returnSchema)