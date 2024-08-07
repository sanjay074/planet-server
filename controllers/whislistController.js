const mongoose = require("mongoose");
const Joi = require("joi");
const Product = require("../models/Product");
const Whislist = require("../models/whislist");

// Joi schema for addTowhislist
const addToWishlistSchema = Joi.object({
  products: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string()
          .required()
          .custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
              return helpers.message("Invalid product ID format");
            }
            return value;
          }),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .required()
    .messages({
      "array.base": "Products should be an array",
      "array.min": "Products array should not be empty",
    }),
});

// Joi schema for getWhishList
const getWishlistSchema = Joi.object({
  id: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("Invalid ID format");
      }
      return value;
    }),
});

// Joi schema for deleteWhislist
const deleteWishlistSchema = Joi.object({
  productId: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("Invalid product ID format");
      }
      return value;
    }),
});

const addTowhislist = async (req, res) => {
  try {
    // Validate the request body using Joi schema
    const { error, value } = addToWishlistSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const userId = req.userId;
    const productToAdd = value.products; // Use validated value 

    let mywhislist = await Whislist.findOne({ userId });
    if (!mywhislist) {
      mywhislist = new Whislist({ userId, cartItems: [] });
    }

    for (const productData of productToAdd) {
      const { productId, quantity } = productData;

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(400).send({
          success: false,
          message: "This product is not available",
        });
      }

      if (product.quantity < quantity) {
        return res.status(400).send({
          success: false,
          message: "Stock is not available for this product",
        });
      }

      const itemIndex = mywhislist.cartItems.findIndex(
        (item) => item.productId.toString() === productId
      );
      if (itemIndex > -1) {
        mywhislist.cartItems[itemIndex].quantity += quantity;
      } else {
        mywhislist.cartItems.push({ productId, quantity });
      }
    }

    let totalPrice = 0;
    for (const item of mywhislist.cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).send({
          success: false,
          message: "Product is not available",
        });
      }
      totalPrice += product.basePrice * item.quantity;
    }
    mywhislist.totalPrice = totalPrice;

    await mywhislist.save();

    return res.status(200).json({
      success: true,
      message: "Your wishlist was created successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in adding to the wishlist",
      error: error.message,
    });
  }
};

const getWhishList = async (req, res) => {
  try {
    // Validate the request params using Joi schema
    const { error, value } = getWishlistSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const _id = value.id; // Use validated value

    const data = await Whislist.findOne({ _id });
    if (!data) {
      return res.status(200).send({
        success: true,
        message: "No data found in the wishlist",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Here is your data",
      data,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in getting data from your wishlist",
      error: error.message,
    });
  }
};

const deleteWhislist = async (req, res) => {
  try {
    // Validate the request body using Joi schema
    const { error, value } = deleteWishlistSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const userId = req.userId;
    const { productId } = value; // Use validated value

    let myWhislist = await Whislist.findOne({ userId });
    if (!myWhislist) {
      return res.status(400).json({
        success: false,
        message: "No wishlist found",
      });
    }

    const itemIndex = myWhislist.cartItems.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (itemIndex === -1) {
      return res.status(400).send({
        success: false,
        message: "No product found in this wishlist",
      });
    }

    if (myWhislist.cartItems[itemIndex].quantity > 1) {
      myWhislist.cartItems[itemIndex].quantity -= 1;
    } else {
      myWhislist.cartItems.splice(itemIndex, 1);
    }

    let totalPrice = 0;
    for (const item of myWhislist.cartItems) {
      const product = await Product.findById(item.productId);
      totalPrice += product.basePrice * item.quantity;
    }
    myWhislist.totalPrice = totalPrice;

    await myWhislist.save();

    return res.status(200).send({
      success: true,
      message: "Your item was successfully removed from the wishlist",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in deleting the wishlist",
      error: error.message,
    });
  }
};

module.exports = { addTowhislist, getWhishList, deleteWhislist };
