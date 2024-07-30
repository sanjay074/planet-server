const  mongoose  = require("mongoose");
const orderSchema =  mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true
    },
    orderItems:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product",
            required:true
            
        },
        quantity:{
            type:Number,
            required:true
        }
    }],
    address:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Address",
        required:true
    },
    totalPrice:{
        type:Number,
        required:true
    },
    orderDate:{
        type:Date,
        default:Date.now()
    },
    status:{
        type:String,
        enum:[ "Processed","shipped","inRoute",
               "Arrival","delivered","Returned",
               "cancelled","outofStock"],
        default:"Processed"
    }
},{timestamps:true})

module.exports = mongoose.model("Order",orderSchema) 
