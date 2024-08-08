const express = require("express");
const productRouter = express.Router();

const {
  createProduct,
  // getAllProduct,
  getProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { uploadProduct } = require("../middleware/fileUpload");
const { authMiddleware, isAdminMd } = require("../middleware/authMiddle");

productRouter
  .post("/",authMiddleware,isAdminMd,uploadProduct.array("images"), createProduct)
  // .get("/", getAllProduct)
  .get("/", getProduct)
  .get("/:_id", getSingleProduct)
  .put("/:_id",authMiddleware,isAdminMd,uploadProduct.array("images"), updateProduct)
  .delete("/:_id",authMiddleware,isAdminMd ,uploadProduct.array("images"), deleteProduct);

module.exports = productRouter;
