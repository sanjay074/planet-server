const express = require("express");
const subCategoryRouter = express.Router();

const {
  createSubCategory,
  getAllSubCategory,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
} = require("../controllers/subCategoryController");

subCategoryRouter
  .post("/", createSubCategory)
  .get("/", getAllSubCategory)
  .get("/:_id", getSubCategoryById)
  .put("/:_id", updateSubCategory)
  .delete("/:_id", deleteSubCategory);

module.exports = subCategoryRouter;
