exports.passwordUpdateTemplate=(name,email)=>{
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
            max-width: 200px;
            margin-bottom: 20px;
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
        <div class="message">Password Update Confirmation</div>
        <div class="body">
            <p>Hey ${name},</p>
            <p>Your password has been successfully updated for the email <span class="highlight">${email}</span></p>
            <p>If you did not reqquest this password change,please contact us immediately to secure your account.</p>
            <a class="cta" href="https://studynotion-edtech-project.vercel.app">Go to Dashboard</a>
        </div>
        <div class="support">
            If you have any questions or need assistance, please feel to react out to <a href="mailto:info@studynotion.com">info@studynotion.com</a>. We are here to help!
        </div>
    </div>
</body>
</html>`
};

