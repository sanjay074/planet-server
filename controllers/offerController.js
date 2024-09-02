const { isValidObjectId } = require("mongoose");
const offer =require( "../models/offer");
const { uploadOnCloudinary, getCloudinaryPublicId, deleteFromCloudinary } =require( "../utils/cloudinary");
const  { offerValidationSchema } =require("../validations/validation");


const  createOffer = async(req,res)=>{
    try {
     const { error } = offerValidationSchema.validate(req.body);
     if(error){
        return res.status(400).send({
        success:false,
        error:error.details[0].message
       })
     }
      if(req.file){
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
            offerType:req.body.offerType,

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
           validUpto:req.body.validUpto,
           offerType:req.body.offerType,
    
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
const offerTypeGroup =async(req,res)=>{
    try{
      const offerType = req.params.offer;
      const allOffers = await offer.aggregate([
         {
            $match:{offerType}
         },
         {
            $group:{
                "_id":"$offerType",
                "totaloffers":{$sum:1},
                "offers":{$push:"$$ROOT"}
            }
         }
      ])
      return res.status(200).send({
        success:true,
        message:"here is your all data",
        allOffers
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
        const publiId = getCloudinaryPublicId(offerId.offerImage)
    
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
const getSingleOffer = async(req,res) => {
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
const updateOffer = async (req, res) => {
    try {
        // Validate the request body
        const { error } = offerValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).send({
                success: false,
                error: error.details[0].message,
            });
        }

        const id = req.params.id;

        // Validate the ID
        if (!isValidObjectId(id)) {
            return res.status(400).send({
                success: false,
                message: "This ID is not valid",
            });
        }

        // Find the offer by ID
        const offerToUpdate = await offer.findById(id);
        if (!offerToUpdate) {
            return res.status(404).send({
                success: false,
                message: "Offer not found",
            });
        }

        const updatedFields = {
            name: req.body.name,
            offerPrice: req.body.offerPrice,
        };

        // Handle file upload if a new file is provided
        if (req.file) {
            const { path } = req.file;

            // Delete the old image from Cloudinary
            if (offerToUpdate.offerImage) {
                const offerImageId = getCloudinaryPublicId(offerToUpdate.offerImage);
                await deleteFromCloudinary(offerImageId);
            }

            // Upload the new image to Cloudinary
            const uploadResult = await uploadOnCloudinary(path);
            if (!uploadResult) {
                return res.status(500).send({
                    success: false,
                    message: "Image upload to Cloudinary failed",
                });
            }

            updatedFields.offerImage = uploadResult.secure_url;
        }

        // Update the offer
        const updatedOffer = await offer.findByIdAndUpdate(id, updatedFields, { new: true });

        return res.status(200).json({
            success: true,
            message: "Offer updated successfully",
            data: updatedOffer,
        });

    } catch (error) {
        console.error("Error updating offer:", error); 
        return res.status(500).send({
            success: false,
            message: "Error in updating offer",
            error: error.message,  
        });
    }
};

module.exports = {createOffer,getalloffer,deleteoffer,getSingleOffer,updateOffer,offerTypeGroup}