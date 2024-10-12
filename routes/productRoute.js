const express = require("express");
const productRouter = express.Router();

const {
  createProduct,
  getProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getAllProduct,
  getProductviaSubcategory,
  getMensNewArrival,
  getWomenNewArrival,
  similarProducts,
  getoutofStock,
  getDiscountedProducts

} = require("../controllers/productController");
const { uploadProduct } = require("../middleware/fileUpload");
const { authMiddleware, isAdminMd } = require("../middleware/authMiddle");

productRouter.post("/",authMiddleware,isAdminMd,uploadProduct.array("images"), createProduct);
productRouter.get("/discounted-products", getDiscountedProducts);
productRouter.get("/getAll", getAllProduct);
productRouter.get("/dress",getProductviaSubcategory);
productRouter.get("/mensArrival",getMensNewArrival);
productRouter.get("/womenArrival",getWomenNewArrival);
productRouter.get("/", getProduct);
productRouter.get("/getOutOfStock/:id",authMiddleware,isAdminMd,getoutofStock)
productRouter.get("/:_id", getSingleProduct);
productRouter.get("/similar/:_id",similarProducts);
productRouter.put("/:_id",authMiddleware,isAdminMd,uploadProduct.array("images"), updateProduct);
productRouter.delete("/:_id",authMiddleware,isAdminMd ,uploadProduct.array("images"), deleteProduct);

module.exports = productRouter;
