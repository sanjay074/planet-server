const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("file is uploaded successfully", response);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};


const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    console.log("file deleted successfully from Cloudinary");
  } catch (error) {
    console.error("error deleting file from Cloudinary", error);
  }
};

const getCloudinaryPublicId = (url) => {
  const parts = url.split("/");
  const lastPart = parts[parts.length - 1];
  const publicId = lastPart.split(".")[0];
  return publicId;
};

const uploadMultipleImagesOnCloudinary = async (localFilePaths) => {
  try {
    if (!localFilePaths || !Array.isArray(localFilePaths)) return [];

    const uploadPromises = localFilePaths.map((filePath) =>
      cloudinary.uploader.upload(filePath, { resource_type: "auto" })
    );

    const responses = await Promise.all(uploadPromises);

    // Clean up local files
    
    localFilePaths.forEach((filePath) => {
      try {
        fs.unlinkSync(filePath);
       
      } catch (err) {
        console.error("Error deleting local file", err);
      }
    });

    
    return responses;
  } catch (error) {
    console.error("Error uploading files", error);

    // Clean up local files in case of an error
    localFilePaths.forEach((filePath) => {
      try {
        fs.unlinkSync(filePath);
        
      } catch (err) {
        console.error("Error deleting local file", err);
      }
    });

    return [];
  }
};

const getCloudinaryPublicIds = (urls) => {
  const publicIds = urls.map((url) => {
    const parts = url.split("/");
    const lastPart = parts[parts.length - 1];
    return lastPart.split(".")[0];
  });
  return publicIds;
};

const deleteMultipleImageFromCloudinary = async (publicIds) => {
  try {
    const deletePromises = publicIds.map((publicId) =>
      cloudinary.uploader.destroy(publicId, { resource_type: "image" })
    );
    const deleteResults = await Promise.all(deletePromises);
    
  } catch (error) {
    console.error("Error deleting files from Cloudinary", error);
    throw error; // Propagate the error back to handle it appropriately in the calling function
  }
};

module.exports = {
  uploadOnCloudinary,
  deleteFromCloudinary,
  getCloudinaryPublicId,
  uploadMultipleImagesOnCloudinary,
  deleteMultipleImageFromCloudinary,
  getCloudinaryPublicIds,
};
