const Category = require("../models/Category");
const { categoryValidationSchema } = require("../validations/validation");
const mongoose = require("mongoose");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

async function createCategory(req, res) {
  try {
    const data = req.body;
    const { error } = categoryValidationSchema.validate(data);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
    }
    const existCategory = await Category.findOne({ name: req.body.name });
    if (existCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Category name already exists" });
    }
    const newCategory = await new Category(data);
    const response = await newCategory.save();
    res.status(201).json({
      success: true,
      message: "category created successfully",
      record: response,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

async function getAllCategory(req, res) {
  try {
    const response = await Category.find({});
    res.status(200).json({
      success: true,
      message: "fetched record successfully",
      count: response.length,
      record: response,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

async function getCategoryById(req, res) {
  try {
    const categoryId = req.params._id;
    if (!isValidObjectId(categoryId)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Category ID format. Please provide a valid MongoDB ObjectId.",
      });
    }
    const response = await Category.findById(categoryId);
    if (!response) {
      res.status(404).json({ message: "category not found" });
    }
    res.status(200).json({
      success: true,
      message: "fetched single record successfully",
      record: response,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function updateCategory(req, res) {
  try {
    const categoryId = req.params._id;
    if (!isValidObjectId(categoryId)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid brand ID format. Please provide a valid MongoDB ObjectId.",
      });
    }
    const categoryData = req.body;
    const { error } = categoryValidationSchema.validate(categoryData);

    if (error) {
      res.status(400).json({ message: error.details[0].message });
    }

    // Check if the category name already exists
    const existingCategory = await Category.findOne({
      name: categoryData.name,
    });
    if (existingCategory && existingCategory._id.toString() !== categoryId) {
      return res.status(422).json({ message: "Category name already exists" });
    }

    const response = await Category.findByIdAndUpdate(
      categoryId,
      categoryData,
      { new: true, runValidators: true }
    );
    if (!response) {
      res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({
      success: true,
      message: "Updated category successfully",
      record: response,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

async function deleteCategory(req, res) {
  try {
    const categoryId = req.params._id;
    if (!isValidObjectId(categoryId)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid brand ID format. Please provide a valid MongoDB ObjectId.",
      });
    }
    const response = await Category.findByIdAndDelete(categoryId);
    if (!response) {
      res.status(404).json({ message: "Category not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

module.exports = {
  createCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
