const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: [true, "Mobile number is required"],
    unique: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^\d{10}$/.test(v); // Validates a 10-digit mobile number
      },
      message: props => `${props.value} is not a valid 10-digit mobile number!`
    }
  },
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return /\S+@\S+\.\S+/.test(v); // Basic email validation
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other'
  },
  birthday: {
    type: Date
  },
  alternateNumber: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        return /^\d{10}$/.test(v); // Validates a 10-digit mobile number
      },
      message: props => `${props.value} is not a valid 10-digit mobile number!`
    }
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
