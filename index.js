//instance of a express
const express = require('express');
//initialization of express
const app=express();

//importing routes file 
const userRoutes=require('./routes/userRoutes')
const profileRoutes=require('./routes/profileRoutes')
const paymentRoutes=require('./routes/paymentRoutes')
const courseRoutes=require('./routes/courseRoutes')
const contactRoutes=require('./routes/contactRoutes')

//importing databaseConnetion method
const databaseConnection = require('./config/database')
//importing the cloudinary connect method
const {cloudinaryConnect}=require('./config/cloudinary')
//importing cookieparser for passing token
const cookieParser = require('cookie-parser')
//importing cors package to entertain every request from frontend
const cors = require('cors')
//importing express fileupload package to upload to media server
const fileUpload = require('express-fileupload')
//importing dotenv package
const dotenv=require('dotenv')
//loading each configuration of .env file
dotenv.config();
PORT=process.env.PORT||3000;

//connecting to database
databaseConnection();

//using middlewares for parse json oject from body
app.use(express.json())
//using cookieparser middleware to parse cookies
app.use(cookieParser());
//using cors middleware to fulfill the request from frontend
app.use(
    cors({
        origin:['http://localhost:3000','https://study-cart.vercel.app'],
        credentials:true,
}))

//using local fileUploader middleware to upload file
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:'./tmp/',
    createParentPath: true,
})) 

//calling the connect method to cloudinary
cloudinaryConnect();

//mounting the routes 
app.use('/api/v1/auth',userRoutes)
app.use('/api/v1/profile',profileRoutes)
app.use('/api/v1/course',courseRoutes)
app.use('/api/v1/payment',paymentRoutes)
app.use('/api/v1/reach',contactRoutes)

//default route handler
app.get('/',(req,res)=>{
    return res.json({
        success:true,
        message:"Your Server is started"
    });
});

//starting the server on 4000 port
app.listen(PORT,(req,res)=>{
    console.log(`APP is running at ${PORT}`)
})
