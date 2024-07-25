const user = require("../../models/user")

async function createProfileController(req,res){
try{
    //geting data from body
    const {mobileNumber,fullName,email,gender,birthday,alternateNumber}=req.body
    //validation
    if(!mobileNumber||!fullName ||!email){
             return res.status(400).send({
            success:false,
            message:"Please fill all  the fields"
        })
    }
    //check the mobile number is unique or not 
    const numberExist = await user.findOne({mobileNumber})
    if(numberExist){
        return res.status(401).send({
            success:false,
            message:"Number is already available"
        })
    }
    //send data to the databse 
    const data =await user({mobileNumber,fullName,email,gender,birthday,alternateNumber}).save()
    
    //succes resposne
    return res.status(200).send({
        success:true,
        message:"user register successfully",
        data
    })
}
catch(error){
        return res.status(403).send({
        success:false,
        message:"Error in  Create Profile",
        error
    })
}
}

module.exports = {
    createProfileController
}