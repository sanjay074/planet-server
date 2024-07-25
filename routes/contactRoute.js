const express =require("express")
const { contactForm, getAllData } = require("../controllers/contactController")
const contactRoute =express.Router()

contactRoute.post('/',contactForm)
contactRoute.get('/',getAllData)



module.exports =contactRoute