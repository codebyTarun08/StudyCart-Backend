const express= require('express');
const router = express.Router();

const {capturePayment,verifySignature,sendPaymentSuccessEmail} = require('../controllers/Payments')
const {auth,isStudent,isAdmin,isInstructor}=require('../middlewares/auth')

router.post('/capturePayment',auth,isStudent,capturePayment);
router.post('/verifyPayment',auth,isStudent,verifySignature)
router.post("/sendPaymentSuccessEmail", auth, isStudent, sendPaymentSuccessEmail);
//export the router
module.exports= router;