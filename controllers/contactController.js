const Joi = require('joi');
const Contact = require('../models/contactUs'); // Adjust the path according to your project structure

async function contactForm (req, res)  {
  try {
    // Define Joi schema
    const schema = Joi.object({
      name: Joi.string().trim().required(),
      mobile: Joi.string().trim().pattern(/^\d{10}$/).message('Mobile number must be a 10-digit number').required(),
      email: Joi.string().email().trim().lowercase().required(),
      message: Joi.string().max(250).message('Message should not exceed 250 characters').required()
    });

    // Validate the request body against the schema
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).send({
        success: false,
        message: error.details[0].message
      });
    }

    const { name, mobile, email, message } = req.body;

    // Save the data to the database
    const newContact = new Contact({
      name,
      mobile,
      email,
      message
    });
    const savedContact = await newContact.save();

    // Successful response
      return res.status(201).send({
      success: true,
      message: "Contact created successfully",
      data: savedContact
    });
  } catch (error) {
      return res.status(500).send({
      success: false,
      message: "Error creating contact",
      error: error.message
    });
  }
};
const getAllData = async(req,res)=>{
  try{
    const allData =await Contact.find({})
    
    return res.status(200).send({
      success:true,
      message:"your all data",
      allData

    })
  }catch(error){
      return res.status(500).send({
      success: false,
      message: "Error in getting data",
      error: error.message
    });

  }
}


module.exports = {contactForm,getAllData};
