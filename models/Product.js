const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description:{
      type: String,
      required: [true, "Product description is required"],
      
    },
    category:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product categoryId is required"],
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: [true, "Product subCategoryId is required"],
    },
    brand:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: [true, "Product brandId is required"],
    },
    color:{
      type:[String],
      required: [true, "Product color is required"],
    },
    size:{
      type:[String],
   //   required: [true, "Product size is required"],
      enum: ["XS", "S", "M", "L", "XL", "XXL"],
    },
    numSize:{
      type:[String],
      enum:["24","26","28","30","32","34","36","38","40","42","44","46","48"]
    },
    footSize:{
      type:[String],
      enum:["1","2","3","4","5","6","7","8","9","10","11","12"]
    },
    quantity:{
      type: Number,
      required: [true, "Product quantity is required"],
      min: 0,
    },
    stock:{
      type: Boolean,
      default: true,
    },
    discountPrice:{
      type: Number,
    //  required: [true, "Product discount price is required"],
      min: 0,
    },
    basePrice:{
      type: Number,
      required: [true, "Product base price is required"],
      min: 0,
    },
    finalPrice:{
      type: Number,
      required: [true, "product final price is required"],
      min: 0,
      validate: {
        validator: function () {
          return this.finalPrice <= this.basePrice;
       },
        message: "Final price should be less than or equal to base price",
      },
    },
    images: {
      type: [{ type: String, required: [true, "Product Image is required"] }],
      validate: {
        validator: function (arr) {
          return arr && arr.length > 0;
        },
        message: "At least one picture is required",
      },
    },
    active:{
      type: Boolean,
      default: true,
    },
    productDetails:{
      type:String
    }
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
