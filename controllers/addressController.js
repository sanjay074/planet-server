const Address = require("../models/userAddress");
const mongoose = require("mongoose");
const { Addresschema } = require("../validations/validation");

const createAddress = async (req, res) => {
  try {
    // Validate the request body against the schema
    const { error } = Addresschema.validate(req.body);
    if (error) {
      return res.status(400).send({
        success: false,
        message: error.details[0].message
      });
    }

    // Destructure validated values from the request body
    const { name, mobile, email, Pincode, Landmark, district, state, addressAs, fullAddress } = req.body;

    // Save the data to the database
    const userAddress = new Address({name,mobile,email,Pincode,Landmark,district,state,addressAs,fullAddress });
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
    const { name, mobile, email, Pincode, Landmark, district, state, addressAs,fullAddress} = req.body;

    // req id from params
    const  id = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({message:"Invalid address Id"})
    }
   

    // Update the address in the database
    const updatedAddress = await Address.findByIdAndUpdate(
      id,
      { name, mobile, email, Pincode, Landmark, district, state, addressAs,fullAddress},
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
    //Error handling
    return res.status(500).send({
      success: false,
      message: "Error updating address",
      error: error.message
    });
  }
};

const getAddress =async(req,res)=>{
    try{
    //req id from params
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
