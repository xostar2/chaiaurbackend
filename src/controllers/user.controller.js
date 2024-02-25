import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

import { ApiResponse } from "../utils/ApiResponse.js";
//user register 
const registerUser =asyncHandler( async (req,res)=>{
    //[1]:get user details from frontend===what details  i will take it depends apone what models i make for user
    //[2]: validation on formate and empty
    //[3]: check if already user exist username and email
    //[4]: check for images ,check for avtar required check
    //[5]: upload them to cloudinary,check avatr 
    //[6]: check on multer and cloudiunary that image save or not and url give or not
    //[7] create user object - create entry in db (DB calls)
    //[8]: remove password and refreshtoken field from response
    //check for response and user creation
    // return response if user create and send error if error

    const {username,fullName,email,password}=req.body

    console.log(req.body)

    console.log("email:",email);
    // if(fullname===""){
    //     throw new ApiError(400,"fullname is required")
    // }
    if(//some is used here a array method some and
        
    [fullName,email,username,password].some((field)=>{
        return field?.trim()===""
    })
    ){
        throw new ApiError(400,"all Fields are required")
    }

    //user exist or not
    //user is mongodb object
    const existedUser= await User.findOne({
        // now here we check that both email and user name exist or not

        $or:[ { username } , { email }]//it give you first match who hold this
    })

    if(existedUser){
        throw new ApiError(409,"User with Email or username already exist")
    }
    
    const avatarLocalPath=req.files?.avatar[0]?.path 

    //console.log(avatarLocalPath)
    // const coverImageLocalPath=req.files?.coverImage[0]?.path  becase it giveing us an error 
     
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path
    }

    
    if(!avatarLocalPath){
        throw new ApiError(400,
            `avatar file is required path is :${avatarLocalPath}`
            
        )
    }
    //req.files multer give us and we have to do it optional chaing bcz may we multer give us that method or not we dont know really

   //upload image of cloudinary 

   const avatar=await uploadOnCloudinary(avatarLocalPath);

   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

   //check avatar

   if(!avatar){
    throw new ApiError(400,"Avatar file is  required")
   }

   //entry in data base making an object

   const user=await User.create({
    fullName,
    avatar:avatar.url,
    coverImage: coverImage?.url || "", //in this we not validate this so we have to take care if we dont validate it before
    password,
    email,
    username: username.toLowerCase()
})

const createduser=await User.findById(user._id).select(
    "-password -refreshToken"
)// this select is used to remove those section that we dont want to show response to user or other thats  wht remove it here and that is the  syntex of that

if(!createduser){
    throw new ApiError(500,"something went wrong while registering the user")
}

//now we want to send response if user is created so for that reason we use Apiresponse

return res.status(201).json(
    new ApiResponse(
        200,
        createduser,
        "User registered succesfully"
    )
)



})

export {registerUser}