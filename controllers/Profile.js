const Profile = require('../models/Profile')
const User = require('../models/User')
const { uploadImageTocloudinary } = require('../utils/imageUploader')
const { convertSecondsToDuration } = require('../utils/secToDuration')
const CourseProgress = require("../models/CourseProgress")
const Course = require("../models/Course")
const mongoose = require("mongoose")
require("dotenv").config();

exports.updateProfile = async (req, res) => {
    try {
        //fetch the data
        const { gender, dateOfBirth = "", about = "", contactNumber } = req.body
        //get userId
        const id = req.user.id;
        //validate the data
        if (!gender || !id || !contactNumber) {
            return res.status(400).json({
                success: false,
                message: "Fill all entries carefully"
            })
        }
        //find the user and update the profileDetails
        const userDetails = await User.findById(id)
        //fetching the profileId in User schema 
        const profileId = userDetails.additionalDetails;

        const profileDetails = await Profile.findByIdAndUpdate(profileId);
        //update details
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        //save the object in database
        await profileDetails.save();
        //return response
        res.status(200).json({
            success: true,
            message: "Profile updated Successfully",
            profileDetails,
            userDetails
        })
    } catch (error) {
        console.error("Failure to update profile: ", error);
        return res.status(500).json({
            success: false,
            message: "Error in updation of profile",
            error: error.message
        })
    }
}

//deleteAccount
exports.deleteAccount = async (req, res) => {
    try {
        //Fetch userID
        const id = req.user.id;
        //validation
        const userDetails = await User.findById(id);

        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User Not found"
            })
        }

        // Agar user exist karta hai toh pehle uski profile se data ko delete karo phir uski User se data delete karo
        //delete Profile
        await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

        //TODO:HW- unenroll User from all enrolled courses
        //delete User
        await User.findByIdAndDelete({ _id: id });
        //TODO:HW- unenroll User from all enrolled courses
        //return response 
        res.status(200).json({
            success: true,
            message: "Account deleted Successfully",
        })

    } catch (error) {
        console.error("Failure to update profile: ", error);
        return res.status(500).json({
            success: false,
            message: "Error in updation of profile",
            error: error.message
        })
    }
}


exports.getAllUserDetails = async (req, res) => {
    try {
        //get id
        const id = req.user.id;
        //validation and get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        //return response
        res.status(200).json({
            success: true,
            message: "Fetched User details Successfully",
            data: userDetails
        })
    } catch (error) {
        console.error("Failure to fetching details of user: ", error);
        return res.status(500).json({
            success: false,
            message: "Error in fetching user details",
            error: error.message
        })
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
        //fetching the id from the user (already logged in)
        const userId = req.user.id;
        //fecthing the profile image
        const imageProfile = req.files.displayPicture;

        //validation
        if (!userId || !imageProfile) {
            return res.status(400).json({
                success: false,
                message: "Fill all entries"
            })
        }

        //uploading it to cloudinary
        const imageUrl = await uploadImageTocloudinary(imageProfile, process.env.FOLDER_NAME);

        //updating the profile by inserting the new profile image url in the database
        const updatedProfile = await User.findByIdAndUpdate({ _id: userId }, { image: imageUrl.secure_url }, { new: true });

        //return response
        res.status(200).json({
            success: true,
            message: "Image updated Successfully",
            data: updatedProfile
        })

    } catch (error) {
        console.error("Failure to update profile: ", error);
        return res.status(500).json({
            success: false,
            error: error.message,
        })
    }
}

exports.getEnrolledCourses = async (req, res) => {
    try {
        //fetch the id 
        const userId = req.user.id;
        console.log("UserID", userId)
        //find the user 
        let userDetails = await User.findOne({ _id: userId })
            .populate({
                path: "courses",
                populate: {
                    path: "courseContent",
                    populate: {
                        path: "subSection",
                    },
                },
            }).exec();
        console.log("USERDETALIS", userDetails)
        userDetails = userDetails.toObject()
        var SubsectionLength = 0
        for (var i = 0; i < userDetails.courses.length; i++) {
            let totalDurationInSeconds = 0
            SubsectionLength = 0
            for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
                totalDurationInSeconds += userDetails.courses[i].courseContent[
                    j
                ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
                userDetails.courses[i].totalDuration = convertSecondsToDuration(
                    totalDurationInSeconds
                )
                SubsectionLength +=
                    userDetails.courses[i].courseContent[j].subSection.length
            }
            let courseProgressCount = await CourseProgress.findOne({
                courseID: userDetails.courses[i]._id,
                userId: userId,
            })
            console.log("ABC", courseProgressCount)
            courseProgressCount = courseProgressCount?.completedVideos.length
            if (SubsectionLength === 0) {
                userDetails.courses[i].progressPercentage = 100
            } else {
                // To make it up to 2 decimal point
                const multiplier = Math.pow(10, 2)
                userDetails.courses[i].progressPercentage =
                    Math.round(
                        (courseProgressCount / SubsectionLength) * 100 * multiplier
                    ) / multiplier
            }
        }
        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: `could not find user with id ${userId}`
            })
        }
        //extract the course details from fetched user
        const enrolledCourse = userDetails.courses;
        //return response
        res.status(200).json({
            success: true,
            message: "All enrolled courses fetch successfully",
            data: enrolledCourse
        })
    } catch (error) {
        console.error("Failure to fetch enrolled course: ", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}



exports.instructorDashboard = async (req, res) => {
    try {
        const courseDetails = await Course.find({
            instructor: req.user.id,
        })
        console.log(courseDetails)
        const courseData = courseDetails.map((course) => {
            const totalStudentsEnrolled = course.studentsEnrolled.length
            const totalAmountGenerated = totalStudentsEnrolled * course.price

            // Create a new object with the additional fields
            const courseDataWithStats = {
                _id: course._id,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                // Include other course properties as needed
                totalStudentsEnrolled,
                totalAmountGenerated,
            }
            console.log(courseDataWithStats)
            return courseDataWithStats
        })

        res.status(200).json({ courses: courseData })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
}
