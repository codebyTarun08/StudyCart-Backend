const express= require('express');
const router = express.Router();

const {  
  createCourse,
  showAllCourses,
  getCourseDetails,
  getFullCourseDetails,
  editCourse,
  getInstructorCourses,
  deleteCourse} = require('../controllers/Course')
const {auth,isStudent,isAdmin,isInstructor}=require('../middlewares/auth')
const {createCategory,showAllCategories,categoryPageDetails}=require('../controllers/Category')

const {createRating,getAverageRating,getAllRatingReviews,getCourseRatingReviews} =require('../controllers/RatingAndReview')

const {
  updateCourseProgress
} = require('../controllers/CourseProgress')

const {createSection,updateSection,deleteSection}=require('../controllers/Section')

const {createSubSection,updateSubSection,deleteSubSection}=require('../controllers/SubSection')

router.post('/createCourse',auth,isInstructor,createCourse);

router.post('/addSection',auth,isInstructor,createSection);
router.post('/updateSection',auth,isInstructor,updateSection)
router.post('/deleteSection',auth,isInstructor,deleteSection)

router.post('/addSubSection',auth,isInstructor,createSubSection);
router.post('/updateSubSection',auth,isInstructor,updateSubSection)
router.delete('/deleteSubSection',auth,isInstructor,deleteSubSection)

router.get('/getAllcourses',showAllCourses);
router.post('/getCourseDetails',getCourseDetails);
// Edit Course routes
router.post("/editCourse", auth, isInstructor, editCourse)
// Get Details for a Specific Courses
router.post("/getFullCourseDetails", auth, getFullCourseDetails)
// Get all Courses Under a Specific Instructor
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses)
// Delete a Course
router.delete("/deleteCourse", deleteCourse)
router.post("/updateCourseProgress",auth,isStudent,updateCourseProgress)

router.post('/createCategory',auth,isAdmin,createCategory)
router.get('/showAllCategories',showAllCategories)
router.post('/getCategoryPageDetails',categoryPageDetails)


router.post('/createRating',auth,isStudent,createRating)
router.put('/getAverageRating',getAverageRating)
router.get('/getReviews',getAllRatingReviews)
router.get('/getCourseReviews',getCourseRatingReviews)
//export the router
module.exports= router;