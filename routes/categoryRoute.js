const express = require("express");
const categoryRouter = express.Router();

const {
  createCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { authMiddleware, isAdminMd } = require("../middleware/authMiddle");

categoryRouter
  
  .post("/",authMiddleware,isAdminMd,createCategory)
  .get("/", getAllCategory)
  .get("/:_id",getCategoryById)
  .put("/:_id",authMiddleware,isAdminMd,updateCategory)
  .delete("/:_id",authMiddleware,isAdminMd,deleteCategory);


module.exports = categoryRouter;
