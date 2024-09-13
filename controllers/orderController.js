const mongoose = require("mongoose");
const Order = require("../models/Order");
const Address = require("../models/userAddress");
const Product = require("../models/Product");
const { JoiOrderSchema } = require("../validations/validation");

const generateOrderId = () => {
  const prefix = 'OD';
  const timestamp = Date.now().toString();
  const uniquePart = Math.floor(100000 + Math.random() * 900000).toString(); 
  return prefix + timestamp.slice(-6) + uniquePart; 
};

const createOrder = async (req, res) => {
  try {
    const { error } = JoiOrderSchema.validate(req.body);
    if (error) {
      return res.status(400).send({
        success: false,
        message: error.details[0].message
      });
    }

    const userId = req.userId;
    const { addressId, products, size } = req.body;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).send({
        success: false,
        message: "Address ID is not valid"
      });
    }

    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(401).send({
        success: false,
        message: "Address not found"
      });
    }

    let orderItems = [];
    let totalPrice = 0;

    if (Array.isArray(products) && products.length > 0) {
      for (const productData of products) {
        const { productId, quantity, size } = productData;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
          return res.status(400).send({
            success: false,
            message: "Product ID is not valid"
          });
        }

        const product = await Product.findById(productId);
        if (!product) {
          return res.status(400).send({
            success: false,
            message: "Product not available"
          });
        }
        if (product.quantity < quantity) {
          return res.status(401).send({
            success: false,
            message: "Stock not available"
          });
        }

        totalPrice += product.finalPrice * quantity;
        orderItems.push({ productId, quantity, size });
      }
    }

    const getorderId = generateOrderId();

    const order = new Order({
      userId,
      orderItems,
      address: addressId,
      totalPrice,
      orderId: getorderId, 
    });
    await order.save();

    // Update the product quantities
    for (const item of orderItems) { 
       await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: -item.quantity }
      });
    }
    

    return res.status(200).json({
      success: true,
      message: "Order placed successfully",
      orderId:getorderId,
      amount:totalPrice
    });
  } catch (error) {
      return res.status(500).json({
      success: false,
      message: "Error in creating the order",
      error: error.message
    });
  }
};


const getAllOrder = async (req, res) => {
  try {

    const getAllData = await Order.find({})
         .populate({
          path:"orderItems.productId",
          select:'name images  -_id'
         })
         .populate({
          path:"address",
          select:"name mobile email Pincode Landmark district state   -_id"

         })

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
  //  console.log("userid ",userId);
    const orders = await Order.find({ userId })
      .populate('orderItems.productId')
      .populate({
        path: 'orderItems.productId',
        select: "name color brand  images -_id"
      });
     

    if (orders.length == 0) {
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



//update from cart

const updateOrder = async (req, res) => {
  try {
    const id = req.params.id;
   
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    const data = await Order.findByIdAndUpdate(id, { status }, { new: true });
    //update the out of stock
    const payMethod =data.paymentMethod;
    const myData=data.status;          
            
    if(payMethod === "cod" && myData === "delivered"){  
       const abc = data.orderItems.map((id)=> id.productId.toString());
       const updateOrder = await Product.find({_id:{$in:abc}});
       const paymentStatus =await Order.findByIdAndUpdate(id,{paymentStatus:'Completed'},{new:true});
       const myUpdatedData=await  Product.updateMany({_id:{$in:abc},quantity:0},{$set:{stock:false}});

       return res.status(200).send({
        success: true,
        message: "Order updated successfully  also update your stock",
        paymentStatus
       })  
      }

    if (!data) {
      return res.status(400).send({
        success: false,
        message: "Order not found"
      });
    }

    return res.status(200).send({
      success: true,
      message: "Order updated successfully",
      payMethod,
      myData
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      message: "error in updating the order",
      error: error.message
    });
  }
};

//new order controller 
const newOrder = async(req,res)=>{
  try{
    const recentOrder = await Order.find({}).populate({
      path:"orderItems.productId",
      select:'name images  -_id'
     })
     .populate({
      path:"address",
      select:"name mobile email Pincode Landmark district state   -_id"
     })
    .sort({createdAt:-1})
    return res.status(200).send({
      success:true,
      message:"here is your all recent data",
      totalOrder:recentOrder.length,
      recentOrder
    })

  }catch(error){
    return res.status(500).send({
      success:false,
      message:"error in finding the recent order "
    })
  }
}

//get recent order 

const  getRecentOrder = async(req,res)=>{
  try{
    //same day ka data chahiye bs jisko date.now()se match kara ka dena hai
    const todayDate = new Date()
    const startDay =new Date(todayDate.setHours(0,0,0))
    const EndofDay =new Date(todayDate.setHours(23,59,59,999))

    const myData =await Order.find({
      createdAt:{
        $gte:startDay,
        $lte:EndofDay
      }
    }).populate({
      path:"orderItems.productId",
      select:'name images  -_id'
     })
     .populate({
      path:"address",
      select:"name mobile email Pincode Landmark district state   -_id"

     })
  
    if(!myData){
      return res.status(500).send({
        success:false,
        message:"No order avialable for today"
      })
    }
    return res.status(200).send({
      success:true,
      message:"your all data run successfully",
      TotalTodayOrder:myData.length,
      myData
    }) 
  }catch(error){
    return res.status(500).send({
      success:false,
      message:"error in getting the recent order",
      error:error.message
    })
  }
}

const deleteSingleOrder =async(req,res)=>{
  try{
    const id =req.params._id;

    if(!mongoose.Types.ObjectId.isValid(id)){
      return res.status(400).send({
        success:false,
        message:"this id is not valid"
      })
    }
    const deleteItem = await Order.findByIdAndDelete(id)
    
    return  res.status(200).send({
      success:true,
      message:"order Deleted successfully"
    })

  }catch(error){
      return res.status(400).send({
      success:false,
      message:"error  in deleting order",
      error:error.message

    })
  }
}

const getUserSingleOrder =async(req,res)=>{
  try{
    const  id = req.params._id
    if(!mongoose.Types.ObjectId.isValid(id)){
      return res.status(400).send({
        success:false,
        message:"this id is not valid"
      })
    }

  let getsingleData = await Order.findById(id)
   .populate({
    path:"orderItems.productId",
    select:'name images  -_id'
   })
   .populate({
    path:"address",
    select:"name mobile email Pincode Landmark district state   -_id"
   })

    return res.status(200).send({
     success:true,
     message:"your data is getting successfully",
     getsingleData
   })
  }catch(error){
    return res.status(400).send({
      success:false,
      message:"error  in geting the order",
      error:error.message
  })
}
}

module.exports = {
    createOrder,
    getAllOrder,
    getmyOrder, 
    updateOrder,
    newOrder,
   getRecentOrder,
   deleteSingleOrder,
   getUserSingleOrder
  };
