const Joi = require("joi");
const Address = require("../models/userAddress");

const mongoose = require("mongoose");

const createAddress = async (req, res) => {
  try {
    // Define Joi schema
    const schema = Joi.object({
      name: Joi.string().trim().required().messages({
        "string.empty": "Name is required",
        "any.required": "Name is required"
      }),
      mobile: Joi.string().trim().pattern(/^\d{10}$/).message('Mobile number must be a 10-digit number').required(),
      email: Joi.string().email().trim().lowercase().required().messages({
        "string.email": "Valid email is required",
        "any.required": "Email is required"
      }),
      Pincode: Joi.string().trim().required().messages({
        "string.empty": "Pincode is required",
        "any.required": "Pincode is required"
      }),
      Landmark: Joi.string().trim().required().messages({
        "string.empty": "Landmark is required",
        "any.required": "Landmark is required"
      }),
      district: Joi.string().trim().required().messages({
        "string.empty": "District is required",
        "any.required": "District is required"
      }),
      state: Joi.string().trim().required().messages({
        "string.empty": "State is required",
        "any.required": "State is required"
      }),
      addressAs: Joi.string().trim().valid('home', 'office').required().messages({
        "any.only": "Address type must be 'home' or 'office'",
        "any.required": "Address type is required"
      })
    });

    // Validate the request body against the schema
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).send({
        success: false,
        message: error.details[0].message
      });
    }

    // Destructure validated values from the request body
    const { name, mobile, email, Pincode, Landmark, district, state, addressAs } = req.body;

    // Save the data to the database
    const userAddress = new Address({
      name,
      mobile,
      email,
      Pincode,
      Landmark,
      district,
      state,
      addressAs
    });
    const savedAddress = await userAddress.save();

    // Successful response
    return res.status(201).send({
      success: true,
      message: "Address created successfully",
      data: savedAddress
    });
  } catch (error) {
    // Error handling
    return res.status(500).send({
      success: false,
      message: "Error creating address",
      error: error.message
    });
  }
};

//update the address 
const updateAddress = async (req, res) => {
  try {
    // Destructure validated values from the request body
    const { name, mobile, email, Pincode, Landmark, district, state, addressAs } = req.body;

    // req id from params
    const  id = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({message:"Invalid address Id"})
    }
   

    // Update the address in the database
    const updatedAddress = await Address.findByIdAndUpdate(
      id,
      { name, mobile, email, Pincode, Landmark, district, state, addressAs },
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(404).send({
        success: false,
        message: "Address not found"
      });
    }

    // Success response
    return res.status(200).send({
      success: true,
      message: "Address updated successfully",
      data: updatedAddress
    });
  } catch (error) {
    // Error handling
    return res.status(500).send({
      success: false,
      message: "Error updating address",
      error: error.message
    });
  }
};

const getAddress =async(req,res)=>{
    try{
    // req id from params
    const id = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({message:"Invalid address Id"})
    }
        const myAddress =await Address.findById(id)
        if(!myAddress){
            return res.status(404).send({
                success:"false",
                message:"id is not available"
            })
        }
        //return resposne
            return res.status(200).send({
            success:true,
            message:"Here is your  data",
            myAddress
        })

    }catch(error){
       // Error handling
        return res.status(500).send({
        success: false,
        message: "Error updating address",
        error: error.message
      });
    }
}

const deleteAddress =async (req,res)=>{
try{
    
      // req id from params
      const  id = req.params.id;
      if(!mongoose.Types.ObjectId.isValid(id)){
          return res.status(400).json({message:"Invalid address Id"})
      }
    const myAddress =await Address.findByIdAndDelete(id)
    if(!myAddress){
        return res.status(404).send({
            success:"false",
            message:"id is not available"
        })
    }
    //return resposne
        return res.status(200).send({
        success:true,
        message:" your address deleted successfully ",
    
    })



}catch(error){
        // Error handling
         return res.status(500).send({
        success: false,
        message: "Error deleting address",
        error: error.message
      });

}

}
module.exports = {
  createAddress,
  updateAddress,
  getAddress,
  deleteAddress
};
