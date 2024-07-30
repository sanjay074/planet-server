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

brandRouter
  .post("/", uploadBrand.single("pic"), createBrand)
  .get("/",  getAllBrand)
  .get("/:_id", getSingleBrand)
  .put("/:_id", uploadBrand.single("pic"), updateBrand)
  .delete("/:_id", uploadBrand.single("pic"), deleteBrand);

module.exports = brandRouter;
