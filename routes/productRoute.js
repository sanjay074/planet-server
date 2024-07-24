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

productRouter
  .post("/", uploadProduct.array("images"), createProduct)
  // .get("/", getAllProduct)
  .get("/", getProduct)
  .get("/:_id", getSingleProduct)
  .put("/:_id", uploadProduct.array("images"), updateProduct)
  .delete("/:_id", uploadProduct.array("images"), deleteProduct);

module.exports = productRouter;
