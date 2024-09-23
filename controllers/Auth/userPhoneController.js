const users = require("../../models/user")
const {userValidationSchema,UserLoginSchema} = require("../../validations/validation")
const {generateAccessToken,generateRefreshToken} = require("../../services/generateToken");
const bcrypt =require("bcrypt")
const jwt = require('jsonwebtoken');

const  registrationUser = async (req, res) => {
    try{
     const {email,password,lastName,firstName,confirmPassword} = req.body;
     const { error } = userValidationSchema.validate(req.body);
     if(error){
        return res.status(400).json({message:error.details[0].message});
         
     }
    if (password !== confirmPassword) {
        return res.status(400).json({ success: 0, message: "Passwords do not match!"});
      }
     const exist = await users.exists({ email: req.body.email });
     if (exist) {
       return res.status(400).json({success:0, message:"This email is already taken!"});
     }
     const hashedPassword = await bcrypt.hash(password, 10);
     const newUser = new users({
         firstName,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
         lastName,
         email,
         password:hashedPassword
     })
     const saveUserData = await newUser.save();
     res.status(200).json({success:1, message:"User registration is sucessfully"});

    }catch(error){

     return res.status(500).json({
         status: 0,
         message: error.toString(),
       });
    }
     
   }


   const UserLogin = async (req, res) => {
     try {
       const { error } = UserLoginSchema.validate(req.body);
       if (error) {
         return res.status(400).json({ message: error.details[0].message });
       }
   
       const user = await users.findOne({ email: req.body.email });
       if (!user) {
         return res.status(400).json({ success: 0, message: 'Invalid credentials' });
       }
   
       const match = await bcrypt.compare(req.body.password, user.password);
       if (!match) {
         return res.status(400).json({ success: 0, message: 'Invalid credentials' });
       } else {
  
         const token = generateAccessToken(user._id);
         const refreshToken = generateRefreshToken(user._id);
         user.refreshToken = refreshToken;
   
         // Set refresh token in an httpOnly, secure cookie
         res.cookie('refreshToken', refreshToken, {
           httpOnly: true,
           secure: true, 
           sameSite: 'strict',
           maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
         });
   
         await user.save();
   
         return res.status(200).json({ success: 1, message: 'User is login successfully', token, refreshToken });
       }
     } catch (error) {
       return res.status(500).json({
         status: 0,
         message: error.toString(),
       });
     }
   };
   

  
   
   const refreshAccessToken = async (req, res) => {
     try {
       // Get the refresh token from cookies
       const refreshToken = req.cookies.refreshToken || req.body.refreshToken
       if (!refreshToken) {
         return res.status(403).json({ success: 0, message: 'Refresh token not found' });
       }
       jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
         if (err) {
           return res.status(403).json({ success: 0, message: 'Invalid refresh token' });
         }
         const user = await users.findOne({ refreshToken });
         if (!user) {
           return res.status(403).json({ success: 0, message: 'Refresh token not valid' });
         }
         // Generate new access token
         const newAccessToken = generateAccessToken(user._id); 
         res.status(200).json({
           success: 1,
           message:"Access token refreshed",
           accessToken: newAccessToken,
         });
       });
     } catch (error) {
       return res.status(500).json({
         success: 0,
         message: error.toString(),
       });
     }
   };
   
  
   const Logout = async (req, res) => {
    try {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true, 
        sameSite: 'strict',
      });
      const { refreshToken } = req.cookies;
      await users.updateOne(
        { refreshToken: refreshToken },
        { $unset: { refreshToken: "" } }
      );
  
      return res.status(200).json({ success: 1, message: 'Logged out successfully' });
    } catch (error) {
      return res.status(500).json({
        success: 0,
        message: error.toString(),
      });
    }
  };
  
     
   
async function getAllUserController(req,res){
 try{
    const alluser =await users.find({}).select("-password -refreshToken")
    return res.status(200).send({
        success:true,
        message:"here is my all users",
        totalUser:alluser.length,
        alluser

    })

 }catch(error){
    return res.status(400).send({
        success:false,
        message:"error in getting the all user data"
    })
 }
}

module.exports ={ getAllUserController,registrationUser,UserLogin,refreshAccessToken,Logout};