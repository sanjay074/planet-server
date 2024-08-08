const users = require("../../models/user")

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
module.exports ={ getAllUserController};