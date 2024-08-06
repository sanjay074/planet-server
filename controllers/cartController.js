const Product = require('../models/Product');
const Cart = require('../models/Cart'); 
const mongoose = require("mongoose");

const addToCart = async (req, res) => {
    try {
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

    
    // Iterate over the products to add them to the cart
    for (const productData of productsToAdd) {
      const { productId, quantity } = productData;

      // Validate productId
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).send({
          success: false,
          message: `Invalid product Id: ${productId}`,
        });
      }

    
      // Find the product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).send({
          success: false,
          message: `Product not available: ${productId}`,
        });
      }

      // Check stock availability
      if (product.quantity < quantity) {
        return res.status(400).send({
          success: false,
          message: `Stock not available for product: ${productId}`,
        });
      }

    
      // Check if the product is already in the cart
      const itemIndex = cart.cartItems.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        cart.cartItems[itemIndex].quantity += quantity;
      } else {
        cart.cartItems.push({ productId, quantity });
      }
    }

    
    // Calculate the total price of the cart
    let totalPrice = 0;
    for (const item of cart.cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).send({
          success: false,
          message: `Product not available: ${item.productId}`,
        });
      }
      totalPrice += product.basePrice * item.quantity;
    }
    cart.totalPrice = totalPrice;

    
    // Save the updated cart
    await cart.save();

      res.status(200).json({
      success: true,
      message: "Items added to cart",
      cart,
    });
  } catch (error) {
      console.error("Error in adding to the cart:", error);
      res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};





//get the cart 
const getcart =async(req,res)=>{
    try{
       const _id =req.params.id 
       if(!mongoose.Types.ObjectId.isValid(_id)){
         return res.status(400).json({message:"Invalid address Id"})
     }

         const alldata =await Cart.findOne({_id})
          .populate({
            path:'userId',
            select:'phone -_id'
          })
          .populate({
            path:'cartItems.productId',
            select:"name color brand size -_id",
            populate:{
              path:'brand',
              select:'name -_id'
            }
          })

          if(!alldata){
              return res.status(401).send({
              success:false,
              message:"not item will available in cart  "
            })
          }
         
        
            return res.status(200).json({
            success:true,
            message:"Here is your all data",
            total:alldata.length,
            alldata 

        }) 

           }catch(error){
            return res.status(500).send({
            success:false,
            message:"Error in getting the cart"
         })

    }
}
//delete from cart 

const deleteFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).send({
        success: false,
        message: `Invalid product Id: ${productId}`
      });
    }

    // Find the user's cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).send({
        success: false,
        message: "Cart not found"
      });
    }

    // Find the product index in the cart
    const itemIndex = cart.cartItems.findIndex(item => 
      item.productId.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).send({
        success: false,
        message: `Product not found in cart: ${productId}`
      });
    }

    // Decrease the quantity or remove the product if quantity is 1
    if (cart.cartItems[itemIndex].quantity > 1) {
      cart.cartItems[itemIndex].quantity -= 1;
    } else {
      cart.cartItems.splice(itemIndex, 1);
    }

    // Calculate the total price of the cart
    let totalPrice = 0;
    for (const item of cart.cartItems) {
      const product = await Product.findById(item.productId);
      totalPrice += product.basePrice * item.quantity;
    }
    cart.totalPrice = totalPrice;

    // Save the updated cart
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item quantity decreased in cart",
      cart
    });

  } catch (error) {
    console.error("Error in removing from the cart:", error);
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};


const updateItemQuantity = async (req, res) => {
  try {
      const userId = req.userId;
      const { productId, action } = req.body;
      if(!mongoose.Types.ObjectId.isValid(itemId)){
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
          cart.items[itemIndex].quantity += 1;
      } else if (action === 'decrement') {
          cart.items[itemIndex].quantity = Math.max(0, cart.items[itemIndex].quantity - 1);
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

module.exports ={addToCart,getcart,deleteFromCart,updateItemQuantity}