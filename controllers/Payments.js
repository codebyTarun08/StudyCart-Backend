const { instance } = require('../config/razorpay')
const Course = require('../models/Course')
const User = require('../models/User')
const mailSender = require('../utils/mailSender')
const { courseEnrollmentEmail } = require('../mail/templates/courseEnrollmentEmail')
const CourseProgress = require("../models/CourseProgress")
require("dotenv").config();
const mongoose = require('mongoose')
const crypto = require('crypto');

// //capture the payment and initiate the Razorpay order
// exports.capturePayment = async (req, res) => {
//     try {
//         //fetch the courseId and userId
//         const { course_id } = req.body;
//         const userId = req.user.id;
//         //valid courseID?
//         if (!course_id) {
//             return res.json({
//                 success: false,
//                 message: "Please Provide the valid course Id"
//             })
//         }
//         //valid courseDetail
//         let course;
//         try {
//             course = await Course.find(course_id);
//             //validation?
//             if (!course) {
//                 return res.json({
//                     success: false,
//                     message: "Could not find the course data"
//                 })
//             }
//         } catch (error) {
//             return res.json({
//                 success: false,
//                 message: "Error fetching course data",
//                 error: error.message,
//             });
//         }

//         //user already purchase the course
//         const uid = new mongoose.Types.ObjectId(String(userId));
//         if (course.studentsEnrolled.includes(uid)) {
//             return res.staus(400).json({
//                 success: false,
//                 message: "Student is Already Enrolled"
//             })
//         }

//         //create razorpay order
//         const amount = course.price;
//         const currency = "INR";
//         const options = {
//             amount: amount * 100,
//             currency,
//             receipt: Math.random(Date.now()).toString(),
//             notes: {
//                 courseId: course_id,
//                 userId
//             }
//         };

//         //initiate the payment using razorpay
//         const paymentResponse = await instance.orders.create(options);
//         console.log(paymentResponse);

//         //return response
//         return res.status(200).json({
//             success: true,
//             message: "Order created successfully",
//             courseName: course.courseName,
//             courseDescription: course.courseDescription,
//             thumbnail: course.thumbnail,
//             orderId: paymentResponse.id,
//             currency: paymentResponse.currency,
//             amount: paymentResponse.amount,
//         });
//     } catch (error) {
//         console.log("error in order creation:", error)
//         return res.status(500).json({
//             success: false,
//             message: "Could not initiate order",
//             error: error.message,
//         })
//     }
// }

// exports.capturePayment = async (req, res) => {
//    try {
//     const { courses } = req.body;
//     const userId = req.user.id;

//     if (courses.length === 0) {
//         return res.json({ success: false, message: "Please provide Course Id" });
//     }
//     let totalAmount = 0;
//     for (const course_id of courses) {
//         let course;
//         try {
//             course = await Course.findOne({ _id: course_id });
//             if (!course) {
//                 return res.json({
//                     success: false,
//                     message: "Could not find course"
//                 })
//             }
//             const uid = new mongoose.Types.ObjectId(userId);
//             if (course.studentsEnrolled.includes(uid)) {
//                 return res.json({
//                     success: false,
//                     message: "Student is already Enrolled"
//                 });
//             }
//             totalAmount += course.price;
//         }
//         catch (error) {
//             console.log(error);
//             return res.status(500).json({
//                 success: false,
//                 error: error.message
//             })
//         }
//     }

//     const options = {
//         amount: totalAmount * 100,
//         currency: "INR",
//         receipt: Math.random(Date.now().toString())
//     }

//     try {
//         const paymentResponse = instance.orders.create(options);
//         res.json({
//             success: true,
//             message: paymentResponse
//         })
//     }
//     catch (error) {
//         return res.json({
//             success: false,
//             error: error.message
//         })
//     }
//    } catch (error) {
//      console.log("Error IN CAPTURING THE PAYMENT")
//      console.log(error)
//    }
// }

