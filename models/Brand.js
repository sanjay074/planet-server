const mongoose = require("mongoose");

const brandSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Brand name is required"],
    unique: true,
  },
  pic: {
    type: String,
    required: [true, "Brand pic is required"],
  },
});

const Brand = mongoose.model("Brand", brandSchema);

module.exports = Brand;
