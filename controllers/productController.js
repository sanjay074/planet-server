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
      const isClothingCategory = ["shirt", "tshirt", "jeans"].includes(subCategoryName);

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
      limit = 10,
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
    const productId = req.params._id;
    if (!isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is Invalid " });
    }
    const updatedFields = req.body;

    // Validate the updated fields
    const { error, value } = productValidationSchema.validate(updatedFields, {
      abortEarly: false,
    });
    if (error) {
      return res
        .status(400)
        .json({ error: error.details.map((err) => err.message) });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
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
      { ...value, images: updatedImages },
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
    const getAllData =await Product.find({})
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

module.exports = {
  createProduct,
  getAllProduct,
  getProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
