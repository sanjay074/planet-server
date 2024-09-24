const Brand = require("../models/Brand");
const Category = require("../models/Category");
const Product = require("../models/Product");
const SubCategory = require("../models/SubCategory");
const {
  uploadMultipleImagesOnCloudinary,
  getCloudinaryPublicIds,
  deleteMultipleImageFromCloudinary,
} = require("../utils/cloudinary");
const { productValidationSchema } = require("../validations/validation");
const mongoose = require("mongoose");

//Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);



const createProduct = async (req, res) => {
  try {
    
    const { error, value } = productValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    
    const { category, subCategory, brand, footSize, size, basePrice, finalPrice, numSize } = value;
    if (!isValidObjectId(category) || !isValidObjectId(subCategory) || !isValidObjectId(brand)) {
      return res.status(400).json({ error: "Invalid category, subcategory, or brand ID" });
    }

    
    const discount = basePrice - finalPrice;
    const discountPrice = ((discount / basePrice) * 100).toFixed();

    
    const categoryData = await Category.findById(category);
    if (!categoryData) {
      return res.status(404).json({ error: "Category not found" });
    }

    const categoryName = categoryData.name.toLowerCase();

    
    if (categoryName === "shoes") {
      if (!footSize) {
        return res.status(400).json({ success: false, message: "Foot size required" });
      }
      if (size || numSize) {
        return res.status(400).json({ success: false, message: "Please empty size or numSize" });
      }
    } else {
      const subCategoryData = await SubCategory.findById(subCategory);
      if (!subCategoryData) {
        return res.status(404).json({ error: "Subcategory not found" });
      }

      const subCategoryName = subCategoryData.name.toLowerCase();
      const isClothingCategory = ["shirt", "tshirt", "jeans","suits","dress"].includes(subCategoryName);

      if (isClothingCategory) {
        if (!size && !numSize) {
          return res.status(400).json({
            success: false,
            message: "Size or NumSize is required for this type of product",
          });
        }

        if (footSize) {
          return res.status(400).json({ success: false, message: "Please empty foot size" });
        }
      }
    }

    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    
    const localFilePaths = req.files.map((file) => file.path);
    const uploadResults = await uploadMultipleImagesOnCloudinary(localFilePaths);

    if (uploadResults.some((result) => !result)) {
      return res.status(500).json({ error: "Failed to upload one or more images" });
    }

    
    const newProduct = new Product({
      ...value,
      discountPrice,
      images: uploadResults.map((result) => result.secure_url),
    });
    const savedProduct = await newProduct.save();

    return res.status(201).json({
      message: "New Product Created Successfully",
      record: savedProduct,
    });

  } catch (error) {
    console.error("Error creating product:", error);

    if (error.code === 11000) {
      return res.status(422).json({ message: "Duplicate entry found" });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const similarProducts = async (req, res) => {
  try {
    const productId = req.params._id;
    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: 0,
        message:
          "Invalid product ID format. Please provide a valid MongoDB ObjectId.",
      });
    }

    // Find the original product
    const product = await Product.findById(productId).populate([
      "category",
      "subCategory",
      "brand",
    ]);

    if (!product) {
      return res.status(400).json({ status: 0, message: "Product not found" });
    }

    // Initialize the query object
    let query = { _id: { $ne: product._id } };

    // Add filters dynamically based on available fields
    if (product.category) query.category = product.category._id;
    if (product.subCategory) query.subCategory = product.subCategory._id;
    if (product.brand) query.brand = product.brand._id;

    // Find similar products based on the available filters
    let similarProducts = await Product.find(query).limit(10);

    // If less than 10 results, fallback to broader queries
    if (similarProducts.length < 10) {
      const remainingLimit = 10 - similarProducts.length;

      // Partial match: category and subCategory (if both exist)
      if (product.category && product.subCategory) {
        const partialSubCategoryMatches = await Product.find({
          category: product.category._id,
          subCategory: product.subCategory._id,
          _id: { $ne: product._id },
          _id: { $nin: similarProducts.map((p) => p._id) },
        }).limit(remainingLimit);

        similarProducts = similarProducts.concat(partialSubCategoryMatches);
      }

      // If still less than 10 results, fallback to just subCategory matches
      if (similarProducts.length < 10 && product.subCategory) {
        const remainingLimit = 10 - similarProducts.length;

        const partialCategoryMatches = await Product.find({
          subCategory: product.subCategory._id,
          _id: { $ne: product._id },
          _id: { $nin: similarProducts.map((p) => p._id) },
        }).limit(remainingLimit);

        similarProducts = similarProducts.concat(partialCategoryMatches);
      }
    }

    return res.json({
      status: 1,
      message: "Get Similar Products by ID",
      similarProducts,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message.toString() });
  }
};



