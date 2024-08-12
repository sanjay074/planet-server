const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const returnOrder = require("../models/returnOrder");
const { createReturnSchema, approveReturnSchema } = require("../validations/validation");


const createReturn = async (req, res) => {
  try {
    // Validate request body
    const { error } = createReturnSchema.validate(req.body);
    if (error) {
      return res.status(400).send({
        success: false,
        message: error.details[0].message
      });
    }

    const { orderId, reason, message } = req.body;

    // Validate orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).send({
        success: false,
        message: "Order ID not valid"
      });
    }

    // Fetch the order by ID
    const order = await Order.findById(orderId);

    // Validation
    if (!order || order.status === 'Returned') {
      return res.status(400).send({
        success: false,
        message: "Your order is not found or already returned"
      });
    }

    // Create a return entry
    const returnEntry = await new returnOrder({
      orderId,
      reason,
      message
    }).save();

    // Return response
    return res.status(200).send({
      success: true,
      message: "Your return request was sent successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in creating the return",
      error: error.message
    });
  }
};

// Approve return
const approveReturn = async (req, res) => {
  try {
    // Validate request body
    const { error } = approveReturnSchema.validate(req.body);
    if (error) {
      return res.status(400).send({
        success: false,
        message: error.details[0].message
      });
    }

    const { returnOrderId } = req.body;

    // Validate returnOrderId
    if (!mongoose.Types.ObjectId.isValid(returnOrderId)) {
      return res.status(400).send({
        success: false,
        message: "Return order ID not valid"
      });
    }

    // Fetch the return order by ID
    const myReturnOrder = await returnOrder.findById(returnOrderId);

    if (!myReturnOrder || myReturnOrder.status === "Approved") {
      return res.status(400).send({
        success: false,
        message: "Return order not found or already approved"
      });
    }

    // Update the return order status
    myReturnOrder.status = 'Approved';
    await myReturnOrder.save();

    // Fetch the related order
    const order = await Order.findById(myReturnOrder.orderId);

    if (!order) {
      return res.status(400).send({
        success: false,
        message: "Related order not found"
      });
    }

    // Update the order status
    order.status = 'Returned';
    await order.save();

    // Calculate total return amount and update product quantities
    let totalReturnAmount = 0;
    for (const item of order.orderItems) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.quantity += item.quantity;
        await product.save();
        totalReturnAmount += product.basePrice * item.quantity;
      }
    }

    // Return response
    return res.status(200).send({
      success: true,
      message: "Your return has been approved",
      totalReturnAmount,
      myReturnOrder
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in approving the return",
      error: error.message
    });
  }
};

module.exports = { createReturn, approveReturn };
