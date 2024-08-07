const Joi = require('joi');

const mongoose = require("mongoose");
const Profile = require('../../models/Profile');
const Users = require("../../models/user");
//create profile
async function createProfileController(req,res){
   try{
 // Define Joi schema
 const schema = Joi.object({
    mobileNumber: Joi.string().required(),
    fullName: Joi.string().required(),
    email: Joi.string().email().required(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    birthday: Joi.date().optional(),
    alternateNumber: Joi.string().optional()
  });

  // Validate the request body against the schema
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send({
      success: false,
      message: error.details[0].message
    });
  }

  const { mobileNumber, fullName, email, gender, birthday, alternateNumber } = req.body;

  // Check if the mobile number is unique
  const numberExist = await Profile.findOne({ mobileNumber });
  if (numberExist) {
    return res.status(401).send({
      success: false,
      message: "Number is already available"
    });
  }

  // Save the data to the database
  const data = await Profile({
    mobileNumber,
    fullName,
    email,
    gender,
    birthday,
    alternateNumber
  }).save();

  // Successful response
  return res.status(200).send({
    success: true,
    message: "User registered successfully",
    data
  });
} catch (error) {
  return res.status(403).send({
    success: false,
    message: "Error in Create Profile",
    error
  });
}
}




//updateProfile

async function  updateProfileController(req,res){
 try{
     //geting data from body
     const {mobileNumber,fullName,email,gender,birthday,alternateNumber}=req.body
       // req id from params
    const  id = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({message:"Invalid address Id"})
    }
     //updating our data 
     const updateData = await Profile.findByIdAndUpdate(id,
        {mobileNumber,fullName,email,gender,birthday,alternateNumber},
        {new:true}) 

        if(!updateData){
          return res.status(404).send({
              success:"false",
              message:"data is not is not available"
          })
      }
     //return response
     return res.status(200).send({
        success:true,
        message:"data updated successfully",
        updateData
     })



 }catch(error){
        return res.status(403).send({
        success:false,
        message:"Error in  update Profile",
        error
    })


 }
}

//delete profile controller
async function  deleteProfileController(req,res){
    try{
    // req id from params
    const  id = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({message:"Invalid address Id"})
    }

        const deleteProfile=await Profile.findByIdAndDelete(id)

        if(!deleteProfile){
          return res.status(404).send({
              success:"false",
              message:"data  is not available"
          })
      }
         //return response
        return res.status(200).send({
        success:true,
        message:"data deleted successfully",
     })
    }catch(error){
            return res.status(403).send({
            success:false,
            message:"Error in  update Profile",
            error
            })
    }
}
//get all data
async function getAllProfileController(req,res){
    try{
        const allProfile =await Profile.find({})
        //return response
        return res.status(200).send({
            success:true,
            message:"here is your data",
            allProfile
        }) 

    }catch(error){
            return res.status(403).send({
            success:false,
            message:"Error in getting the all  Profile",
            error
            })

    }
}

const getUserProfile = async (req,res)=>{
  try{
    const userId = req.userId;
    const userData = await Users.findById(userId);
    return res.status(200).json({
       status:true,
       message:"Get user details successfully",userData
    })

  }catch(error){
    return res.status(500).json({
      success: false,
      message: error.message.toString(),
  });
  }
}

//get single profile data
async function  getSingleProfileController(req,res){
try{
       // req id from params
      const  id = req.params.id;
      
      if(!mongoose.Types.ObjectId.isValid(id)){
          return res.status(400).json({message:"Invalid Profile Id"})
      }

    const myProfile =await Profile.findById(id)

    if(!myProfile){
      return res.status(404).send({
          success:"false",
          message:"data is not available"
      })
  }

    //return resposne
        return res.status(200).send({
        success:true,
        message:"Here is your  data",
        myProfile
    })

}catch(error){
        return res.status(403).send({
        success:false,
        message:"Error in getting the single  Profile",
        error
        })
}
}



module.exports = {
   createProfileController,
   updateProfileController,
   deleteProfileController,
   getAllProfileController,
   getSingleProfileController,
   getUserProfile

}