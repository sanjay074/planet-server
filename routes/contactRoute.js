const express =require("express")
const { contactForm } = require("../controllers/contactController")
const contactRoute =express.Router()

contactRoute.post('/',contactForm)



module.exports =contactRoute