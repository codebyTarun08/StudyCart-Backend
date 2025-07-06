const cloudinary = require('cloudinary').v2;
require("dotenv").config();

exports.cloudinaryConnect = ()=>{
    try {
        cloudinary.config({
            cloud_name:process.env.CLOUD_NAME,
            api_secret:process.env.API_SECRET,
            api_key:process.env.API_KEY
        })
        console.log("cloudinary Succcessfully connect");
    } catch (error) {
        console.error(error)
        console.log("Issue in Cloudinary configuration")
    }
}