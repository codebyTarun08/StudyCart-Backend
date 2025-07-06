//cresting the instance of jsonwebtoken
const jwt = require('jsonwebtoken')
const user = require('../models/User')
require("dotenv").config();

//auth middleware
exports.auth = async(req,res,next)=>{
    try {
        //extract the token
        const token = req.cookies.body || req.header("Authorization").replace("Bearer ","");
        //validate the token
        
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token is Missing",
            })
        }
        //verify the token
        try {
            //verifying the token of the user on the basis of JWT_SECRET
            const decode = jwt.verify(token,process.env.JWT_SECRET);  
            req.user=decode;//passing the email,id,account_Type in the user logged in
        } catch (error) {
            return res.status(401).json({
                success:false,
                message:"Invalid token!"
            })
        }
        //it is neccessary to process next order middleware
        next();
    } catch (error) {
        console.error(error)
        return res.status(401).json({
            success:false,
            message:"Invalid User!",
            error:error.message
        })
    }
}

//isStudent
exports.isStudent = async(req,res,next)=>{
    try {
        //authorizing the user is student or not
        if(req.user.accountType !== 'Student'){
            return res.status(401).json({
                success:false,
                message:"accountType is not Student "
            })
        }
        next();
    } catch (error) {
        console.error(error)
        res.status(401).json({
            success:false,
            message:"Issue in verifying accountType of Student"
        })
    }
}

//isAdmin
exports.isAdmin = async(req,res,next)=>{
    try {
        //authorizing the user is Admin or not 
        if(req.user.accountType !== 'Admin'){
            return res.status(401).json({
                success:false,
                message:"accountType is not Admin "
            })
        }
        next();
    } catch (error) {
        console.error(error)
        res.status(401).json({
            success:false,
            message:"Issue in verifying accountType of Admin"
        })
    }
}

//isInstructor
exports.isInstructor = async(req,res,next)=>{
    try {
        //authorizing the user is Instructor or not
        if(req.user.accountType !== 'Instructor'){
            return res.status(401).json({
                success:false,
                message:"accountType is not Instructor "
            })
        }
        next();
    } catch (error) {
        console.error(error)
        res.status(401).json({
            success:false,
            message:"Issue in verifying accountType of Instructor"
        })
    }
}