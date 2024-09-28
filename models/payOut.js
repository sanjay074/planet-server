const mongoose = require('mongoose');
const  payOutSchema =  mongoose.Schema({
    amount: { type: String,  },
    remarks: { type: String },
    payment_mode: { type: String, },
    transfer_date: { type: Date, },
    beneficiary_bank_name: { type: String, },
    payout_id: { type: String,},
    beneficiary_account_ifsc: { type: String, },
    beneficiary_account_name: { type: String, },
    beneficiary_account_number: { type: String,},
    beneficiary_upi_handle: { type: String },
    UTR: { type: String }
 
},{timestamps:true})
module.exports = mongoose.model("Payout",payOutSchema) 
