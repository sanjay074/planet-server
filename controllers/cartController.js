const Product = require('../models/Product');
const Cart = require('../models/Cart'); 
const mongoose = require("mongoose");
const { updateItemSchema, addToCartSchema,oneOrderSummarySchema} = require('../validations/validation');

const addToCart = async (req, res) => {
  try {
    const { error } = addToCartSchema.validate(req.body);
    if (error) {
      return res.status(400).send({
        success: false,
        message: error.details[0].message
      });
    }

    const userId = req.userId;
    const productsToAdd = req.body.products;

    if (!Array.isArray(productsToAdd) || productsToAdd.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Invalid products array",
      });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, cartItems: [] });
    }

    for (const productData of productsToAdd) {
      const { productId, quantity, size } = productData;

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).send({
          success: false,
          message: `Invalid product Id`,
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).send({
          success: false,
          message: `Product not available`,
        });
      }

      if (product.quantity < quantity) {
        return res.status(400).send({
          success: false,
          message: `Stock not available for product`,
        });
      }

      const itemIndex = cart.cartItems.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        return res.status(400).send({
          success: false,
          message: `Product already added to cart`,
        });
      } else {
        cart.cartItems.push({ productId, quantity, size });
      }
    }
    
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Items added to cart",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


//get the cart 
const getcart = async (req, res) => {
  try {
    const userId = req.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const cart = await Cart.findOne({ userId }).populate('cartItems.productId', 'name description finalPrice basePrice images size numSize footSize discountPrice');
    
    if (!cart || cart.cartItems.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Cart is empty',
        cart: null,
        orderSummary: {
          total: 0,
          discount: 0,
          subtotal: 0,
          deliveryCharges: 0,
          totalPrice: 0
        }
      });
    }
    
    let subtotal = 0;
    let totalDiscount = 0;
    let total = 0;
    
    cart.cartItems.forEach(item => {
      const itemSubtotal = item?.productId?.finalPrice * item?.quantity;
      const itemTotal = item?.productId?.basePrice * item?.quantity;
      total += itemTotal;
      subtotal += itemSubtotal;
    });
    
    totalDiscount = total - subtotal;
    
    let deliveryCharges = 0;
    if (subtotal < 1500 && subtotal > 0) {
      deliveryCharges = 99;
    } else {
      deliveryCharges = "Free";
    }
    
    const totalAmount = subtotal + (deliveryCharges === "Free" ? 0 : deliveryCharges);
    
    const orderSummary = {
      total,
      discount: totalDiscount,
      subtotal,
      deliveryCharges,
      totalPrice: subtotal === 0 ? 0 : totalAmount
    };
    
    return res.status(200).json({
      success: true,
      message: "Here is your cart data",
      cart,
      orderSummary
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message.toString(),
    });
  }
};


const oneItemOrderSummary = async (req,res)=>{
  try{
  
    const { error } = oneOrderSummarySchema.validate(req.body);
    if (error) {
      return res.status(400).send({
        success: false,
        message: error.details[0].message
      });
    }
    const {productId,selectedSize,quantity} = req.body;
    const productItem = await Product.findOne({_id:productId});
    if(!productItem){
      return res.status(400).json({
        status:0,
        message:"Product not found"
      })
    }
    let subtotal = productItem.finalPrice;
    let totalDiscount =productItem.discountPrice ;
    let total = productItem.basePrice;
    let deliveryCharges = 0;
    if (subtotal< 1500 && subtotal > 0) {
      deliveryCharges = 99;
    } else {
      deliveryCharges = "Free";
    }
    const totalAmount = subtotal + (deliveryCharges === "Free" ? 0 : deliveryCharges);
    const orderSummary = {
      total,
      discount: totalDiscount,
      subtotal,
      deliveryCharges,
      totalPrice: subtotal === 0 ? 0 : totalAmount
    };
    
    return res.status(200).json({
      status:1,
      message:"Get data sucessfully",
      productItem,orderSummary,selectedSize,quantity
    })
  }catch(error){
    return res.status(500).json({
      success: false,
      message: error.message.toString(),
    });
  }
}


//delete from cart 
const deleteFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).send({
        success: false,
        message: `Invalid product Id: ${productId}`
      });
    }
    let cart = await Cart.findOne({ userId });
    if (cart) {
      cart.cartItems = cart.cartItems.filter(item =>
          !(item.productId.toString() === productId)
      );
      cart = await cart.save();
      return res.status(200).json({ success: true, message: "User item remove from cart sucessfully" });
  } else {
      return res.status(400).json({ success: false, message: "Cart not found"});
  }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateItemQuantity = async (req, res) => {
  try {
      // Validate request body
      const { error } = updateItemSchema.validate(req.body);
      if (error) {
        return res.status(400).send({
          success: false,
          message: error.details[0].message
        });
      }
      const userId = req.userId;
      const { productId, action } = req.body;
      if(!mongoose.Types.ObjectId.isValid(productId)){
          return res.status(400).json({ success: false, message: "Invalid item ID" });
      }
      if (!userId) {
          return res.status(400).json({ success: false, message: 'User ID is required' });
      }
      const cart = await Cart.findOne({ userId }).exec();
      if (!cart) {
          return res.status(400).json({ success: false, message: 'Cart not found' });
      }
      const itemIndex = cart.cartItems.findIndex(
          item => item.productId.toString() === productId
      );
      if (itemIndex === -1) {
          return res.status(400).json({ success: false, message: 'Item not found in cart' });
      }

      if (action === 'increment') {
          cart.cartItems[itemIndex].quantity += 1;
      } else if (action === 'decrement') {
          cart.cartItems[itemIndex].quantity = Math.max(0, cart.cartItems[itemIndex].quantity - 1);
      } else {
           return res.status(400).json({ success: false, message: 'Invalid action' });
      }
      await cart.save();
      return res.status(200).json({ success: true, message: 'Item quantity updated successfully' });
  } catch (error) {
      return res.status(500).json({
          success: false,
          message: error.message.toString(),
      });
  }
}




const  deleteCartController =async(req,res)=>{
  try{
    //id from params
    const cartId =req.params.id
    //validate cart id 
    if(!mongoose.Types.ObjectId.isValid(cartId)){
      return res.status(400).send({
        success:false,
        message:`invalid cartId`,
      })
    }
   //delete the cart     
    const deleteCart = await Cart.findByIdAndDelete(cartId)
    //validation
    if(!deleteCart){
        return res.status(400).send({
        succes:false,
        message:"no cart available"
      })
    }
    return res.status(200).send({
      succes:true,
      message:"cart deleted successfully"
    })
  }catch(error){
    return res.status(500).send({
      success:false,
      message:"error in Deleting the cart",
      error:error.message
    })
  }
}

module.exports ={addToCart,getcart,deleteFromCart,updateItemQuantity,deleteCartController,oneItemOrderSummary}