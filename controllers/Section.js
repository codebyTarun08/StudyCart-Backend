const Section = require('../models/Section');
const Course = require('../models/Course');
const SubSection = require("../models/SubSection");

//creating a section
exports.createSection = async (req, res) => {
    try {
        //fetch data
        const { sectionName, courseId } = req.body;
        //validate data
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Fill all entries carefully!"
            });
        }
        //entry in db(create section)
        const newSection = await Section.create({
            sectionName
        });
        //update in course
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {//using push operator to insert the field of newly created section in courseContent
                    courseContent: newSection._id,
                }
            },
            { new: true }).populate({
                path: "courseContent",
                populate: {
                    path: "subSection"
                }
            }).exec();
        //HW: use populate to replace sections/subsections both in the updatedDetails

        //return response
        return res.status(200).json({
            success: true,
            message: "Section is created Succesfully",
            updatedCourseDetails
        })
    } catch (error) {
        console.error("Error in creation of section: ", error);
        return res.status(500).json({
            success: false,
            message: "Failure in creation of section",
            error: error.message
        })
    }
}

//updating a section
exports.updateSection = async (req, res) => {
    try {
        //fetch the data
        console.log("US")
        const { sectionName, sectionId, courseId } = req.body;
        console.log("AUS")
        //data validation
        if (!sectionName || !sectionId || !courseId) {
            return res.status(401).json({
                success: false,
                message: "Fill all entries carefully!"
            });
        }
        //find and update using sectionId
        const section = await Section.findByIdAndUpdate(
            sectionId,
            {
                sectionName
            },
            { new: true }
        );

        const course = await Course.findById(courseId)
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec();
        //return response
        res.status(200).json({
            success: true,
            message: "Section Updated Successfully",
            data: course,
        })
    } catch (error) {
        console.error("Error in updation of section: ", error);
        return res.status(500).json({
            success: false,
            message: "Failure to update section"
        })
    }
}

//deletion of section
// exports.deleteSection = async (req, res) => {
//     try {

//         const { sectionId, courseId } = req.body;
//         await Course.findByIdAndUpdate(courseId, {
//             $pull: {
//                 courseContent: sectionId,
//             }
//         })
//         const section = await Section.findById(sectionId);
//         console.log(sectionId, courseId);
//         if (!section) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Section not Found",
//             })
//         }

//         //delete sub section
//         await SubSection.deleteMany({ _id: { $in: section.subSection } });

//         await Section.findByIdAndDelete(sectionId);

//         //find the updated course and return 
//         const course = await Course.findById(courseId).populate({
//             path: "courseContent",
//             populate: {
//                 path: "subSection"
//             }
//         })
//             .exec();

//         res.status(200).json({
//             success: true,
//             message: "Section deleted",
//             data: course
//         });
//         //     //fetch Id - assuming that we are sending ID in params
//         //     const {id:sectionId} = req.params;//if we sending id in param.
//         //     //const {sectionId}=req,body; If we sending the id in request body
//         //     const {courseId} = req.body;

//         //     console.log(sectionId)
//         //     console.log(courseId)
//         //    //validation
//         //     if(!sectionId || !courseId){
//         //         return res.status(400).json({
//         //             success:false,
//         //             message:"Fill all entries"
//         //         })
//         //     }
//         //     //find and delete the section
//         //     const section = await Section.findById(sectionId);
//         //     //validate the section is exist or not 
//         //     if(!section){
//         //         return res.status(404).json({
//         //             success:false,
//         //             message:"Section not found."
//         //         })
//         //     }
//         //     //if we want to delete the section so first of all we have remove it in course from courseContent
//         //     const updatedCourse = await Course.findByIdAndUpdate(courseId,
//         //                                               {$pull:{courseContent:sectionId}}
//         //                                               ,{new:true})
//         //                                               .populate({
//         //                                                 path: "courseContent",
//         //                                                 populate: {
//         //                                                 path: "subSection"
//         //                                             }})

//         //     //validation of course means if given courseId is present or not
//         //     if(!updatedCourse){
//         //         return res.status(404).json({
//         //             success:false,
//         //             message:"Course not found"
//         //         })
//         //     }
//         //     //now find the section and delete
//         //     await Section.findByIdAndDelete(sectionId);
//         //     //TODO: Do we need to delete the entry from course Schema (We check in Testing)

//         //     //return response
//         //     res.status(200).json({
//         //         success:true,
//         //         message:"Section deleted Successfully",
//         //         updatedCourse
//         //     })
//     } catch (error) {
//         console.error("Error in deletion of section: ", error);
//         return res.status(500).json({
//             success: false,
//             message: "Failure to delete section",
//         })
//     }
// }
exports.deleteSection = async (req, res) => {
	try {

		const { sectionId, courseId }  = req.body;
		await Course.findByIdAndUpdate(courseId, {
			$pull: {
				courseContent: sectionId,
			}
		})
		const section = await Section.findById(sectionId);
		console.log(sectionId, courseId);
		if(!section) {
			return res.status(404).json({
				success:false,
				message:"Section not Found",
			})
		}

		//delete sub section
		await SubSection.deleteMany({_id: {$in: section.subSection}});

		await Section.findByIdAndDelete(sectionId);

		//find the updated course and return 
		const course = await Course.findById(courseId).populate({
			path:"courseContent",
			populate: {
				path: "subSection"
			}
		})
		.exec();

		res.status(200).json({
			success:true,
			message:"Section deleted",
			data:course
		});
	} catch (error) {
		console.error("Error deleting section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};