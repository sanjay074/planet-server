const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  phone: {
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
  }
},{timestamps:true})

  
const users = mongoose.model('users', userSchema);
module.exports = users;

