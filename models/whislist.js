const  mongoose  = require("mongoose")
const whislistSchema =mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
        required:true
    },
    whislistItems:[{
        productId:{
           type:mongoose.Schema.Types.ObjectId,
            ref:'Product',
            required:true,
        }
    }],
  
},{timeStamps:true})
module.exports  = mongoose.model('Whislist',whislistSchema)