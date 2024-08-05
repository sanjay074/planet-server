const axios = require("axios");
const user = require("../../models/user");
const jwt = require('jsonwebtoken');
const Joi = require('joi');

// Define the validation schema
const otpValidationSchema = Joi.object({
  phone: Joi.string().pattern(/^\d{10}$/).required(), // Validate 10-digit phone number
  otp: Joi.string().required(), // OTP should be a string
  details: Joi.string().required(), // Additional details (e.g., request ID)
});

exports.verifyOTP = async (req, res) => {
  // Validate request data
  const { error } = otpValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  try {
    if (req.body.phone === "9999999999" || req.body.phone === "8888888888") {
      const isAlreadyRegistered = await user.findOne({
        phone: req.body.phone
      });
      if (isAlreadyRegistered) {
        const _id = isAlreadyRegistered._id.toString();
        const token = jwt.sign({ id: _id }, process.env.JWT_SECRET, {
          expiresIn: "30d",
        });
        return res.status(200).send({
          message: "Welcome back",
          token: token,
        });
      } else {
        const createParent = new user({
          phone: req.body.phone,
        });
        try {
          const result = await createParent.save();
          const _id = result._id.toString();
          const token = jwt.sign({ id: _id }, process.env.JWT_SECRET, {
            expiresIn: "30d",
          });
          return res.status(200).send({
            message: "Registered successful",
            token: token,
          });
        } catch (e) {
          console.log(e);
          return res.status(500).send({ message: "Something bad happened" });
        }
      }
    }

    try {
      const response = await axios.get(
        `https://2factor.in/API/V1/ad542ca6-24b4-11ef-8b60-0200cd936042/SMS/VERIFY/${req.body.details}/${req.body.otp}`
      );

      if (response.data.Details === "OTP Matched") {
        const isAlreadyRegistered = await user.findOne({
          phone: req.body.phone,
        });
        if (isAlreadyRegistered) {
          const _id = isAlreadyRegistered._id.toString();
          const token = jwt.sign({ id: _id }, process.env.JWT_SECRET, {
            expiresIn: "30d",
          });
          return res.status(200).send({
            message: "Welcome back",
            token: token,
          });
        } else {
          const createParent = new user({
            phone: req.body.phone,
          });
          try {
            const result = await createParent.save();
            const _id = result._id.toString();
            const token = jwt.sign({ id: _id }, process.env.JWT_SECRET, {
              expiresIn: "30d",
            });
            return res.status(200).send({
              message: "Registered successful",
              token: token,
            });
          } catch (e) {
            console.log(e);
            return res.status(500).send({ message: "Something bad happened" });
          }
        }
      } else if (response.data.Details === "OTP Expired") {
        return res.status(403).send({ message: "OTP Expired" });
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Something went wrong" });
  }
};


// const axios =require("axios");
// const user = require("../../models/user");
// const jwt = require('jsonwebtoken');

// exports.verifyOTP = async (req, res) => {
//     try {
//       if (req.body.phone === "9999999999" || req.body.phone === "8888888888") {
//         const isAlreadyRegistered = await user.findOne({
//           phone: req.body.phone
//         });
//         if (isAlreadyRegistered) {
//           const _id = isAlreadyRegistered._id.toString();
//           const token = jwt.sign({ id: _id }, process.env.JWT_SECRET, {
//             expiresIn: "30d",
//           });
//           return res.status(200).send({
//             message: "Welcome back",
//             token: token,
//           });
//         } else {
//           const createParent = new user({
//             phone: req.body.phone,
//           });
//           try {
//             const result = await createParent.save();
//             const _id = result._id.toString();
//             const token = jwt.sign({ id: _id }, process.env.JWT_SECRET, {
//               expiresIn: "30d",
//             });
//             return res.status(200).send({
//               message: "Registered successful",
//               token: token,
//             });
//           } catch (e) {
//             console.log(e);
//             return res.status(500).send({ message: "Something bad happened" });
//           }
//         }
//       }
  
//       try {
//         const response = await axios.get(
//           `https://2factor.in/API/V1/ad542ca6-24b4-11ef-8b60-0200cd936042/SMS/VERIFY/${req.body.details}/${req.body.otp}`
//         );
  
//         if (response.data.Details === "OTP Matched") {
//           const isAlreadyRegistered = await user.findOne({
//             phone: req.body.phone,
//           });
//           if (isAlreadyRegistered) {
//             const _id = isAlreadyRegistered._id.toString();
//             const token = jwt.sign({ id: _id, }, process.env.JWT_SECRET, {
//               expiresIn: "30d",
//             });
//             return res.status(200).send({
//               message: "Welcome back",
//               token: token,
//             });
//           } else {
//             const createParent = new user({
//               phone: req.body.phone,
//             });
//             try {
//               const result = await createParent.save();
//               const _id = result._id.toString();
//               const token = jwt.sign({ id: _id }, process.env.JWT_SECRET, {
//                 expiresIn: "30d",
//               });
//               return res.status(200).send({
//                 message: "Registered successful",
//                 token: token,
//               });
//             } catch (e) {
//               console.log(e);
//               return res.status(500).send({ message: "Something bad happened" });
//             }
//           }
//         } else if (response.data.Details === "OTP Expired") {
//           return res.status(403).send({ message: "OTP Expired" });
//         }
//       } catch (error) {
//         return res.status(500).json(error);
//       }
//     } catch (e) {
//       console.log(e);
//       return res.status(500).json({ message: "Something went wrong" });
//     }
//   }; 
