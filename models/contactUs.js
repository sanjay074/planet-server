const mongoose = require("mongoose");

const contactSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  mobile: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        return /^\d{10}$/.test(v); // Validates a 10-digit mobile number
      },
      message: props => `${props.value} is not a valid 10-digit mobile number!`
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return /\S+@\S+\.\S+/.test(v); // Basic email validation
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  message: {
    type: String,
    maxLength: [1500, "Message should not exceed 1500 characters"]
  }
}, { timestamps: true });

const Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact;
