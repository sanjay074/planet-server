const express =require("express")
const { contactForm, getAllData } = require("../controllers/contactController")
const { authMiddleware, isAdminMd } = require("../middleware/authMiddle")
const contactRoute =express.Router()
contactRoute.post('/',contactForm)
contactRoute.get('/',authMiddleware,isAdminMd,getAllData)
module.exports =contactRoute