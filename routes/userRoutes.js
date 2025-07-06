const express= require('express');
const router = express.Router();

//import handlers
const {signup,login,sendOTP}= require('../controllers/auth')
const {resetPasswordToken,resetPassword}=require('../controllers/ResetPassword')
router.post('/signup',signup);
router.post('/login',login);
router.post('/sendotp',sendOTP);
router.post('/reset-password',resetPassword);
router.post('/reset-password-token',resetPasswordToken);
//export the router
module.exports= router;