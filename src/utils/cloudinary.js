import { v2 as cloudinary } from 'cloudinary';
import { response } from 'express';
import fs from "fs"
import { ApiError } from './ApiError.js'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null
      //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath,
      {
        resource_type: "auto"
      },
      // file has been uploaded successfull
      function (error, result) { console.log(result); });
  fs.unlinkSync(localFilePath)
    return response
  } catch (error) {
    fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed

    return null
  }
}

const deleteFromCloudinary = async (cloudUrl) =>{
  try {
    if (!cloudUrl) return null
    const deleteOldAvatar =  await cloudinary.uploader.destroy(cloudUrl);
    return deleteOldAvatar
  } catch (error) {
    throw new ApiError(404,"ERR")
  }
}


export { uploadOnCloudinary,deleteFromCloudinary }