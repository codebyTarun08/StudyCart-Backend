const User = require('../models/User')
const mailSender = require('../utils/mailSender')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
//resetPasswordToken: jab reset password par click karega toh uske mail par ek token aur link aayegi jo kisi frontend par le jayegi waha par woh password reset kar sakta hai 
exports.resetPasswordToken = async (req, res) => {
    try {
        //get email from the body
        const email = req.body.email;
        //check th user existing or not
        const user = await User.findOne({ email: email });
        //validation
        if (!user) {
            return res.status(401).json({
                success: false,
                message: `This email:${email} is not registered with us . Please Sign up first`
            })
        }
        //generate the token
        const token = crypto.randomBytes(20).toString("hex");
        console.log("Token of Expiration of reset password url", token)
        //find the user by email and add expiration time and token to user
        const updatedDetails = await User.findOneAndUpdate(
            { email: email },
            {
                token,
                tokenExpires: Date.now() + 5 * 60 * 1000 //5 minutes
            },
            { new: true }
        )
        //create url
        console.log(updatedDetails)
        const url = `http://localhost:3000/update-password/${token}`
        //send mail
        const mailResponse=await mailSender(
            "Reset Password",//title
            `The password can be reset using url: ${url}`,//body
            email//email
        )

        //send response
        return res.status(200).json({
            success: true,
            url,
            message: "Email Send Successfully"
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Something went wrong while resetting the password"
        })
    }
}

exports.resetPassword = async (req, res) => {
    try {
        //get data fro req body 
        const { password, confirmPassword,token } = req.body;
        //validation
        if(password != confirmPassword){
            return res.status(400).json({
                success: false,
                message: "Password are not matched"
            })
        }
        //get userDetals from the db using token
        const userDetails= await User.findOne({token:token});
        //if no entry - invalid token
        if(!userDetails){
            return res.status(400).json({
                success: false,
                message: "User not found.Token is invalid!"
            })
        }
        //check token time
        if(userDetails.tokenExpires < Date.now()){
            return res.status(400).json({
                success: false,
                message: "Token is expired"
            })
        }
        //hash the password
        const hashedPassword = await bcrypt.hash(password,10);
        //update user
        const updatePassword=await User.findOneAndUpdate(
                    {token:token},
                    {
                        password:hashedPassword
                    },
                    {new:true}
        );
        //return the response
        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
            updatePassword,
            password
        })
    } catch (error) {
        console.error("Error ocurred in updating password:",error)
        return res.status(500).json({
            success: false,
            message: "Reset Password Failure,Please Try Again"
        })
    } 
}