const multer = require("multer");

function fileUpload(folderName) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `public/${folderName}`);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname);
    },
  });
  return multer({ storage: storage });
}
const uploadBrand = fileUpload("brand");
const uploadProduct = fileUpload("product");
const uploadUser = fileUpload("user");
const uploadTestimonial = fileUpload("testimonial");
const uploadPayment = fileUpload("payment");

module.exports = {
  uploadBrand: uploadBrand,
  uploadProduct: uploadProduct,
  uploadUser: uploadUser,
  uploadTestimonial: uploadTestimonial,
  uploadPayment:uploadPayment,
};
