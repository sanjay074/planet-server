const fs = require("fs");
const mongoose = require("mongoose");
const Brand = require("../models/Brand");
const {
  uploadOnCloudinary,
  deleteFromCloudinary,
  getCloudinaryPublicId,
} = require("../utils/cloudinary");
const { brandValidationSchema } = require("../validations/validation");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

async function createBrand(req, res) {
  try {
    const { error } = brandValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check for the file
    if (!req.file) {
      return res.status(400).json({ error: "File not uploaded" });
    }

    const uploadResult = await uploadOnCloudinary(req.file.path);
    if (!uploadResult) {
      return res.status(404).json({ error: "Failed to upload image" });
    }

    //check if the brand name already exists

    const existBrand = await Brand.findOne({ name: req.body.name });
    if (existBrand) {
      return res
        .status(422)
        .json({ success: false, message: "Brand name already exists" });
    }

    // Create a new Brand instance and save it
    const newBrand = new Brand({
      name: req.body.name,
      pic: uploadResult.secure_url,
    });
    const savedBrand = await newBrand.save();

    return res
      .status(200)
      .json({ message: "New Brand Created Successfully", record: savedBrand });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getAllBrand(req, res) {
  try {
    const response = await Brand.find({});
    res.status(200).json({
      message: "record fetched successfully",
      count: response.length,
      record: response,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getSingleBrand(req, res) {
  try {
    const brandId = req.params._id;
    if (!isValidObjectId(brandId)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid brand ID format. Please provide a valid MongoDB ObjectId.",
      });
    }
    const response = await Brand.findById(brandId);
    if (!response) {
      return res.status(404).json({ message: "brand not found" });
    }
    return res.status(200).json({
      message: "single record fetched successfully",
      record: response,
    });
  } catch (error) {
    console.log(error, "error");
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

const updateBrand = async (req, res) => {
  try {
    const { error } = brandValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { _id } = req.params;
    if (!isValidObjectId(_id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid brand ID format. Please provide a valid MongoDB ObjectId.",
      });
    }
    const { name } = req.body;
    const file = req.file;

    const brand = await Brand.findById(_id);
    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }
    // Check for duplicate brand name
    const existingBrand = await Brand.findOne({ name });
    if (existingBrand && existingBrand._id.toString() !== _id) {
      return res.status(422).json({ error: "Brand name already exists" });
    }

    const updatedFields = { name };

    if (file) {
      // Extracting the public ID from the Cloudinary URL of the old image and deleting it
      const publicId = getCloudinaryPublicId(brand.pic);
      await deleteFromCloudinary(publicId);

      // Upload the new image to Cloudinary
      const uploadResult = await uploadOnCloudinary(file.path);
      if (!uploadResult) {
        return res.status(500).json({ error: "Failed to upload new image" });
      }
      updatedFields.pic = uploadResult.secure_url;
    }

    const updatedBrand = await Brand.findByIdAndUpdate(_id, updatedFields, {
      new: true,
      runValidators: true,
    });

    res
      .status(200)
      .json({ message: "Brand Updated Successfully", record: updatedBrand });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function deleteBrand(req, res) {
  try {
    const brandId = req.params._id;
    if (!isValidObjectId(brandId)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid brand ID format. Please provide a valid MongoDB ObjectId.",
      });
    }
    const brand = await Brand.findById(brandId);
    console.log(brand);

    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    // Extracting the public ID from the Cloudinary URL
    const publicId = getCloudinaryPublicId(brand.pic);

    // Delete the image from Cloudinary
    await deleteFromCloudinary(publicId);

    await Brand.findByIdAndDelete(brandId);

    res.status(200).json({ message: "Brand deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createBrand,
  getAllBrand,
  getSingleBrand,
  updateBrand,
  deleteBrand,
};
