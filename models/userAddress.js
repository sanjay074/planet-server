const mongoose = require("mongoose");

const addressSchema =  mongoose.Schema({
  name:{
    type: String,
    trim: true,
    required: [true, "Name is required"]
  },
  mobile:{
    type: String,
    trim: true,
    required: [true, "Mobile number is required"],
    validate: {
      validator: function (v) {
        return /^\d{10}$/.test(v); // Validates a 10-digit mobile number
      },
      message: props => `${props.value} is not a valid 10-digit mobile number!`
    }
  },
  email:{
    type: String,
    trim: true,
    required: [true, "Email is required"],
    lowercase: true,
    validate: {
      validator: function (v) {
        return /\S+@\S+\.\S+/.test(v); // Basic email validation
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  Pincode:{
    type: String,
    trim: true,
    required: [true, "Pincode is required"]
  },
  Landmark:{
    type: String,
    trim: true,
    required: [true, "Landmark is required"]
  },
  district:{
    type: String,
    trim: true,
    required: [true, "District is required"]
  },
  state:{
    type: String,
    trim: true,
    required: [true, "State is required"]
  },
  addressAs: {
    type: String,
    required: [true, "Address type is required"],
    enum: ['home', 'office'],
    default: 'home'
  }
}, { timestamps: true });

const Address = mongoose.model('Address', addressSchema);
module.exports = Address
