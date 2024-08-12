
const Contact = require('../models/contactUs');
const {sendEmail} = require("../services/commonFunction");
const { Contactschema } = require('../validations/validation');
async function contactForm (req, res)  {
  try {   
    const { error } = Contactschema.validate(req.body);
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
    const emailData = {
      from: 'noreply@node-react.com',
      to: 'planet.clothingsales@gmail.com', 
      subject: 'Contact Form Submission - Planet Clothing',
      text: `Name: ${name}\nPhone: ${mobile}\nEmail: ${email}\nMessage: ${message}`,
      html: `
          <h2>Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${mobile}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          
      `
  };
  
  sendEmail(emailData);
  const savedContact = await newContact.save();
      return res.status(201).send({
      success: true,
      message: "Contact created successfully"
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
