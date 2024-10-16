const Payment = require("../models/payment");
const VendorPayOut = require("../models/vendorPayOut");
const {paymentSchema,vendorPayOutValidation} = require("../validations/validation");
const cloudinary = require("cloudinary").v2;
const { v4: uuidv4 } = require('uuid');
const mongoose = require("mongoose");
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const QRCode = require('qrcode');
const PaymentHistory = require("../models/paymentHistory");
const Payout = require("../models/payOut");
const Order= require("../models/Order");
const axios = require("axios");
const generateTransactionId = () => {
  const prefix = 'T';
  const timestamp = Date.now().toString();
  const uniquePart = Math.floor(100000 + Math.random() * 900000).toString(); 
  return prefix + timestamp.slice(-6) + uniquePart; 
};

const generateUpiQrcode = async (req, res) => {
  const { amount} = req.body;
  
  if (!amount) {
    return res.status(400).json({ status: 0, message: 'Amount is required' });
  }

  const upiId = process.env.upiId;
  const upiName = process.env.upiName;
  const transactionId = generateTransactionId(); 
  const currentTime = Date.now(); 
  const expirationTime = currentTime + 5 * 60 * 1000;
  const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${encodeURIComponent(amount)}&tr=${encodeURIComponent(transactionId)}&cu=INR`;

  try {
    const qrCodeData = await QRCode.toDataURL(upiString);
    const googlePayLink = `https://pay.google.com/gp/w/u/0/home/activity?link=${encodeURIComponent(upiString)}`;
    const phonePeLink = `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${encodeURIComponent(amount)}&tr=${encodeURIComponent(transactionId)}&cu=INR`;
    const paytmLink = `paytmmp://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${encodeURIComponent(amount)}&tr=${encodeURIComponent(transactionId)}&cu=INR`;

    res.status(200).json({
      status: 1,
      message: "Payment methods generated successfully",
      qrCode: qrCodeData,
      transactionId,
      expiresAt: expirationTime,
      googlePayLink,
      phonePeLink,
      paytmLink,
      upiLink: upiString,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
};


// const generateUpiQrcode = async (req, res) => {
// const {amount } = req.body;
//   if (!amount) {
//       return res.status(400).json({ status: 0, message: 'Amount are required' });
//   }
//   const upiId = process.env.upiId;

//   const upiNmae = process.env.upiNmae
//   const transactionId = generateTransactionId(); 
//   const currentTime = Date.now(); 
//   const expirationTime = currentTime + 5 * 60*1000;
//   const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiNmae)}&am=${encodeURIComponent(amount)}&tr=${encodeURIComponent(transactionId)}&cu=INR`;
//   try {
//       const qrCodeData = await QRCode.toDataURL(upiString);
//       res.status(200).json({
//           status: 1,
//           message: "Get payment methods successfully",
//           qrCode: qrCodeData,
//           upiLink: upiString,
//           transactionId,
//           expiresAt: expirationTime 
//       });
//   } catch (error) {
//       res.status(500).json({ error: 'Failed to generate QR code' });
//   }
// };


const validateQrcode = (req, res) => {
  const { transactionId } = req.body;
  const transaction = transactionId;
  if (!transaction) {
      return res.status(404).json({ status: 0, message: 'Transaction not found' });
  }
  const currentTime = Date.now();
  if (currentTime > transaction.expiresAt) {
      return res.status(400).json({ status: 0, message: 'QR code has expired' });
  }

  res.status(200).json({ status: 1, message: 'QR code is valid', transaction });
};


// const generateUpiQrcode = async (req, res) => {
//   const { upiId, name, amount } = req.body;
//   if (!upiId || !name || !amount) {
//       return res.status(400).json({status:0,message: 'UPI ID, Name, and Amount are required' });
//   }

//   const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${encodeURIComponent(amount)}&tr=${encodeURIComponent(Date.now().toString())}&cu=INR`;
//   const transactionId = generateTransactionId();
//   try {
//       const qrCodeData = await QRCode.toDataURL(upiString);
//       res.status(200).json({status:1 ,message:"Get payment payment methods" ,qrCode: qrCodeData, upiLink: upiString ,transactionId});
//   } catch (err) {
//       res.status(500).json({ error: 'Failed to generate QR code' });
//   }
// };


const paymentHistory = async (req,res)=>{
   try{
    const { utrNumber, transactionId, amount,orderId} = req.body;
    const userId = req.userId;

    if (!utrNumber) {
      return res.status(400).json({ true:0,message: 'UTR number are required'});
    }
    
    const findUtr = await PaymentHistory.findOne({utrNumber});
    if(findUtr){
      return res.status(400).json({
         status:0,
         message:"Invalid UTR Number"
      })
    }
    const order = await Order.findOne({orderId});
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found'});
    }
    const paymentHistory = new PaymentHistory({
      utrNumber,amount,transactionId,orderId,
      userId:userId
    })
    const savePaymentHistory = await paymentHistory.save();
    order.paymentStatus = 'Completed';
    order.status = 'Confirmed';
    await order.save();
    return res.status(201).json({ status: 1, message: 'Payment  successfully'});
   }catch(err){
    return res.status(500).json({
      status: 0,
      message: err.message.toString(),
  });
   }
}


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




const vendorPayOutV2 = async (req, res) => {
    try {
        const { userId, beneficiaryName, accountNum, accountIFSC, bankName, amount, remarks, narration,reference } = req.body;
        const payoutPayload = {
            account_number: accountNum,
            account_ifsc: accountIFSC,
            bankname: bankName,
            confirm_acc_number: accountNum,
            requesttype: "IMPS",
            beneficiary_name: beneficiaryName,
            amount: amount.toString(),
            narration: narration || "Payout Transaction",
            reference: reference
        };
        const keplerResponse = await axios.post(process.env.payout_url, payoutPayload, {
            headers: {
                "x-client-id":process.env.client_id,
                "x-client-secret":process.env.client_secret,
                "Content-Type": "application/json"
            }
        });

        const responseData = keplerResponse.data;
        const newPayout = new VendorPayOut({
            userId,
            beneficiaryName,
            accountNum,
            accountIFSC,
            bankName,
            payoutsRef: responseData.reference, 
            remarks,
            amount,
            narration: narration || "Payout Transaction"
        });

        await newPayout.save();

        res.status(200).json({status:1, message: "Payout initiated successfully", data: responseData });
    } catch (error) {
        res.status(500).json({status:0, message: "Payout initiation failed", error:error.message });
    }
  }


  const vendorPayOut = async (req,res)=>{
    try{
        const { error } = vendorPayOutValidation.validate(req.body);
        if (error) {
          return res.status(400).send({
            success: 0,
            message: error.details[0].message
          });
        }
        const id = req.userId;
       const { beneficiaryName,accountNum,accountIFSC,bankName,payoutsRef,remarks,amount,narration} = req.body;
       const vendor = new VendorPayOut ({
          beneficiaryName,accountIFSC,accountNum,amount,payoutsRef,remarks,bankName,narration,userId:id
       })
       const savedata = await vendor.save();
       return res.status(201).json({
        success: 1,
        message: "VendorPayOut added successfully"
    });
    }catch(error){
        return res.status(500).json({
            success: 0,
            message: error.message.toString(),
        });
    }
}


const getAllVendorPayOuts = async (req, res) => {
  try {
    const vendorPayOuts = await VendorPayOut.find().populate("userId" ,"firstName");
    if (vendorPayOuts.length === 0) {
      return res.status(404).json({
        success: 0,
        message: "No vendor payouts found",
      });
    }
    return res.status(200).json({
      success: 1,
      message: "Vendor payouts fetched successfully",
      vendorPayOuts,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: error.message,
    });
  }
};


// Payout webhook callback endpoint
const payoutWebhook = async (req, res) => {
    const { event, status, data } = req.body;
    if (event === 'TRANSFER_STATUS_UPDATE' && status === 'success') {
        try {
          console.log("payoutWebhook",data);
          
            // const payout = new Payout({
            //     amount: data.amount,
            //     remarks: data.remarks,
            //     payment_mode: data.payment_mode,
            //     transfer_date: new Date(data.transfer_date),
            //     beneficiary_bank_name: data.beneficiary_bank_name,
            //     payout_id: data.payout_id,
            //     beneficiary_account_ifsc: data.beneficiary_account_ifsc,
            //     beneficiary_account_name: data.beneficiary_account_name,
            //     beneficiary_account_number: data.beneficiary_account_number,
            //     beneficiary_upi_handle: data.beneficiary_upi_handle || null,
            //     UTR: data.UTR
            // });
            // await payout.save();
            return res.status(200).json({
                status: 'success',
                message: 'data received'
            });
        } catch (error) {
            return res.status(500).json({
                status: 'Failed',
                message: error.toString()
            });
        }
    } 
    else {
        return res.status(400).json({
            status: 'Failed',
            message: 'Invalid event or status'
        });
    }
  }



module.exports = {
  paymentType,getAllPaymentType,deletePaymentType,getPaymentType,generateUpiQrcode,
  paymentHistory,validateQrcode,vendorPayOut,getAllVendorPayOuts,payoutWebhook,vendorPayOutV2
}