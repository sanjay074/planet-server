const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Address = require("../models/userAddress");
const Product = require("../models/Product");
const Joi = require('joi');

// Joi validation schemas
const orderSchema = Joi.object({
  addressId: Joi.string().required(),
  products: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().min(1).required()
    })
  ).optional(),
  addfromCart: Joi.boolean().optional()
});

const returnOrderSchema = Joi.object({
  orderId: Joi.string().required(),
  reason: Joi.string().valid('received wrong item', 'quality of product not matched', 'product is missing', 'don’t like the size').required(),
  message: Joi.string().optional()
});

const updateOrderSchema = Joi.object({
  status: Joi.string().required()
});

const createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { error } = orderSchema.validate(req.body);
    if (error) {
      return res.status(400).send({
        success: false,
        message: error.details[0].message
      });
    }
    const { addressId, products, addfromCart } = req.body;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).send({
        success: false,
        message: "address id not valid"
      });
    }

    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(401).send({
        success: false,
        message: "Address is not found"
      });
    }

    let orderItems = [];
    let totalPrice = 0;

    if (Array.isArray(products) && products.length > 0) {
      for (const productData of products) {
        const { productId, quantity } = productData;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
          return res.status(400).send({
            success: false,
            message: "product id is not valid "
          });
        }

        const product = await Product.findById(productId);
        if (!product) {
          return res.status(400).send({
            success: false,
            message: "Product is not available"
          });
        }
        if (product.quantity < quantity) {
          return res.status(401).send({
            success: false,
            message: "Stock not available"
          });
        }
        totalPrice += product.basePrice * quantity;
        orderItems.push({ productId, quantity });
      }
    }

    if (addfromCart) {
      let cart = await Cart.findOne({ userId }).populate("cartItems.productId");
      if (cart && cart.cartItems.length > 0) {
        for (const item of cart.cartItems) {
          const product = item.productId;
          const quantity = item.quantity;

          if (product.quantity < quantity) {
            return res.status(401).send({
              success: false,
              message: "Stock not available"
            });
          }
          totalPrice += product.basePrice * quantity;
          orderItems.push({ productId: product._id, quantity });
        }
      }
    }

    if (orderItems.length === 0) {
      return res.status(400).send({
        success: false,
        message: "your cart is empty"
      });
    }

    const order = new Order({
      userId,
      orderItems,
      address: addressId,
      totalPrice
    });
    await order.save();

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: -item.quantity }
      });
    }

    if (addfromCart) {
      await Cart.findByIdAndUpdate({ userId }, {
        cartItems: [],
        totalPrice: 0
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order placed successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error in creating the order",
      error
    });
  }
};

const getAllOrder = async (req, res) => {
  try {
    const getAllData = await Order.find({});

    return res.status(200).json({
      success: true,
      message: "Here is your all order",
      total: getAllData.length,
      getAllData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error in fetching all orders",
      error
    });
  }
};

const getmyOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await Order.find({ userId })
      .populate('orderItems.productId')
      .populate({
        path: 'orderItems.productId',
        select: "name color brand size -_id"
      });

    if (!orders.length) {
      return res.status(400).send({
        success: false,
        message: "No orders found for the user"
      });
    }

    return res.status(200).send({
      success: true,
      message: "Here are all your orders",
      total: orders.length,
      orders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error in fetching user orders",
      error
    });
  }
};

const updateOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const { error } = updateOrderSchema.validate(req.body);
    if (error) {
      return res.status(400).send({
        success: false,
        message: error.details[0].message
      });
    }
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    const data = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!data) {
      return res.status(400).send({
        success: false,
        message: "Order not found"
      });
    }

    return res.status(200).send({
      success: true,
      message: "Order updated successfully",
      data
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      message: "error in updating the order",
      error: error.message
    });
  }
};

module.exports = { createOrder, getAllOrder, getmyOrder, updateOrder };
