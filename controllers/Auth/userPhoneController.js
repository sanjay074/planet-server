const users = require("../../models/user")
const {userValidationSchema,UserLoginSchema} = require("../../validations/validation")
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
        return res.status(400).json({ success: 0, message: "Passwords do not match!" });
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

const  UserLogin = async (req, res) => {
    try {
      const {error}= UserLoginSchema.validate(req.body);
      if(error){
        return res.status(400).json({message:error.details[0].message})
      }
     const user = await users.findOne({email: req.body.email})
      if (!user) {
        return res.status(400).json({success:0, message: 'Invalid credentials'});
      }
      const match = await bcrypt.compare(req.body.password, user.password);
      if (!match) {
        return res.status(400).json({success:0, message: 'Invalid credentials'});
      } else {
        const token = jwt.sign(
          {
            id: user._id,
            isAdmin: user.isAdmin,
          },
          process.env.JWT_SECRET,
          { expiresIn: "30d" }
        );
        res.status(200).json({success:1, message: "User is login sucessfully", token });
      }
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.toString(),
          });
    }


  };   

async function getAllUserController(req,res){
 try{
    const alluser =await users.find({})
    

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

module.exports ={ getAllUserController,registrationUser,UserLogin};