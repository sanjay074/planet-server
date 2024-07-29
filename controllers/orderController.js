const  mongoose = require("mongoose")
const  Order = require("../models/Order")
const  Cart = require("../models/Cart")
const Address = require("../models/address")
const Product = require("../models/Product")

const createOrder = async(req,res)=>{
    try{
        const userId = req.userId
        const {addressId,products,addfromCart} = req.body
        //validate addressId
       if(!mongoose.Types.ObjectId.isValid(addressId)){
            return res.status(400).send({
            success:false,
            message:"address id not valid"
        })
       }
       //address extract
       const address = await Address.findById(addressId)
       if(!address){
               return res.status(401).send({
                success:false,
                message:"Address is not found"
             })
       }
       let orderItems=[];
       let totalPrice=0;
        
       if(Array.isArray(products) && products.length > 0){
        
        //process provided product
        for(const productData of products){
              const {productId,quantity} = productData
              if(!mongoose.Types.ObjectId.isValid(productId)){
                    return res.status(400).send({
                    success:false,
                    message:"product id is not valid "
                })
              }
        
              const product = await Product.findById(productId) 
             if(!product){
                    return res.status(400).send({
                    success:false,
                    message:"Product is not available"
                })
             }
             if(product.quantity < quantity){
                    return res.status(401).send({
                    success:false,
                    message:"Stock not avialable"
                })
             } 
             //total price
             totalPrice += product.basePrice*quantity
             orderItems.push({productId,quantity})
            }}

            //addfrom cart
            if(addfromCart){
                //add item to the cart 
                let cart =await Cart.findOne({userId})
                                    .populate("cartItems.productId")
               if(cart && cart.cartItems.length > 0){
                   for(const item of cart.cartItems){

                    const product  = item.productId;
                    const quantity = item.quantity;

                    //stock less then your quantity
                    if(product.quantity <quantity){
                            return res.status(401).send({
                            success:false,
                            message:"Stock not avialable"
                        })
                     }
                    //total Price  
                     totalPrice += product.basePrice * quantity;
                     orderItems.push({ productId: product._id, quantity });
                   } 
               }
            }
            if(orderItems.length === 0){
                return res.status(400).send({
                    success:false,
                    message:"your cart is empty"
                })
            }

            const order = new Order({
                userId,
                orderItems,
                address:addressId,
                totalPrice
            })
            await order.save()

            //reduce the stock of ordered product
            for(const item of orderItems){
                await Product.findByIdAndUpdate(item.productId,{
                    $inc:{quantity: -item.quantity}
                })
            }

            //clear the cart
            if(addfromCart){
                await Cart.findByIdAndUpdate({userId},
                    {
                    cartItems:[],
                    totalPrice:0
                })
            }
            //return repsonse
                return res.status(200).json({
                success:true,
                message:"Order placed successfully",
                
            })


    }catch(error){
            return res.status(500).json({
            success:false,
            message:"error in creating the order",
            error
        })

    }
}
//getallorder

const getAllOrder = async(req,res)=>{
    try{
        const getAllData =await Order.find({})
        
        return res.status(200).json({
            success:true,
            message:"Here is your all order",
            total:getAllData.length,
            getAllData
        })
       }catch(error){
            return res.status(500).json({
            success:false,
            message:"error in creating the order"
        })

    }
}
const getmyOrder =async(req,res)=>{
    try{
        const userId =req.userId
        //fetch data from the database
        const orders =await Order.find({userId})
                           .populate('orderItems.productId')
                           .populate({
                            path:'orderItems.productId',
                            select:"name color brand size -_id"})
         
        if(!orders.length){
            return res.status(400).send({
                success:false,
                message:"No order is given by the user"
            })
        }     
        //return response
        return res.status(200).send({
            success:true,
            message:"here is your all order",
            total:orders.length,
            orders
        })              
    }catch(error){
            return res.status(500).json({
            success:false,
            message:"error in creating the order"
        })
    }
}
module.exports = {createOrder,getAllOrder,getmyOrder}

