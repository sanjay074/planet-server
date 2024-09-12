const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
firstName:{
    type:String
},
lastName:{
    type:String
},
  phone: {
    type: String,
  },
  email: {
    type: String,
  },

  password:{
    type:String
},
},{timestamps:true})

  
const users = mongoose.model('users', userSchema);
module.exports = users;

