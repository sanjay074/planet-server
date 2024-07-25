const {mongoose} =require("mongoose")
const otp = new mongoose.Schema({
    number:{
        type:Number,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    createdAt:{
		type: Date,
		default: Date.now,
		expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
	}
    


},{timestamps:true})
const otpModel = mongoose.model('otp',otp)
module.exports =otpModel
