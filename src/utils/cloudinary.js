import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"


cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})
 
 const uploadOnCloudinary  = async (localFilePath) => {
    try {
        if(!localFilePath) return null

        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resourse_type:"auto"
        })
        console.log("file has been uplaoded", response.url)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove locally avd temp file as upload operation got failed
        return null
    }
 }

 export {uploadOnCloudinary};