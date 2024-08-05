const Product = require("../models/Product");
const Brand  =require("../models/Brand");
const searchController = async (req, res) => {
  try {
    const { query } = req.body;

    // Check if query is provided
    if (!query) {
      return res.status(400).send({
        success: false,
        message: "Please provide a search query.",
      });
    }
    //search with the matching the brand 
    const matchingBrand = await Brand.find({name:query}).select('_id');
    // Search the product database based on the query
    const SearchProduct = await Product.find({
      $or: [
        {name:{$regex:query,$options:"i"}},
        {description:{$regex:query,$options:"i"}},
        {brand:{ $in:matchingBrand.map(brand => brand._id)
        }}
      ],
    })
    .populate('brand','name')
    .lean()

    // Check if no results were found
    if (SearchProduct.length === 0) {
        return res.status(404).send({
        success: false,
        message: "No results found for this search",
      });
    }

    // Return the search results
    return res.status(200).send({
      success: true,
      message: "Search results found.",
      totalresult:SearchProduct.length,
      products: SearchProduct,
    });
  } catch (error) {
    // Handle any errors that occur during the search
    return res.status(500).send({
      success: false,
      message: "Error occurred in searchController.",
      error: error.message,
    });
  }
};
//get latest product

const latestProductController = async(req,res)=>{
    try{
        const myProduct = await Product.find({}).sort({createdAt:-1})
        //return response 
            return res.status(200).send({
            success:true,
            message:"here is your all data",
            total:myProduct.length,
            myProduct
        })
    }catch(error){
            return res.status(500).send({
            success:false,
            message:"error in getting the latest product",
            error:error.message
        })

    }
}

module.exports = { searchController,latestProductController};
