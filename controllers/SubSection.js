const SubSection = require('../models/SubSection')
const Section = require('../models/Section')
const { uploadImageTocloudinary } = require('../utils/imageUploader')
exports.createSubSection = async (req, res) => {
    try {
        //fetch data
        console.log("BODY:", req.body);
        console.log("FILES:", req.files);
        const { sectionId, title, description } = req.body;
        //extract files/videos
        console.log("HIIO")
        const file = req.files.video;
        console.log("HyyyIO")
        console.log(sectionId + title + description + file)
        //validate data
        if (!sectionId || !title || !description || !file) {
            return res.status(400).json({
                success: false,
                message: "Fill all entries carefully"
            })
        }
        //upload video to cloudinary
        const uploadDetails = await uploadImageTocloudinary(file, process.env.FOLDER_NAME);
        //create a sub section
        const subSectionDetails = await SubSection.create({
            title: title,
            timeDuration: `${uploadDetails.duration}`,
            description: description,
            videoUrl: uploadDetails.secure_url,
        })
        //update section with sub section objectid
        const updatedSection = await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
                $push: {
                    subSection: subSectionDetails._id,
                }
            },
            { new: true }).populate("subSection").exec();
        //HW:log updated section here after adding populate query

        //send response
        res.status(200).json({
            success: true,
            message: "SubSection updated Successfully",
            data: updatedSection
        })
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            success: false,
            message: "Failure to create Subsection"
        })
    }
}

//update SubSection & delete SubSection
exports.updateSubSection = async (req, res) => {
    //need a testing that fetch the videoFile to reupload another video
    try {
        const { sectionId, subSectionId, title, description } = req.body
        const subSection = await SubSection.findById(subSectionId)

        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            })
        }

        if (title !== undefined) {
            subSection.title = title
        }

        if (description !== undefined) {
            subSection.description = description
        }
        if (req.files && req.files.video !== undefined) {
            const video = req.files.video
            const uploadDetails = await uploadImageTocloudinary(
                video,
                process.env.FOLDER_NAME
            )
            subSection.videoUrl = uploadDetails.secure_url
            subSection.timeDuration = `${uploadDetails.duration}`
        }

        await subSection.save()

        // find updated section and return it
        const updatedSection = await Section.findById(sectionId).populate(
            "subSection"
        )

        console.log("updated section", updatedSection)
        //return response
        res.status(200).json({
            success: true,
            message: "SubSection updated Successfully",
            data: updatedSection
        })
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            success: false,
            message: "Failure to Update Subsection"
        })
    }
}

// exports.deleteSubSection = async (req, res) => {
//     try {
//         //fetch data
//         const { subSectionId , sectionId} = req.body;
//         //validation
//         if (!subSectionId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Enter the all entries correct"
//             })
//         }
//         //find the SubSection and check it exist or not
//         const subSectionDetails = await SubSection.findById(subSectionId);
//         if (!subSectionDetails) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Subsection is not found"
//             })
//         }
//         //firstofall we have to remove the field from Subsection
//         const updatedSection = await Section.findOne({ subSection: subSectionId }, { $pull: { subSection: subSectionId } }, { new: true });
//         //find and delete
//         await SubSection.findByIdAndDelete(subSectionId);
//         //send response
//         res.status(200).json({
//             success: true,
//             message: "SubSection deleted Successfully",
//             data: updatedSection
//         })
//     } catch (error) {
//         console.error(error);
//         return res.status(400).json({
//             success: false,
//             message: "Failure to delete Subsection"
//         })
//     }
// }

exports.deleteSubSection = async (req, res) => {
  try {
    console.log("REQ BODY");
    const { subSectionId, sectionId } = req.body
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    )
    const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" })
    }

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    )

    return res.json({
      success: true,
      message: "SubSection deleted successfully",
      data: updatedSection,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    })
  }
}