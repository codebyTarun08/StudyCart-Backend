//creating instance of cloufinary version2
const cloudinary = require('cloudinary').v2;

//creating a method to upload the file on cloudinary
exports.uploadImageTocloudinary = async(file,folder,height,quality)=>{
    const options ={folder};
    if(height){
        options.height=height;
    }
    if(quality){
        options.quality=quality;
    }
    options.resource_type="auto";
    return await cloudinary.uploader.upload(file.tempFilePath,options)
}

