const {mongoose} =require("mongoose")
const userSchema = new mongoose.Schema({
    mobileNumber:{
        type:Number
    },
    fullName:{
        type:String
    },
    email:{
        type:String,
        unique:true
    },
    gender:{
        type:String,
        enum: ['male', 'female'],

    },
    birthday:{
        type:Date
    },
    alternateNumber:{
        type:Number
    }
},{timestamps:true})

const user = mongoose.model('users',userSchema)
module.exports =user
