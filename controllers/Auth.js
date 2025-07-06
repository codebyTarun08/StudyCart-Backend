//signup

//login

//sendOtp

//changePassword

//resetPassword: resetpssswdtoken |generates a link that redirects to page that reset the passwords



const User = require('../models/User');
const OTP = require('../models/Otp')
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mailSender= require("../utils/mailSender")
const {passwordUpdateTemplate} = require('../mail/templates/passwordUpdate');
const Profile = require('../models/Profile')
require("dotenv").config();

exports.sendOTP = async(req,res)=>{
    try {
        //fetch the email
        const {email}=req.body;
        //check if already user
        const checkUserPresent = await User.findOne({email});

        //if user exist then return the response
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:"User Already Exist"
            })
        }

        //Ganda otp generator 
        //generate 6 digits otp
        let otp= otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("Generated Otp: ",otp);

        //check otp exist or not
        const result = await OTP.findOne({otp: otp});
       
        while(result){
            otp = otpGenerator(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp: otp}); 
        }

        //creste an entry in db
        const otpBody = await OTP.create({otp:otp,email:email})
        console.log(otpBody);
        

        //return response successful
        res.status(200).json({
            success:true,
            otp,
            message:"OTP Sent Successfully"
        })
    } catch (error) {
        console.log(error),
        res.status(500).json(
            {
                success:false,
                message:"Error occurred in generation of OTP"
            }
        )
    }
}

//signup handler 
exports.signup = async(req,res)=>{
    try {
        //data  fetch
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            otp
        } = req.body;
        // console.log(accountType)
        //validate data
        if(!email || !firstName || !lastName || !password ||!confirmPassword || !otp){
            return res.status(400).json({
                success:false,
                message:"Enter All the fields"
            })
        }
        //match the password
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password and Confirm Password are not matched,Please try again later"
            })
        }
        //check user exist or not
        let user = await User.findOne({email});

        if(user){
            return res.status(401).json({
                success:false,
                message:"User already exist.Please Sign in to continue"
            });
        }
        //Find the recent stored otp in db
         const response = await OTP.find({email}).sort({createdAt:-1}).limit(1);

         //validate the otp 
         if(response.length == 0){
            //Otp not found
            return res.status(401).json({
                success:false,
                message:"OTP not found"
            });
         }else if(otp !== response[0].otp){
            //Invalid OTP 
            return res.status(401).json({
                success:false,
                message:"This OTP is not valid "
            });
         }
        //hash password
        let hashedPassword;
        try {
            hashedPassword= await bcrypt.hash(password,10);//10 is no. of rounds which are used to hash the password
        } catch (error) {
            return res.status(500).json({
                success:false,
                message:"Issue ocurred in hashing the password"
            })
        }
        //create the user
        let approved=(accountType === "Instructor")?(false):(true);


        //create entry in db


        //fake profile
        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null
        })

        user = await User.create({
            firstName,
            lastName,
            email,
            accountType:accountType,
            approved:approved,
            password:hashedPassword,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName}%20${lastName}`, 
        });
        //send response
        res.status(200).json({
            success:true,
            meassage:"User account is created",
            user
        })
        
    } catch (error) {
        console.error("Issue ocurred in signup process",error)
        return res.status(500).json({
            success:false,
            message:"User Cannot be registered ,Please try again"
        })
    }
}

//Login controller for authenticating user
exports.login= async(req,res)=>{
    try {
        //fetch the data
        const {email,password} = req.body;
        //validate the data
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"please Fill all entries carefully"
            })
        }
        //check if user exist
        const user = await User.findOne({email}).populate("additionalDetails")
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User not registered,Please Signup"
            })
        }
        //verify password
        
        const payload={
            email:user.email,
            id:user._id,//id of user is passed in payload
            accountType:user.accountType//role of 
        }
        // console.log("PASSWORD: ",password)
        // console.log("User PASSWORD: ",user.password)
        // const value=await bcrypt.compare(password,user.password)
        // console.log(value)

        //await lagana important hai kyuki agar nhi lagayange toh sabko login kara dega
        if(await bcrypt.compare(password,user.password)){
            //if password are matched using bcrypt compare method ,we have to create a token which takes payload ,seccret and options
            let token = jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:"2h"});
            //we have pass this token in user body
            user.token= token;
            //also make its password undefined
            user.password=undefined;


            //options for cookie
            const options= {
                expires: new Date(Date.now() + 3*24*60*60),
                secure:true,
                httpOnly:true
            }
            //sending cookie in response
            //cookie takes three parameters name of cookie,token and otipns
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"User Logged in Successfully"
            })
        }
        else{
            return res.status(500).json({
                success:false,
                message:"Password is incorrect"
            })
        }
        
    } catch (error) {
        console.error("Error ocurred in login",error)
        return res.status(500).json({
            success:false,
            message:"Login Failure,Please Login Again"
        })
    }
}

//changePassword handler
exports.changePassword = async(req,res)=>{
    try {
        //get data fro req body 
        const {
            email,
            oldPassword,
            newPassword,
            confirmNewPassword
        } = req.body;

        //fetch password from db
        const user= await User.findOne({email})
        //validate
        if(!oldPassword || !newPassword || !confirmNewPassword){
            return res.status(401).json({
                success:false,
                message:"please Fill all entries carefully"
            })
        }else if(await bcrypt.compare(oldPassword,user.password)){
            return res.status(401).json({
                success:false,
                message:"OldPassword doesn't matched,Please Enter Correct Password"
            })
        }else if(newPassword !== confirmNewPassword){
            return res.status(401).json({
                success:false,
                message:"NewPassword doesn't matched"
            })
        }

        //hash the newPassword
        let newHashedPassword;
        try{
            newHashedPassword=await bcrypt.hash(newPassword,10)
        } catch (error) {
            return res.status(500).json({
                success:false,
                message:"Issue ocurred in hashing the password"
            });
        }
        //update password in db
        const updateUser = await User.findByOneAndUpdate({email:email},    
                                                         {password:newHashedPassword},
                                                         {new:true});

        //send Mail 
        const title="Password Updation"
        const body="Your Password Updated Successfully"
        const fullName  = `${user.firstName +" "+ user.lastName}`;
        const emailBody=passwordUpdateTemplate(fullName,email);
        const mailResponse = await mailSender(title,emailBody,email);
        //return response
        res.status(200).json({
            success:true,
            message:"Password updated successfully",
            mailResponse
        })
    } catch (error) {
        console.error("Error ocurred in updating password: ",error)
        return res.status(500).json({
            success:false,
            message:"Password updation Failure,Please Login Again",
            error:error.message
        })
    }
}