exports.capturePayment = async (req, res) => {
  try {
    const { courses } = req.body;
    const userId = req.user.id;
    console.log(courses)
    console.log(userId)
    if (!courses || courses.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide Course ID(s)"
      });
    }
     
    let totalAmount = 0;

    for (const course_id of courses) {
      try {
        const course = await Course.findById({_id:course_id});
       
        if (!course) {
          return res.status(404).json({
            success: false,
            message: `Course not found for ID: ${course_id}`
          });
        }
        console.log("COURSE",course)
        const uid = new mongoose.Types.ObjectId(userId);
        console.log("UID:", uid);

        if (course.studentsEnrolled.some(id => id.equals(uid))) {
        return res.status(409).json({
            success: false,
            message: `User already enrolled in course: ${course.courseName}`
        });
        }
        console.log("XOXO")
        totalAmount += course.price;
      } catch (error) {
        console.error(`Error processing course ID: ${course_id}`, error);
        return res.status(500).json({
          success: false,
          message: "Error while processing course(s)",
          error: error.message
        });
      }
    }
    
    const options = {
      amount: totalAmount * 100, // Razorpay works in paise
      currency: "INR",
      receipt: `receipt_order_${Math.floor(Math.random() * 1000000)}`,
    };

    try {
      const paymentResponse = await instance.orders.create(options); // ✅ await is needed here
      return res.status(200).json({
        success: true,
        message: "Order created successfully",
        order: paymentResponse,
      });
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      return res.status(500).json({
        success: false,
        message: "Could not initiate payment",
        error: error.message,
      });
    }
    console.log("1a")
  } catch (error) {
    console.error("Error IN CAPTURING THE PAYMENT", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


//verify signature of razorpay and server

// exports.verifySignature = async (req, res) => {
//     //backend par jo secret key hai
//     const webhookSecret = "45287372837";

//     //razorpay se jo key encrypted form mein aa rhi hai 
//     const signature = req.headers["x-razorpay-signature"];

//     //hum encrypted key ko secret key mein decrypt aasani se nhi kar skte
//     //isliye backend secret key ko crypto package ki help se Hmac Object mein convert kar denge jo hashingAlgo aur secret key input parameters mein leta hai

//     //3 Step Process

//     //1. Creation of hmac object
//     const shasum = crypto.createHmac("sha256", webhookSecret);
//     //2.ab jo Hmac object hai use string mein convert karenge
//     shasum.update(JSON.stringify(req.body))

//     //3.jab koi hashing algorithm ko kisi text ke uper run karte hai toh bhut saari cases mein use ek term se pukaarte hai jise kehte hai digest jo ki generally hexadecimal ke form mein hota  
//     const digest = shasum.digest(hex);


//     //matching the signature and digest
//     if (signature === digest) {
//         console.log("Payment is Authorized")

//         //fetch the userId and courseId from the notes from razorpay webhook
//         const { courseId, userId } = req.body.payload.payment.entity.notes;

//         try {
//             //fulfill the action

//             //find the course and enroll the student in it
//             const enrolledCourse = await Course.findOneAndUpdate({ _id: courseId }, { $push: { studentsEnrolled: userId } }, { new: true });

//             if (!enrolledCourse) {
//                 return res.status(500).json({
//                     success: false,
//                     message: "Course not found"
//                 });
//             }

//             console.log(enrolledCourse);

//             //find the student and add the course to their list enrolled courses mein

//             const enrolledStudent = await User.findOneAndUpdate({ _id: userId }, { $push: { courses: courseId } }, { new: true });
//             console.log(enrolledStudent);

//             //send krdo confirmation mail
//             let course = await Course.find(courseId);
//             const emailBody = courseEnrollmentEmail(course.courseName, enrolledStudent.firstName); // or full name

//             const emailResponse = await mailSender(
//                 enrolledStudent.email,
//                 "You're Successfully Enrolled in a Course!",
//                 emailBody
//             );

//             console.log(emailResponse)
//             res.status(200).json({
//                 success: true,
//                 message: "Signature verified and course added successfully"
//             })
//         } catch (error) {
//             console.log(error)
//             res.status(500).json({
//                 success: false,
//                 message: error.message
//             })
//         }

//     }else{
//         res.status(400).json({
//             success:false,
//             message:"Invalid request"
//         });
//     }
// }

exports.verifySignature = async (req, res) => {
    try {
        const razorpay_order_id = req.body?.razorpay_order_id;
        const razorpay_payment_id = req.body?.razorpay_payment_id;
        const razorpay_signature = req.body?.razorpay_signature;
        const courses = req.body?.courses;
        const userId = req.user.id;
        console.log("1")
        console.log("A"+razorpay_order_id+"B" + razorpay_payment_id+"C" + "D" + razorpay_signature + "E" + courses + "F" + userId)
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses || !userId) {
            return res.status(401).json({
                success: false,
                message: "Payment failed"
            })
        }
        console.log("2")
        let body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(body.toString())
            .digest("hex");
        console.log("3")
        if (expectedSignature === razorpay_signature) {
            await enrollStudent(courses,userId,res);
            return res.status(200).json({
                success: true,
                message: "Payment verified"
            })
        }
        console.log("4")
        return res.status(200).json({
            success: false,
            message: "Payment Failed"
        });
    } catch (error) {
        console.log("ERROR IN VERIFY PAYMENT")
        return res.status(500).json({
            error: error.message
        })
    }
}

// const enrollStudent = async (courses, userId, res) => {
//     try {
//         if (!courses || !userId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please provide data for courses or userId"
//             })
//         }
//         for (const courseId of courses) {
//             try {
//                 const enrolledCourse = await Course.findOneAndUpdate(
//                     { _id: courseId },
//                     { $push: { studentsEnrolled: userId } },
//                     { new: true }
//                 )
//                 if (!enrolledCourse) {
//                     return res.status(400).json({
//                         success: false,
//                         message: "Course was not found"
//                     })
//                 }

//                 const enrolledStudent = await User.findOneAndUpdate(
//                     userId,
//                     {
//                         $push: {
//                             courses: courseId
//                         }
//                     },
//                     {
//                         new: true
//                     }
//                 );

//                 const emailResponse = await mailSender(enrolledStudent.email,
//                     `Successfully Enrolled into ${enrolledCourse.courseName}`,
//                     courseEnrollmentEmail(enrolledCourse.courseName, enrolledStudent.firstName)
//                 )
//                 console.log("Email Sent Successfully")
//             } catch (error) {
//                 return res.status(500).json({
//                     success: false,
//                     error: error.message
//                 })
//             }
//         }
//     } catch (error) {
//        console.log("ERROR IN Enrolled Student")
//     }
// }
const enrollStudent = async (courses, userId) => {
  if (!courses || !userId) {
    return {
      success: false,
      message: "Please provide data for courses or userId"
    };
  }

  for (const courseId of courses) {
    try {
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );
      console.log("5")
      if (!enrolledCourse) {
        return {
          success: false,
          message: "Course was not found"
        };
      }
      console.log("//BEFORE-----COURCE PROGRESS CREATED----//")
      const courseProgress = await CourseProgress.create({
        courseID:courseId,
        userId:userId,
        completedVideos:[]
      })
      console.log("//AFTER-----COURCE PROGRESS CREATED----//")
      const enrolledStudent = await User.findOneAndUpdate(
        { _id: userId },
        { $push: { 
          courses: courseId,
          courseProgress: courseProgress._id
       } },
        { new: true }
      );
      console.log("5")
      await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(enrolledCourse.courseName, enrolledStudent.firstName)
      );
      console.log("Email Sent Successfully");
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  return {
    success: true,
    message: "Student enrolled successfully"
  };
};

exports.sendPaymentSuccessEmail = async (req, res) => {
    try {
        const { orderId, paymentId, amount } = req.body;
        const userId = req.user.id;
        if (!orderId || !paymentId || !amount || !userId) {
            return res.status(400).json({
                success: false,
                message: "Please Provide all the fields"
            })
        }
        const enrolledStudent = await User.findById({_id:userId});
        console.log(enrolledStudent)
        await mailSender(
            enrolledStudent?.email,
            'Payment Received',
            paymentSuccessEmail(`${enrolledStudent.firstName}`,
                amount / 100, orderId, paymentId)
        )
    } catch (error) {
        console.log("error in sending mail", error)
        return res.status(500).json({
            success: false,
            message: "Could not send email"
        })
    }
}