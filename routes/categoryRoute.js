const express = require("express");
const categoryRouter = express.Router();

const {
  createCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

categoryRouter
  .post("/", createCategory)
  .get("/", getAllCategory)
  .get("/:_id", getCategoryById)
  .put("/:_id", updateCategory)
  .delete("/:_id", deleteCategory);

module.exports = categoryRouter;
