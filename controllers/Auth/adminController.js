const admin = require("../../models/admin")
const bcrypt =require("bcrypt")
const jwt = require('jsonwebtoken');

//sign-up
async function singupController(req,res){
try{

    //req from the body
    const {email,password,isAdmin} = req.body 
    //all fields check
    if(!email || !password){
            return res.status(400).send({
            success:false,
            message:"Please fill all  the fields"
        })
    }

    //check mail 
    const mailCheck = await admin.findOne({email})
    if(mailCheck){
            return res.status(401).send({
            success:false,
            message:"Email is already available"
        })
    }

     //password hashing 
     const salt=await bcrypt.genSalt(10)
     const hashedPassword = await bcrypt.hash(password,salt)

    //send data to the database
    const data  = await admin({
        isAdmin,
        email,password:hashedPassword
    }).save()

     //success response
        return res.status(200).send({
        success:true,
        message:"User Register Succesfully",
        data
    })   

    }catch(error){
        return res.status(403).send({
        success:false,
        message:"Error in  User Register",
        error
    })

}
}
//-----------------------sign-in ------------------
async function signinController(req,res){
    try{
    //req data from body 
    const {email,password} =req.body  
    
    //validation
    if(!email || !password){
             return res.status(401).send({
            success:false,
            message:"Please fill all the feilds"
        })
    }

      //check user is not register
      const user =await admin.findOne({email})
      if(!user){
          return res.status(401).send({
              success:false,
              message:"User is not register"
          })
      }
      //password compare
      const ismatch =await bcrypt.compare(password,user.password) 
      if(!ismatch){
              return res.status(401).send({
              success:false,
              message:"Password is not matching"
          })
      }
      //jsonWebtoken

      const token =await jwt.sign({
        id:user._id,
        isAdmin:user.isAdmin
        },
        process.env.JWT_SECRET,
        {expiresIn:"1d"})

      //success response
      return res.status(200).send({
          success:true,
          message:"User Login Successfully",
          token
      })
    }catch(error){
            return res.status(403).send({
            success:false,
            message:"Error in  Login",
            error
        })
    }
}
//get all data 
async function getAllController (req,res){
    try{
        //req data from the data base
        const data = await admin.find({})
        
        //success response
        return res.status(200).send({
            success:true,
            message:"Here is your data",
            data
        })


    }catch(error){
            return res.status(403).send({
            success:false,
            message:"Error in  getting all user data",
            error
        })

    }
}



module.exports = {
    singupController,
    signinController,
    getAllController
}