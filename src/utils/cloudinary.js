/*
In this section we do some steps 
1 we take files from server uplod to server
2 save to a local server or database or system
we can directtly upload also but in production base code we 
do 2 way upload
3 we upload the data on cloudinary 
and fourth we remove the data or file from server
*/

import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"//fs is filesystem librery
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});


const uploadOnCloudinary = async (localFilePath)=>{
    try{
        if(!localFilePath)return null;

        const response= await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto",
        })
        //file has been uploaded successfully

        //console.log("file is uploaded succesfully",response.url);
        fs.unlinkSync(localFilePath)
        return response

    } catch(error){
       fs.unlinkSync(localFilePath)//remove the locally saved temporary file as the upload operator got failed 
       return null;
    }
}


export {uploadOnCloudinary }







//this one way to upload files on cloudinary

// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });

