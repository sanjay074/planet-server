const SubCategory = require("../models/SubCategory");
const { subCategoryValidationSchema } = require("../validations/validation");
const mongoose = require("mongoose");
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

async function createSubCategory(req, res) {
  try {
    const data = req.body;
    const { error } = subCategoryValidationSchema.validate(data);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
    }
    //check if the brand name already exists
    const existingSubCategory = await SubCategory.findOne({ name: data.name });
    if (existingSubCategory) {
      return res
        .status(400)
        .json({ success: false, message: "SubCategory name already exists" });
    }
    const newSubCategory = await new SubCategory(data);
    const response = await newSubCategory.save();
    res.status(201).json({
      success: true,
      message: "subCategory Created Successfully",
      record: response,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}




async function getAllSubCategory(req, res) {
  try {
    const response = await SubCategory.find({}).populate("category");
    res.status(200).json({
      success: true,
      message: "record fetched successfully",
      count: response.length,
      record: response,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}


async function getSubCategoryById(req, res) {
  try {
    const subCatId = req.params._id;
    if (!isValidObjectId(subCatId)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Category ID format. Please provide a valid MongoDB ObjectId.",
      });
    }

    const response = await SubCategory.findById(subCatId);
    if (!response) {
      return res.status(404).json({ message: "subCategory not found" });
    }
    res.status(200).json({
      success: true,
      message: "single record fetched successfully",
      record: response,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function updateSubCategory(req, res) {
  try {
    const subCatId = req.params._id;
    if (!isValidObjectId(subCatId)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Category ID format. Please provide a valid MongoDB ObjectId.",
      });
    }

    const subCatData = req.body;
    const { error } = subCategoryValidationSchema.validate(subCatData);

    if (error) {
      res.status(400).json({ message: error.details[0].message });
    }

    // Check if the subCategory name already exists
    const existingCategory = await SubCategory.findOne({
      name: subCatData.name,
    });
    if (existingCategory && existingCategory._id.toString() !== categoryId) {
      return res.status(422).json({ message: "Category name already exists" });
    }

    const response = await SubCategory.findByIdAndUpdate(subCatId, subCatData, {
      new: true,
      runValidators: true,
    });
    if (!response) {
      res.status(404).json({ message: "subCategory not found" });
    }
    res.status(200).json({
      success: true,
      message: "record updated successfully",
      record: response,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(422).json({ message: "Category name already exists" });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

async function deleteSubCategory(req, res) {
  try {
    const subCatId = req.params._id;
    if (!isValidObjectId(subCatId)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Category ID format. Please provide a valid MongoDB ObjectId.",
      });
    }
    const response = await SubCategory.findByIdAndDelete(subCatId);
    if (!response) {
      res.status(404).json({ message: "subCategory not found" });
    }
    res.status(200).json({ success: true, message: "SubCategory deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}


async function getSubCategoryWithCategory(req,res){
try { 

  const id = req.params.id
  if(!mongoose.Types.ObjectId.isValid(id)){
    res.status(400).send({
      success:false,
      message:"this id is not valid "
    })
  }

  const getAllSub = await  SubCategory.find({category:id});

  return res.status(200).send({
      success:true,
      message:"here is your all data",
      total:getAllSub.length,
      data:getAllSub
  })

  }catch(error){
    return res.status(500).send({
    success:false,
    message:"error in getting subCat by cat ",
    error:error.message
   })
}
}



module.exports = {
  createSubCategory,
  getAllSubCategory,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  getSubCategoryWithCategory
};
