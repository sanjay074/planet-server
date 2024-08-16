const Payment = require("../models/payment");
const {paymentSchema} = require("../validations/validation");
const cloudinary = require("cloudinary").v2;
const paymentType = async (req,res)=>{
    try{
        const { error } = paymentSchema.validate(req.body);
        if (error) {
          return res.status(400).send({
            success: false,
            message: error.details[0].message
          });
        }
        if (!req.file) {
          return res.status(400).json({
              status: 0,
              message: "Missing required parameter - file"
          });
      }
      const result = await cloudinary.uploader.upload_stream({
          resource_type: 'image'
      }, async (error, result) => {
          if (error) {
              return res.status(500).json({
                  status: 0,
                  message: error.message.toString(),
              });
          }
         
          const paymentData = new Payment({
            orCode: result.secure_url,
              paymentType: req.body.paymentType,upiNumber:req.body.upiNumber
          });
          await paymentData.save();
          return res.status(201).json({
              success: true,
              message: "Payment image uploaded successfully"
          });
      }).end(req.file.buffer);
    }catch(error){
        return res.status(500).json({
            success: false,
            message: error.message.toString(),
        });
    }
}

const getAllPaymentType = async (req,res)=>{
  try{
    const getAllPayment = await Payment.find().sort({createdAt:-1});
    return res.status(200).json({
      status:true,
      message:"Get all payment type successfully",getAllPayment
    })
  }catch(error){
      return res.status(500).json({
          success: false,
          message: error.message.toString(),
      });
  }
}




module.exports = {
  paymentType,getAllPaymentType
}