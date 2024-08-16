const mongoose = require("mongoose");

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "category name is required"],
      unique: true,
    },
  },
  
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
