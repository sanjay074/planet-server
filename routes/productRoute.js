const express = require("express");
const productRouter = express.Router();

const {
  createProduct,
  // getAllProduct,
  getProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getAllProduct,
  getProductviaSubcategory,
  getMensNewArrival,
  getWomenNewArrival,
} = require("../controllers/productController");
const { uploadProduct } = require("../middleware/fileUpload");
const { authMiddleware, isAdminMd } = require("../middleware/authMiddle");

productRouter.post("/",authMiddleware,isAdminMd,uploadProduct.array("images"), createProduct);
productRouter.get("/getAll", getAllProduct);
productRouter.get("/dress",getProductviaSubcategory);
productRouter.get("/mensArrival",getMensNewArrival);
productRouter.get("/womenArrival",getWomenNewArrival);
productRouter.get("/getWomenNewArrival", getProduct);
productRouter.get("/:_id", getSingleProduct);
productRouter.put("/:_id",authMiddleware,isAdminMd,uploadProduct.array("images"), updateProduct);
productRouter.delete("/:_id",authMiddleware,isAdminMd ,uploadProduct.array("images"), deleteProduct);


module.exports = productRouter;
