const jwt = require('jsonwebtoken');
const admin = require('../models/admin');

async function requireSignIn (req,res,next){
    try{
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).send({
                success: false,
                message: "Authorization token is missing or invalid",
            });
        }

        const token = authHeader.split(' ')[1];

        // Decode the token without verifying to get the payload
        const decode = jwt.decode(token);
        
        // Check if decode is valid
        if (!decode) {
            return res.status(401).send({
                success: false,
                message: "Invalid token",
            });
        }

        // Attach decoded data to req.user
        req.userId = decode.userId;
        

     next()        
    }catch(error){
            return res.status(401).send({
            success:false,
            message:"Token is not available"
        })

    }
}
async function isAdminMd(req,res,next){
    try{
        const user = await admin.findById(req.user.id)
        if(user.isAdmin !== true){
            return res.status(401).send({
               success:false,
               message:"Unathurized Access"
            })
        }
        else{
            next()
        }
    }catch(error){
            return res.status(401).send({
            success:false,
            message:"is Admin is not working"
        })

    }
}
//auth middleware

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Assumes Bearer token
    if (!token) {
      return res.status(401).send({ message: 'Authorization token is required' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
      next();
    } catch (error) {
      return res.status(401).send({ message: 'Invalid token' });
    }
  };


module.exports ={
    requireSignIn,
    isAdminMd,
    authMiddleware
}