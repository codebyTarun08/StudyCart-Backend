//importing innstance of nodemailer
const nodemailer = require('nodemailer');
require("dotenv").config();

//mailSender handler
const mailSender = async(title,body,email)=>{
    try {
        //creation of transporter
        let transporter = nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
             user:process.env.MAIL_USER,
             pass:process.env.MAIL_PASS
            }
        });

        //sending mail using sendEmail method
        let info =await transporter.sendMail(
            {
                from:`StudyNotion||Codehelp-Lovebabbar`,
                to:`${email}`,
                subject:`${title}`,
                html:`${body}`
            }
        )
        return info;
    } catch (error) {
        console.error(error);
        console.log("Error in sending mail")
    }
}

//exporting the sendMailer function
module.exports = mailSender;