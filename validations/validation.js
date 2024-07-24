const Joi = require("joi");
// const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const categoryValidationSchema = Joi.object({
  name: Joi.string().min(1).max(255).required().messages({
    "string.base": "Category name should be a type of text",
    "string.empty": "Category name is required",
    "any.required": "Category name is required",
    "string.min": "Category name should have a minimum length of {#limit}",
    "string.max": "Category name should have a maximum length of {#limit}",
  }),
});

const subCategoryValidationSchema = Joi.object({
  name: Joi.string().min(1).max(255).required().messages({
    "string.base": "Category name should be a type of text",
    "string.empty": "Category name is required",
    "any.required": "Category name is required",
    "string.min": "Category name should have a minimum length of {#limit}",
    "string.max": "Category name should have a maximum length of {#limit}",
  }),
  category: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .required()
    .messages({
      "string.base": "Category ID should be a type of text",
      "any.required": "Category ID is required",
      "any.invalid": "Category ID must be a valid ObjectId",
    }),
});

const brandValidationSchema = Joi.object({
  name: Joi.string().min(1).max(255).required().messages({
    "string.base": "Brand name should be a type of text",
    "string.empty": "Brand name is required",
    "any.required": "Brand name is required",
    "string.min": "Brand name should have a minimum length of {#limit}",
    "string.max": "Brand name should have a maximum length of {#limit}",
  }),
  pic: Joi.string(),
});

const productValidationSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.base": "Product name must be a string",
    "string.empty": "Product name is required",
    "any.required": "Product name is required",
  }),
  description: Joi.string().trim().required().messages({
    "string.base": "Product description must be a string",
    "string.empty": "Product description is required",
    "any.required": "Product description is required",
  }),
  category: Joi.string().hex().length(24).required().messages({
    "string.base": "Product categoryId must be a valid ObjectId",
    "string.empty": "Product categoryId is required",
    "any.required": "Product categoryId is required",
  }),
  subCategory: Joi.string().hex().length(24).required().messages({
    "string.base": "Product subCategoryId must be a valid ObjectId",
    "string.empty": "Product subCategoryId is required",
    "any.required": "Product subCategoryId is required",
  }),
  brand: Joi.string().hex().length(24).required().messages({
    "string.base": "Product brandId must be a valid ObjectId",
    "string.empty": "Product brandId is required",
    "any.required": "Product brandId is required",
  }),
  color: Joi.array().items(Joi.string().required()).required().messages({
    "array.base": "Product colors must be an array",
    "array.includes": "Product colors must contain strings",
    "any.required": "Product colors are required",
  }),
  // color: Joi.string().required().messages({
  //   "string.base": "Product color must be a string",
  //   "string.empty": "Product color is required",
  //   "any.required": "Product color is required",
  // }),
  size: Joi.string()
    .valid("XS", "S", "M", "L", "XL", "XXL")
    .required()
    .messages({
      "string.base": "Product size must be a string",
      "any.only": "Product size must be one of XS, S, M, L, XL, XXL",
      "string.empty": "Product size is required",
      "any.required": "Product size is required",
    }),
  quantity: Joi.number().integer().min(0).required().messages({
    "number.base": "Product quantity must be a number",
    "number.min": "Product quantity cannot be less than 0",
    "any.required": "Product quantity is required",
  }),
  stock: Joi.boolean().default(true),
  discountPrice: Joi.number().min(0).required().messages({
    "number.base": "Product discount price must be a number",
    "number.min": "Product discount price cannot be less than 0",
    "any.required": "Product discount price is required",
  }),
  basePrice: Joi.number().min(0).required().messages({
    "number.base": "Product base price must be a number",
    "number.min": "Product base price cannot be less than 0",
    "any.required": "Product base price is required",
  }),
  finalPrice: Joi.number()
    .min(0)
    .required()
    .custom((value, helpers) => {
      const { basePrice } = helpers.state.ancestors[0];
      if (value > basePrice) {
        return helpers.message(
          "Final price should be less than or equal to base price"
        );
      }
      return value;
    })
    .messages({
      "number.base": "Product final price must be a number",
      "number.min": "Product final price cannot be less than 0",
      "any.required": "Product final price is required",
    }),
  images: Joi.array().items(Joi.string()),
  // images: Joi.array()
  //   .items(Joi.string().required())
  //   .min(1)
  //   .required()
  //   .messages({
  //     "array.base": "Product images must be an array",
  //     "array.min": "At least one picture is required",
  //     "any.required": "Product images are required",
  //   }),
  active: Joi.boolean().default(true),
});

module.exports = {
  categoryValidationSchema,
  subCategoryValidationSchema,
  brandValidationSchema,
  productValidationSchema,
};
