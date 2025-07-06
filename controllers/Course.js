const { uploadImageTocloudinary } = require('../utils/imageUploader');
const Course = require('../models//Course');
const Category = require('../models/Category');
const User = require('../models/User');
const CourseProgress = require('../models/CourseProgress')
require("dotenv").config();
const Section = require('../models/Section')
const SubSection = require('../models/SubSection')
const {convertSecondsToDuration} = require("../utils/secToDuration")
//route handler for creating a course
exports.createCourse = async (req, res) => {
    try {
        //fetch the data
        const { courseName, courseDescription, whatYouWillLearn, price, tag:_tag ,category,status,instructions:_instructions} = req.body;
        //get thumbnail: use the thumbnailImage in postman
        const thumbnail = req.files.thumbnailImage;
            // Convert the tag and instructions from stringified Array to Array
        const tag = JSON.parse(_tag)
        const instructions = JSON.parse(_instructions)
        //validation
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !category) {
            return res.status(401).json({
                success: false,
                message: "All fields are required"
            })
        }

        //check for instructor is exist in our database 
        const userId = req.user.id; // this method is used because user already loggged in as instructor and we passed a payload to user
        const instructorDetails = await User.findById(userId);
        //Todo : userid or instructorid is same or not // answer same

        //validate instructor
        if (!instructorDetails) {
            return res.status(401).json({
                success: false,
                message: "User details Not Found"
            });
        }

        //check given tag is valid or not
        const categoryDetails = await Category.find({_id:category});
        if (!categoryDetails) {
            return res.status(401).json({
                success: false,
                message: "Category details Not Found"
            });
        }

        //upload image to cloudinary
        const thumnailImage = await uploadImageTocloudinary(thumbnail, process.env.FOLDER_NAME);

        //create an entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouwillLearn: whatYouWillLearn,
            price,
            tag:tag,
            category: categoryDetails._id,
            thumbnail: thumnailImage.secure_url,
            status:"Draft", //setting a status as draft while creating the course
            instructions,
        });

        //add the new course to the user schema of Instructor
        await User.findByIdAndUpdate(
            { _id: instructorDetails._id },
            {
                $push: {
                    courses: newCourse._id
                }
            },
            { new: true },
        );

        //Update the Category schema
        const categoryDetails2=await Category.findByIdAndUpdate(
            { _id: category },
            {
                $push: { //using a push operator to insert a field in mongodb Document
                    courses: newCourse._id
                }
            },
            { new: true },
        );
         console.log("Updated Category ---->",categoryDetails2)
        //return response
        return res.status(200).json(
            {
                success: true,
                message: "Course Created Successfully",
                data: newCourse
            }
        );

    } catch (error) {
        console.error("Error in creation new course", error);
        return res.status(500).json(
            {
                success: false,
                message: "Failed to create course",
                error: error.message
            }
        )
    }
}

//get All courses
exports.showAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find({}, {
            couseName: true,
            price: true,
            thumbnail: true,
            instructor: true,
            ratingAndreviws: true,
            studentsEnrolled: true,
        }).populate("instructor").exec();
        //return response
        return res.status(200).json({
            success: true,
            message: "Data for all courses fetched successfully",
            data: allCourses
        });

    } catch (error) {
        console.error("Failed to load courses", error);
        return res.status(500).json(
            {
                success: false,
                message: "Courses not fetched",
                error: error.message
            }
        )
    }
}


//get all details of one particular course
exports.getCourseDetails = async (req, res) => {
    try {
        //fetch the courseId
        const { courseId } = req.body;
        //find the course details
        const courseDetails = await Course.findById(
            courseId)
            .populate(
                {
                    path: "instructor",
                    populate: "additionalDetails"
                }
            )
            .populate(
              //  "ratingAndreviews"
            )
            .populate("category")
            .populate({
                path: "courseContent",
                populate: {
                path: "subSection"
            }})
            .exec();
        
            //validation
            if(!courseDetails){
                return res.status(400).json(
                    {
                        success:false,
                        message:`Could not find the course with the ${courseId}`
                    }
                );
            }

            //send response
            return res.status(200).json(
                {
                    success:true,
                    message:"Course Details fetched successfully",
                    data:courseDetails
                }
            );
    }catch (error) {
        console.log(error)
        return res.status(500).json(
            {
                success:false,
                message:"Could not fetch the course"
            }
        );

    }
} 


// Edit Course Details
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const updates = req.body
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }

    // If Thumbnail Image is found, update it
    if (req.files) {
      console.log("thumbnail update")
      const thumbnail = req.files.thumbnailImage
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      )
      course.thumbnail = thumbnailImage.secure_url
    }

    // Update only the fields that are present in the request body
    Object.keys(updates).forEach((key) => {
    if (key === "tag" || key === "instructions") {
        course[key] = JSON.parse(updates[key])
    } else {
        course[key] = updates[key]
    }
    })

    await course.save()

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndreviws")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id
    // console.log("X")
    // console.log(courseId);
    // console.log(userId);
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndreviws")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()


    console.log(courseDetails)

    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })

    console.log("courseProgressCount : ", courseProgressCount)

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)


     // totalDuration,
        // completedVideos: courseProgressCount?.completedVideos
        //   ? courseProgressCount?.completedVideos:[],
    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos:courseProgressCount?.completedVideos ? courseProgressCount?.completedVideos:[],
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id

    // Find all courses belonging to the instructor
    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 })

    // Return the instructor's courses
    res.status(200).json({
      success: true,
      data: instructorCourses,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
}

// Delete the Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body

    // Find the course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Unenroll students from the course
    const studentsEnrolled = course.studentsEnrolled
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      })
    }

    // Delete sections and sub-sections
    const courseSections = course.courseContent
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId)
      if (section) {
        const subSections = section.subSection
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId)
        }
      }

      // Delete the section
      await Section.findByIdAndDelete(sectionId)
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId)

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}