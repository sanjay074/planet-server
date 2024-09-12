const axios =require("axios");
const { phoneLoginSchema } = require("../../validations/validation");

exports.phoneLogin = (req, res) => {
  const { error } = phoneLoginSchema.validate(req.body);
  if (error) {
    return res.status(400).send({
      success: false,
      message: error.details[0].message
    });
  }


if (req.body.phone === "9999999999" || req.body.phone === "8888888888") {
      return res.status(200).send({
        success: true,
        details: "f7a3883f-840d-48a9-ac82-e59e47399eb3",
        message: "Dummy Account Login",
        otp: "Enter any 6 digit otp",
      });
    }
    axios
      .get(
        "https://2factor.in/API/V1/ad542ca6-24b4-11ef-8b60-0200cd936042/SMS/" +
        req.body.phone +
        "/AUTOGEN/User verification"
      )
      .then(function (response) {
        return res.status(200).json({
          success: "otp sent successfully",
          details: response.data.Details,
        });
      })
      .catch((er) => {
        return res.status(500).json({ message: "Error", error: er.name });
      });
  };
  

  // exports.phoneLogin = (req, res) => {
  //   const { error } = phoneLoginSchema.validate(req.body);
  //   if (error) {
  //     return res.status(400).json({ message: error.details[0].message });
  //   }
  //   if (req.body.phone === "9999999999" || req.body.phone === "8888888888" || req.body.phone === "7777777777" || req.body.phone === "6666666666") {
  //     return res.status(200).send({
  //       success: true,
  //       details: "f7a3883f-840d-48a9-ac82-e59e47399eb3",
  //       message: "Dummy Account Login",
  //       otp: "Enter any 6 digit otp",
  //     });
  //   }
  //   axios
  //     .get(
  //       "https://2factor.in/API/V1/ad542ca6-24b4-11ef-8b60-0200cd936042/SMS/" +
  //       req.body.phone +
  //       "/AUTOGEN/User verification"
  //     )
  //     .then(function (response) {
  //       return res.status(200).json({
  //         success: "otp sent successfully",
  //         details: response.data.Details,
  //       });
  //     })
  //     .catch((er) => {
  //       return res.status(500).json({ message: "Error", error: er.name });
  //     });
  // };
  