async function getProduct(req, res) {
  try {
    const {
      category,
      subCategory,
      brand,
      size,
      sortBy,
      sortOrder = "asc",
      page = 1,
      limit = 50,
      minPrice,
      maxPrice,
    } = req.query;

    if (isNaN(page) || page <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Page Number" });
    }
    if (isNaN(limit) || limit <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Limit Number" });
    }
    const filter = {};

    const categoriesPromise = category
      ? Category.findOne({ name: category }).exec()
      : null;
    const subCategoryPromise = subCategory
      ? SubCategory.findOne({ name: subCategory }).exec()
      : null;
    const brandPromise = brand ? Brand.findOne({ name: brand }).exec() : null;

    const [categoryDoc, subCategoryDoc, brandDoc] = await Promise.all([
      categoriesPromise,
      subCategoryPromise,
      brandPromise,
    ]);

    if (category && !categoryDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found"});
    }
    if (subCategory && !subCategoryDoc) {
      return res
        .status(404)
        .json({ success: false, message: "SubCategory not found" });
    }
    if (brand && !brandDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Brand not found" });
    }

    if (categoryDoc) filter.category = categoryDoc._id;
    if (subCategoryDoc) filter.subCategory = subCategoryDoc._id;
    if (brandDoc) filter.brand = brandDoc._id;
    if (size) filter.size = size;
    if (minPrice && !isNaN(minPrice))
      filter.finalPrice = { $gte: Number(minPrice) };
    if (maxPrice && !isNaN(maxPrice))
      filter.finalPrice = { ...filter.finalPrice, $lte: Number(maxPrice) };
    
    const sortOptions = {};
    if (sortBy) sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const totalProducts = await Product.countDocuments(filter).exec();

    if (totalProducts === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        status: "Fail",
        message: "No products found in the specified price range",
      });
    }

    const totalPages = Math.ceil(totalProducts / limit);

    if (page > totalPages) {
      return res.status(200).json({
        success: true,
        data: [],
        status: "Fail",
        message: "No Page Found",
        pagination: {
          total: totalProducts,
          page: Number(page),
          limit: Number(limit),
          totalPages: totalPages,
        },
      });
    }

    const products = await Product.find(filter)
      .populate("category", "name")
      .populate("subCategory", "name")
      .populate("brand", "name")
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .exec();

    res.set("X-Total-Count", totalProducts);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total: totalProducts,
        page: Number(page),
        limit: Number(limit),
        skip: (page - 1) * limit,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const productId = req.params._id;
    if (!isValidObjectId(productId)) {
      res
        .status(404)
        .json({ success: false, message: "Product Id is Invalid" });
    }
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
    }
    // Extract public_ids from image URLs
    const publicIds = getCloudinaryPublicIds(product.images);
    //delete images from cloudinary
    await deleteMultipleImageFromCloudinary(publicIds);
    //delete the product from the db
    await Product.findByIdAndDelete(productId);

    return res.status(200).json({ message: "product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getSingleProduct(req, res) {
  try {
    const productId = req.params._id;
    if (!isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is Invalid " });
    }
    const product = await Product.findById(productId)
      .populate({ path: "category", select: "_id name" })
      .populate({ path: "subCategory", select: "_id name" })
      .populate({ path: "brand", select: "_id name" });
    if (!product) {
      res.status(404).json({ message: "Product not found" });
    }
    res
      .status(200)
      .json({ message: "Single Record Fetched Successfully", record: product });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}


async function updateProduct(req, res) {
  try {

    const {
           name,description,category,subCategory,brand,color,size,numSize,footSize,
           quantity,stock,basePrice,finalPrice,active,productDetails
          } = req.body;

    const productId = req.params._id;
    if (!isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is Invalid " });
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }      

           const categoryAvail = await Category.findById(category);
           if(!categoryAvail){
            return res.status(400).send({
              success:true,
              message:"This category is not available"
            })
          }
          const CategoryName =categoryAvail.name.toLowerCase();

          if(CategoryName == "shoes"){
           if(!footSize){
            return res.status(400).send({success:false,message:"please fill the footsize"})
           }
           if(numSize || size){
            return res.status(400).send({success:false,message:"please empty the size or numSize"})
           }
          }

          else{
            const SubCatAvail = await SubCategory.findById(subCategory);
            
             let  SubCatName =SubCatAvail.name.toLowerCase();
          
              if(!SubCatName){
                   return res.status(400).send({success:false,message:"this SubCategory not avialable"})
            }
            const clothCategory =["shirt","tshirt","jeans","dress"].includes(SubCatName);

            if(clothCategory){
              if(!numSize && !size){
                  return res.status(400).send({
                  success:false,
                  message:"please fill the numSize or size"
                })
              }
              if(footSize){
                  return res.status(400).send({
                  success:false,
                  message:"please empty footsize"
                })
              }
            }
          }
       if(finalPrice || basePrice){
          const discount = basePrice - finalPrice;
          var discountPrice = ((discount / basePrice) * 100).toFixed();
       }

    // Handle image updates
    let updatedImages = [];
    if (req.files && req.files.length > 0) {
      // Upload new images to Cloudinary
      const uploadResults = await uploadMultipleImagesOnCloudinary(
        req.files.map((file) => file.path)
      );
      updatedImages = uploadResults.map((result) => result.secure_url);

      // Delete old images from Cloudinary
      const publicIdsToDelete = getCloudinaryPublicIds(product.images);
      await deleteMultipleImageFromCloudinary(publicIdsToDelete);
      console.log("deleted old images from cloudinary");
    }

    // Update product fields
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name,description,category,subCategory,brand,color,size,numSize,footSize,
        quantity,stock,discountPrice,
        basePrice,finalPrice,active,productDetails,
        images: updatedImages },
      { new: true }
    );

    return res.status(200).json({
      message: "Product updated successfully",
      record: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}


async function getAllProduct(req,res){
  try{
     const getAllData =await Product.find({}).populate('category','name _id')
      return res.status(200).send({
      success:true,
      message:"here is your all data",
      data:getAllData.length,
      getAllData
    })
     }catch(error){
       return res.status(500).json({
       message: "Internal Server Error" ,
       error:error.message
      });
  }
}

// async function getProductviaSubcategory(req,res){
//   try{
//     const data = await SubCategory.findById('66d95899d827e97d93b3750d');
//     const newData =data.name;
    
//     const AllDress = await Product.aggregate([
//       {
//         $match:{subCategory:newData}
//       },
//       {
//         $group:{
//          "_id":"$subCategory",
//          "totalProduct":{$sum:1},
//          "Product":{$push:"$$ROOT"}
//       }}
//     ])
// if(AllDress){
//          return res.status(200).send({
//          success:true,
//          message:"here  is your all Data",
//          length:AllDress.length,
//          AllDress,
//         newData 
//       })
     
//     }  

//   }catch(error){
//       return res.status(500).send({
//       success:false,
//       message:"error in getting the product",
//       error:error.message
//     })
//   }
  
//   }

async function getProductviaSubcategory(req, res) {
  try {
  
    // const data = await SubCategory.findById('66d95899d827e97d93b3750d');
    // if (!data) {
    //     return res.status(404).send({
    //     success: false,
    //     message: "Subcategory not found"
    //   });
    // }
//     const subcatId = data._id;
//     const allDress = await Product.aggregate([
//       {
//         $match: { subCategory: subcatId } 
//       },
//       {
//         $group: {
//           _id: "$subCategory",
//           totalProduct: { $sum: 1 },
//           products: { $push: "$$ROOT" }
//         }
//       }
//     ]);

//     if (allDress) {
//         return res.status(200).send({
//         success: true,
//         message: "Here is all your data",
//         allDress
//       });
//     } else {
//       return res.status(404).send({
//         success: false,
//         message: "No products found for this subcategory"
//       });
//     }

//   } catch (error) {
//     return res.status(500).send({
//       success: false,
//       message: "Error in getting the products",
//       error: error.message
//     });
//   }   
// const AllDress =await Product.find({subCategory:'66d95899d827e97d93b3750d'})

   const nameData =await SubCategory.findOne({name :"Dress"});

   const AllDress =await Product.find({subCategory:nameData._id})
   return res.status(200).send({
    success:true,
    message:"here is your all Data",
   length:AllDress.length,
   AllDress
  
   })
  }
  
  catch(error){
    return res.status(400).send({
      success:false,
      message:"error in getting the dress data",
      error:error.message
    })
  }
}

async function getMensNewArrival(req,res){
  try{
   const CategoryName = await Category.findOne({name:'Male'});
   if(CategoryName){
   const  Mensdata = await Product.find({category:CategoryName._id}).sort({createdAt:-1})
    return res.status(200).send({
       success:true,
       message:"here is your all data",
      //  CategoryName
      total:Mensdata.length,
      Mensdata
   })
  }
  }catch(error){
    return res.status(500).send({
    success:false,
    message:"error in getting the mens Arrival data",
    error:error.message
   })
  }
}

async function getWomenNewArrival(req,res){
  try{
    const CategoryName = await Category.findOne({name:'Female'});
    const NewArrival =await Product.find({category:CategoryName._id}).sort({createdAt:-1}).lean().exec()


    return res.status(200).send({
      success:true,
      message:"here is your data",
      total:NewArrival.length,
      NewArrival
    
    })
  }catch(error){
    return res.status(400).send({
      success:false,
      message:"error in getting the women data",
      error:error.message
    })
  }
}

// async function updatenewProduct(req,res){
//   try{
//     const response =await Product.updateMany({quantity:0},{ $set :{stock:false}})
     
//     if(response){
//        var data =await Product.find({stock:false}) 
//       return res.status(200).send({
//         success:true,
//         message:"here is your data",
//         total:data.length,
//         data
//       })
//     }
//   }catch(error){
//     return res.status(400).send({
//       success:false,
//       messag:"error in updating the product",
//       error:error.message

//     })
//   }
// }

async function getoutofStock(req,res){
   try{
    const id =req.params.id;

    const data =await Product.find({stock:id});
    if(data){
      return res.status(200).send({
        success:true,
        message:"Here is your all data",
        total:data.length,
        data
      })
    }
   }catch(error){
    return res.status(500).send({
      success:false,
      message:"error in getting the product",
      error:error.message,
    })
   }
}



module.exports = {
  createProduct,
  getAllProduct,
  getProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getProductviaSubcategory,
  getMensNewArrival,
  getWomenNewArrival,
   similarProducts,
  getoutofStock
};
