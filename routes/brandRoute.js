const express = require("express");
const brandRouter = express.Router();

const {
  createBrand,
  getAllBrand,
  getSingleBrand,
  updateBrand,
  deleteBrand,
} = require("../controllers/brandController");

const { uploadBrand } = require("../middleware/fileUpload");
const { authMiddleware, isAdminMd } = require("../middleware/authMiddle");

brandRouter
  .post("/",authMiddleware,isAdminMd,uploadBrand.single("pic"), createBrand)
  .get("/",  getAllBrand)
  .get("/:_id",getSingleBrand)
  .put("/:_id",authMiddleware,isAdminMd,uploadBrand.single("pic"),updateBrand)
  .delete("/:_id",authMiddleware,isAdminMd,uploadBrand.single("pic"),deleteBrand);


module.exports = brandRouter;
