const express =require("express");
const { authMiddleware, isAdminMd } = require("../middleware/authMiddle");
const { uploadOffer } = require("../middleware/fileUpload");
const { createOffer, getalloffer, deleteoffer, getSingleOffer, updateOffer } = require("../controllers/offerController");
const offerRoute = express.Router();

offerRoute
  .post("/createOffer",authMiddleware,isAdminMd,uploadOffer.single("offerImage"),createOffer)
  .get("/getalloffer",getalloffer)
  .delete("/deleteoffer/:id",authMiddleware,isAdminMd,uploadOffer.single("offerImage"),deleteoffer)
  .get("/getSingleOffer/:id",getSingleOffer)
  .put("/updateoffer/:id",authMiddleware,isAdminMd,uploadOffer.single("offerImage"),updateOffer)

  module.exports = offerRoute