exports.otpVerificationTemplate=(otp)=>{
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Course Registration Confirmation</title>
    <style>
        body{
            background-color: #ffffff;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 16px;
            line-height: 1.4;
            color: #333333;
            margin: 0;
            padding: 0;
        }

        .container{
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
        }
        .logo{
            background-color: #FFD60A;
            color: #000000;
            width: 200px;
            margin-bottom: 20px;
        }
        .logo img{
          
        }
        .message{
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .body{
            font-size: 16px;
            margin-bottom: 20px;
        }
        .cta{
            display: inline-block;
            padding: 10px 20px;
            background-color: #FFD60A;
            color: #000000;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            margin-top: 20px;
        }
        .support{
            font-size: 14px;
            color: #999999;
            margin-top: 20px;
        }
        .highlight{
            font-weight: bold;
        }
    </style>
</head>

<body>
    <div class="container">
        <a class="logo">
            <img src="https://res.cloudinary.com/drqabv2wq/image/upload/v1751744542/StudyCart2_emaurd.png" alt="Studycart logo">
        </a>
        <div class="message">OTP Verification Email</div>
        <div class="body">
            <p>Dear User,</p>
            <p>Thank you for registering with Studynotion. To complete your registration, please use the following OTP(One-Time-Password) to verify your account!</p>
            <h2 class="highlight">${otp}</h2>
            <p>This otp is valid for 5 minutes.If you did not request this verification, please disregard that once your account is verified, you will have access to our platform and its features.</p>
            <a class="cta" href="https://studynotion-edtech-project.vercel.app">Go to Dashboard</a>
        </div>
        <div class="support">
            If you have any questions or need assistance, please feel to react out to info@studynotion.com. We are here to help!
        </div>
    </div>
</body>
</html>
    `
}