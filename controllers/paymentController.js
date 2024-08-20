const Payment = require("../models/payment");
const {paymentSchema} = require("../validations/validation");
const cloudinary = require("cloudinary").v2;
const { v4: uuidv4 } = require('uuid');
const mongoose = require("mongoose");
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const QRCode = require('qrcode');

const generateTransactionId = () => {
  const prefix = 'T';
  const timestamp = Date.now().toString();
  const uniquePart = Math.floor(100000 + Math.random() * 900000).toString(); 
  return prefix + timestamp.slice(-6) + uniquePart; 
};

const generateUpiQrcode = async (req, res) => {
  const { upiId, name, amount } = req.body;
  if (!upiId || !name || !amount) {
      return res.status(400).json({status:0 ,message: 'UPI ID, Name, and Amount are required' });
  }

  
  const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${encodeURIComponent(amount)}&tr=${encodeURIComponent(Date.now().toString())}&cu=INR`;
  const transactionId = generateTransactionId();
  try {
      const qrCodeData = await QRCode.toDataURL(upiString);
      res.status(200).json({status:1 ,message:"Get payment payment methods" ,qrCode: qrCodeData, upiLink: upiString ,transactionId});
  } catch (err) {
      res.status(500).json({ error: 'Failed to generate QR code' });
  }
};





const generateQrcode = async (req,res)=>{
  const { upiId, name, amount } = req.body;
    if (!upiId || !name || !amount) {
        return res.status(400).json({ error: 'UPI ID, Name, and Amount are required' });
    }
    const upiString = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}`;
    try {
        const qrCodeData = await QRCode.toDataURL(upiString);
        res.status(200).json({ qrCode: qrCodeData });
    } catch (err) {
        console.error('Error generating QR code:', err);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
  }

const paymentType = async (req,res)=>{
    try{
        const { error } = paymentSchema.validate(req.body);
        if (error) {
          return res.status(400).send({
            success: 0,
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
              success: 1,
              message: "Payment image uploaded successfully"
          });
      }).end(req.file.buffer);
    }catch(error){
        return res.status(500).json({
            success: 0,
            message: error.message.toString(),
        });
    }
}

const getAllPaymentType = async (req,res)=>{
  try{
    const getAllPayment = await Payment.find().sort({createdAt:-1});
    return res.status(200).json({
      status:1,
      message:"Get all payment type successfully",getAllPayment
    })
  }catch(error){
      return res.status(500).json({
          success: 0,
          message: error.message.toString(),
      });
  }
}

const deletePaymentType = async (req,res)=>{
  try{
   const Id = req.params.id;
   if (!isValidObjectId(Id)) {
    res
      .status(400)
      .json({ success: false, message: "Id is Invalid" });
  }
  const paymentType = await Payment.findById(Id);
  if (!paymentType) {
    res.status(400).json({status:1 ,message: "Payment type not found" });
  }
   const imageUrl = paymentType.orCode;
   const publicId = imageUrl.split('/').pop().split('.')[0];
   cloudinary.uploader.destroy(publicId, async (error, result) => {
       if (error) {
           return res.status(500).json({
               status: 0,
               message: error.message.toString(),
           });
       }
       await Payment.findByIdAndDelete(Id);
       return res.status(200).json({
           status: 1,
           message: "PaymentType deleted successfully"
       });
   });
  }catch(error){
   return res.status(500).json({
     success:0,
     message:error.message.toString(),
   })
  }
}


  const getPaymentType = async (req,res)=>{
    try{
      const Id = req.params.id;
      if (!isValidObjectId(Id)) {
      res
      .status(400)
      .json({ success: false, message: "Id is Invalid" });
       }
      const paymentMethod = await Payment.findById(Id);
      if(!paymentMethod){
        return res.status(400).json({
           status:0,
           message:"Payment type not found"
        })
      }
      return res.status(200).json({
        status:1,
        message:"Get payment method successfully",paymentMethod
      })
    }catch(error){
      return res.status(500).json({
        success:0,
        message:error.message.toString(),
      })
    }
    
  }


module.exports = {
  paymentType,getAllPaymentType,deletePaymentType,getPaymentType,generateUpiQrcode
}