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
  footSize: Joi.array().items(Joi.string().valid("1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12")).messages({
    "array.base": "Foot sizes must be an array",
    "string.base": "Foot size must be a string",
    "any.only": "Foot size must be one of 1,2,3,4,5,6,7,8,9,10,11,12",
    "any.required": "Foot size is required",
  }),
  size: Joi.array().items(Joi.string().valid("XS", "S", "M", "L", "XL", "XXL")).messages({
    "array.base": "Product sizes must be an array",
    "string.base": "Size must be a string",
    "any.only": "Size must be one of XS, S, M, L, XL, XXL",
    "any.required": "Size is required",
  }),
  pantSize:Joi.array().items(Joi.string().valid("28", "30", "32", "34", "36", "38", "40", "42", "44")).messages({
    "array.base": "Foot sizes must be an array",
    "string.base": "Foot size must be a string",
    "any.only": "Foot size must be one of 28,30...........40 ",
    "any.required": "Foot size is required",
  }),

  quantity: Joi.number().integer().min(0).required().messages({
    "number.base": "Product quantity must be a number",
    "number.min": "Product quantity cannot be less than 0",
    "any.required": "Product quantity is required",
  }),
  stock: Joi.boolean().default(true),
  discountPrice: Joi.number().min(0).messages({
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
  active: Joi.boolean().default(true),
});


//register Scehma
const signupSchema = Joi.object({
  email: Joi.string().email().required().messages({
      'string.email': 'Invalid email format',
      'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
      'string.min': 'Password should be at least 6 characters long',
      'any.required': 'Password is required'
  }),
  isAdmin: Joi.boolean().messages({
      'boolean.base': 'isAdmin should be a boolean value',
      'any.required': 'isAdmin is required'
  })
});




//loginSchema

const loginSchema =Joi.object({
     email: Joi.string().email().required().messages({
      'string.email': 'Invalid email format',
      'any.required': 'Email is required'
}),
    password: Joi.string().min(6).required().messages({
    'string.min': 'Password should be at least 6 characters long',
    'any.required': 'Password is required'
}),
})

//phone Sechema
const phoneLoginSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/) // Ensures the phone number is exactly 10 digits
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be exactly 10 digits',
      'any.required': 'Phone number is required'
    })
}); 


// Define the validation schema
const otpValidationSchema = Joi.object({
  phone: Joi.string().pattern(/^\d{10}$/).required(), // Validate 10-digit phone number
  otp: Joi.string().required(), // OTP should be a string
  details: Joi.string().required(), // Additional details (e.g., request ID)
});

// Define Joi Profile Schema
const schema = Joi.object({
  mobileNumber: Joi.string().required(),
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  birthday: Joi.date().optional(),
  alternateNumber: Joi.string().optional()
});


  // Define Joi schema
  const Addresschema = Joi.object({
    name: Joi.string().trim().required().messages({
      "string.empty": "Name is required",
      "any.required": "Name is required"
    }),
    mobile: Joi.string().trim().pattern(/^\d{10}$/).message('Mobile number must be a 10-digit number').required(),
    email: Joi.string().email().trim().lowercase().required().messages({
      "string.email": "Valid email is required",
      "any.required": "Email is required"
    }),
    Pincode: Joi.string().trim().required().messages({
      "string.empty": "Pincode is required",
      "any.required": "Pincode is required"
    }),
    Landmark: Joi.string().trim().required().messages({
      "string.empty": "Landmark is required",
      "any.required": "Landmark is required"
    }),
    district: Joi.string().trim().required().messages({
      "string.empty": "District is required",
      "any.required": "District is required"
    }),
    state: Joi.string().trim().required().messages({
      "string.empty": "State is required",
      "any.required": "State is required"
    }),
    addressAs: Joi.string().trim().valid('home', 'office').required().messages({
      "any.only": "Address type must be 'home' or 'office'",
      "any.required": "Address type is required"
    }),
    fullAddress: Joi.string().trim().message({
      "string.empty": "fullAddress is required",
      "any.required": "fullAddress is required"
    })

  });

  // Validation schema for adding items to the cart
const updateItemSchema = Joi.object({
          productId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
          action: Joi.string().valid('increment', 'decrement')
});
 // Define Joi schema
 const Contactschema = Joi.object({
  name: Joi.string().trim().required(),
  mobile: Joi.string().trim().pattern(/^\d{10}$/).message('Mobile number must be a 10-digit number').required(),
  email: Joi.string().email().trim().lowercase().required(),
  message: Joi.string().max(250).message('Message should not exceed 250 characters').required()
});

// Validation schema for creating an order
const JoiOrderSchema = Joi.object({
  addressId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  products: Joi.array().items(
      Joi.object({
          productId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
          quantity: Joi.number().integer().positive().required()
      })
  ).required()
});

// Validation schema for creating a rating and review
const createRatingSchema = Joi.object({
  productId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  review: Joi.string().optional()
});


// Joi validation schemas
const createReturnSchema = Joi.object({
  orderId: Joi.string().required(),
  reason: Joi.string().valid('received wrong item', 'quality of product not matched', 'product is missing', 'don’t like the size').required(),
  message: Joi.string().optional()
});

const approveReturnSchema = Joi.object({
  returnOrderId: Joi.string().required()
});

// Validation schema for adding products to the wishlist
const addToWishlistSchema = Joi.object({
  Products: Joi.array().items(
      Joi.object({
          productId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
      }).required()
  ).min(1).required()
});


const paymentSchema = Joi.object({
  paymentType:Joi.string()
  .valid("UPI", "Paytm", "Google Pay")
  .required()
  .messages({
    "any.only": "Payment type must be one of [UPI, Paytm, Google Pay].",
    "string.empty": "Payment type is required.",
    "any.required": "Payment type is a mandatory field."
  }),
  orCode:Joi.string()
      // .required()
      .messages({
        "string.empty": "OR code is required.",
        "any.required": "OR code is a mandatory field."
      }),
  upiNumber:Joi.string()
      .required()
      .messages({
        "string.empty": "UPI number is required.",
        "any.required": "UPI number is a mandatory field."
      }),    
})

module.exports = {
  categoryValidationSchema,
  subCategoryValidationSchema,
  brandValidationSchema,
  productValidationSchema,
  signupSchema,
  loginSchema,
  phoneLoginSchema,
  otpValidationSchema,
  schema,
  Addresschema,
  // addToCartSchema,
  Contactschema,
  JoiOrderSchema,
  createRatingSchema,
  createReturnSchema,
  approveReturnSchema,
  addToWishlistSchema ,
  paymentSchema,
  updateItemSchema
};
