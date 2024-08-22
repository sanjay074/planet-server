const { isValidObjectId } = require("mongoose");
const offer =require( "../models/offer");
const { uploadOnCloudinary, getCloudinaryPublicId, deleteFromCloudinary } =require( "../utils/cloudinary");
const  { offerValidationSchema } =require("../validations/validation");

const  createOffer =async(req,res)=>{
    try {

     const { error } = offerValidationSchema.validate(req.body);

     if(error){
        return res.status(400).send({
        success:false,
        error:error.details[0].message
       })
     }

      if(req.file ){
           const uploadResult =await uploadOnCloudinary(req.file.path);
            if(!uploadResult){
               return res.status(400).send({
               success:false,
               message:"failed to upload to image on cloudinary"  
           })
        }
           const newOffer = new offer({
            name:req.body.name,
            offerImage:uploadResult.secure_url,
      })
   
      const savedBrand = await newOffer.save();
        return res.status(200).json({
        success:true,
        message:"your new image run successfully",
        data:savedBrand
     })

      }else{
          const newOffer = new offer({
           name:req.body.name,
           offerPrice:req.body.offerPrice,
           validUpto:req.body.validUpto
    
     })
     const savedBrand = await newOffer.save();
        return res.status(200).json({
        success:true,
        message:"your new image run successfully",
        data:savedBrand
     })
    }

    }catch(error){
            return res.status(400).send({
            success:false,
            message:"error in create the offer"
        })
    }
}

const getalloffer = async(req,res)=>{
    try{
        const data = await  offer.find({})
        return res.status(200).send({
            success:200,
            message:"here is your all offer",
            total:data.length,
            data
        })

    }catch(error){
       return res.status(400).send({
        success:false,
        message:"error in getting the offer "
       })
    }
}

const deleteoffer = async(req,res)=>{
    try{
        const id = req.params.id;
        if(!isValidObjectId(id)){
            return res.status(400).send({
                success:false,
                message:"this id is not valid  "
            })
        }
        const offerId =await offer.findById(id)
        if(!offerId){
            return res.status(400).send({
            success:false,
            message:"this offer id is not valid : "
            })
        }
        const publiId =getCloudinaryPublicId(offerId.offerImage)
    
        await deleteFromCloudinary(publiId)

        await offer.findByIdAndDelete(offerId)

        return res.status(200).send({
            success:true,
            message:"this offer is deleted successfully"
        })
    }catch(error){
         return res.status(400).send({
         success:false,
         message:"error in deleting the offer"
        })
    }
}
const getSingleOffer =async(req,res)=>{
    try{
    const id = req.params.id
    if(!isValidObjectId(id)){
        return res.status(400).send({
            success:false,
            message:"this id is not valid"
        })
    }
    const data =await offer.findById(id)
   if(!data){
    return  res.status(400).send({
        success:false,
        message:"no data available on this id"
    })
   } 
   return res.status(200).send({
    success:true,
    message:"your data",
    data
   })


    }catch(error){
            return res.status(400).send({
            success:false,
            message:"error in deleting the offer"
           })
    }
}
const updateOffer = async(req,res) => {
    try{

        const { error } = offerValidationSchema.validate(req.body);
        if(error){
           return res.status(400).send({
           success:false,
           error:error.details[0].message
          })
        }
        const id = req.params.id;
       
        if(!isValidObjectId(id)){
        return res.status(400).send({
            success:false,
            message:"this id is not valid "
        })
        }

        const offerid = await offer.findById(id) 
       
        const name= req.body.name;
        const offerPrice=req.body.offerPrice;

        const {file} = req.file;

        if(!offerid){
                return res.status(400).send({
                 success:false,
                 message:"this id data is not available"
            })
        }
        const updatedFields = {name};

        if(file){
            const offerId = getCloudinaryPublicId(offerid.offerImage)
            await deleteFromCloudinary(offerId)

            //offer  image upload
            const uploadImage=await uploadOnCloudinary(file.path)
            if(!uploadImage){
                return res.status(200).send({
                    success:false,
                    message:"this  image is not uploaded on cloudinary"
                })
            }
            updatedFields.offerImage = uploadImage.secure_url;


        const updatedoffer =await offer.findByIdAndUpdate(id,updatedFields,{new:true})
        
        return res.status(200).json({
            success:true,
            message:"your offer updated successfully",
            data:updatedoffer
        })

    } else{
    if(!file){
        updatedFields.offerPrice = offerPrice ;
        const updatedoffer = await offer.findByIdAndUpdate(id,updatedFields,{new:true})
        
            return res.status(200).json({
            success:true,
            message:"your offer updated successfully",
            data:updatedoffer
        })
    }
    }
    }catch(error){

            return res.status(400).send({
            success:false,
            message:"error in update in offer"
        })
    }
}


module.exports = {createOffer,getalloffer,deleteoffer,getSingleOffer,updateOffer}