const RatingAndReview=require('../models/RatingAndReview')
const Course=require('../models/Course')
const mongoose = require('mongoose');

exports.createRating=async(req,res)=>{
    try {
        //get the userid
        const userId = req.user.id;
        //fetch the data from request body
        const {rating,review,courseId} = req.body;
        //check the user is enrolled or not
        console.log(userId+" "+courseId)
        const courseDetails=await Course.findOne(
            {_id:courseId,
               studentsEnrolled:{$elemMatch:{$eq:userId}},
            }
        );
        //validation
        if(!courseDetails){
            return res.status(404).json(
                {
                    success:false,
                    message:`Student ${userId} is not enrolled in the course ${courseId}`
                }
            );
        }
        console.log("AR")
        //check the user already reviewed or not
        const alreadyReview = await RatingAndReview.findOne({user:userId,course:courseId});
        console.log(alreadyReview)
        if(alreadyReview){
            return res.status(403).json(
                {
                    success:false,
                    message:`User ${userId} already reviewed the course ${courseId}`
                }
            );
        }
        //create rating and review
        const ratingReview=await RatingAndReview.create({rating,review,course:courseId,user:userId});
        //update the course with rating and review
        console.log(ratingReview)
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            {_id:courseId},
            {
                $push:{
                    ratingAndreviews:ratingReview._id,
                }
            },
            {new:true}
        )
        console.log("Updated Course Details:",updatedCourseDetails);
        //sent the response  
        res.status(200).json({
            success:true,
            message:"Rating and Review successfully uploaded",
            ratingReview
        })
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            success:false,
            message:"Failed to upload rating and Review"
        })
    }

}

//get Average Rating
exports.getAverageRating=async(req,res)=>{
    try {
        //get the course id
        const courseId = req.body.courseId;
        //calculate average rating
        const result = await RatingAndReview.aggregate(
            {
                $match:{
                    course: new mongoose.Types.ObjectId(String(courseId))
                }
            },
            {
                $group:{
                    _id:null,
                    averageRating: {$avg:"$rating"}
                }
            }
        )
         //return rating
        if(result.length>0){
            return res.status(200).json({
                success:true,
               averageRating:result[0].averageRating,
            })
        }else{
            return res.status(200).json({
                success:true,
                message:"average rating is 0 mo ratings are given till now",
               averageRating:0,
            })
        }
       
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            success:false,
            message:error.message
        })
    }
}

//get all ratingReview

exports.getAllRatingReviews = async(req,res)=>{
    try{
        const allReviews=await RatingAndReview.find({})
                                         .sort({rating:"desc"})
                                         .populate({
                                            path:"user",
                                            select:"firstName lastName email image"
                                         })
                                         .populate({
                                            path:"course",
                                            select:"courseName"
                                         }).exec();
        return res.status(200).json({
            success:true,
            message:"all reviews return successfully",
            allReviews
        })
    }catch(error)
    {
        console.log(error);
        return res.status(200).json({
                success:false,
                message:error.message
        })
    }
}
//get reviews of course
exports.getCourseRatingReviews = async(req,res)=>{
    try{
        const {courseId} = req.body;
        const allCourseReviews=await RatingAndReview.find({_id:courseId})
                                         .sort({rating:"desc"})
                                         .populate({
                                            path:"user",
                                            select:"firstName lastName email image"
                                         })
                                         .populate({
                                            path:"course",
                                            select:"courseName"
                                         }).exec();
        return rs.status(200).json({
            success:true,
            message:"Course reviews return successfully",
            allCourseReviews
        })
    }catch(error)
    {
        console.log(error);
        return res.status(200).json({
                success:false,
                message:error.message
        })
    }
}