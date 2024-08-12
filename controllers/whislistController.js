const mongoose = require("mongoose");
const Product = require("../models/Product");
const Whislist = require("../models/whislist");

const addTowhislist = async (req, res) => {
  try {
    const userId =req.userId;
    const productToadded =req.body.Products;

    if(!Array.isArray(productToadded) || productToadded.length === 0){
      return res.status(400).send({
        succes:false,
        message:"Products array is not available"

      })
    }
    //whislist cart creation 
    let mywhislist =await Whislist.findOne({userId})

    if(!mywhislist){
      mywhislist = new Whislist ({userId,whislistItems:[]})
    }

    for(const productData of productToadded){
      const {productId} = productData;
      if(!mongoose.Types.ObjectId.isValid(productId)){
        return res.status(400).send({
          succes:false,
          message:"this id is not valid"
        })
      }
      const product =await Product.findById(productId)
      if(!product){
        return res.status(400).send({
          success:false,
          message:"Product is not avalailable"
        })
      }
      
          // Check if the product is already in the cart
          const itemIndex = mywhislist.whislistItems.findIndex(
            (item) => item.productId.toString() === productId
        );

        if (itemIndex > -1) {
            return res.status(400).send({
                success: false,
                message: `Product already added to cart: ${productId}`,
            });
        } else {

            mywhislist.whislistItems.push({productId});
        }
    }

    await mywhislist.save()


      return res.status(200).json({
      success: true,
      message: "Your wishlist  created successfully",
    });

  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in adding to the wishlist",
      error: error.message,
    });
  }
};
//get whislist
const getWhishList = async (req, res) => {
  try {
      const userId = req.userId
  
      if(!mongoose.Types.ObjectId.isValid(userId)){
         return res.status(400).send({
         success:false,
         message:"user id invalid"
    })
  }

  if(!userId){
      return res.status(400).send({
      success:false,
      message:"user id is not available"
    })
  } 
  const myWhilist = await Whislist.findOne({userId}).populate('whislistItems.productId','name description finalPrice basePrice images size discountPrice')
    if(!myWhilist){
    return res.status(400).send({
      success:false,
      message:"No whislist cart is found"
    })
    }
    return res.status(200).send({
      success:true,
      message:"here is your all data",
      myWhilist
    })
    
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
    
    //id from params
    const cartId = req.params.id

    //validate cart id 
    if(!mongoose.Types.ObjectId.isValid(cartId)){
      return res.status(400).send({
        success:false,
        message:`invalid cartId`,
      })
    }
   
   //delete the cart     
    const deleteCart = await Whislist.findByIdAndDelete(cartId)
    //validation
    if(!deleteCart){
        return res.status(400).send({
        succes:false,
        message:"no cart available"
      })
    }
    
    return res.status(200).send({
      succes:true,
      message:"whislist cart deleted successfully"
    })
   
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in deleting the wishlist",
      error: error.message,
    });
  }
};

const deleteSingleItemWhislist = async(req,res)=>{
 try{
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
  
  let myWhilist = await Whislist.findOne({ userId });
  if (!myWhilist) {
    return res.status(404).send({
      success: false,
      message: "Whislist not found"
    });
  }

  // Find the product index in the cart
  const itemIndex = myWhilist.whislistItems.findIndex(item => 
    item.productId.toString() === productId);
  if (itemIndex === -1) {
    return res.status(404).send({
      success: false,
      message: `Product not found in whislist cart: ${productId}`
    });
  }

  // Decrease the quantity or remove the product if quantity is 1
  if (myWhilist.whislistItems[itemIndex].quantity > 1) {
     myWhilist.whislistItems[itemIndex].quantity -= 1;
  } else {
    myWhilist.whislistItems.splice(itemIndex, 1);
  }

    await  myWhilist.save()
    return res.status(200).send({
    success:true,
    message:"product   Deleted successfully from whislist"
  })

 }catch(error){
  return res.status(400).send({
    succes:false,
    message:"your single item deleted successfully"
  })
 }


}
module.exports = { addTowhislist, getWhishList, deleteWhislist,deleteSingleItemWhislist };
