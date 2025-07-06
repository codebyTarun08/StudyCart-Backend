const mongoose=require("mongoose");
const mailSender=require('../utils/mailSender')
const {otpVerificationTemplate} = require('../mail/templates/emailVerificationTemplate')
const OTPSchema=new mongoose.Schema(
    {
        email:{
            type:String,
            required:true
        },
        otp:{
            type:String,
            required:true
        },
        createdAt:{
            type:Date,
            default:Date.now,
            expires: 5*60, // 5minutes
        }
    }
);

//sending otp mail before saving the entry in the database
async function sendVerificationEmail(email,otp){
   try {
    const emailBody = otpVerificationTemplate(otp);
        
    const mailResponse=await mailSender(
        "OTP Verification Mail | Studynotion",
        emailBody,
        email
    );
    console.log("Email sent successfully,mailResponse: ", mailResponse)
   } catch (error) {
    console.log("Error ocurred while sending mail: ",error);
   }
}
//pre / post middleware
OTPSchema.pre("save",async function(next){
    await sendVerificationEmail(this.email,this.otp)
    next();
})

module.exports=mongoose.model("OTP",OTPSchema);