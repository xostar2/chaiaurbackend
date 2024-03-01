import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import  Jwt  from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefereshToken =async (userId)=>{
    try{
        const user = await User.findOne(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken() //these you only generated in this function we dont have access of these token outside the function


        user.refreshToken=refreshToken
        await user.save({validateBeforSave:false});//whenever we do save some fields are kick in like password so we handel it in that way

        //saving in database

        return {accessToken,refreshToken}

    }
    catch(error){
        throw new ApiError(500,"something went wrong while generating referesh and access token")
    }
}



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

const loginUser= asyncHandler(async (req,res)=>{
     /*
        1. req body -> data gather
        2. userame or email
        3. find the user
        4. match the password if userfound
        5. if password match then generate accesstoken and refreshtoken
        6. send cookies 
        7. send response that user login successfully
     */

    const {email,username,password}=req.body
    if(!(username || email)) {
        throw new ApiError(400,"username or password is required")
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })//ya to email find kardo ya username find kardo

    if(!user){
        throw new ApiError(400,"user not found");
    }// if user not exist in DB

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401,"invalid user credentials");
    }// if user not exist in DB

    const {accessToken,refrehsToken}=await generateAccessAndRefereshToken(user._id)  //destructure the return value

    // what infromation we want to send user
    
    const loggedInUser=await User.findById(user._id).
    select("-password -refreshToken")

    //now here start cookkie part

    const options = {    //kust an object
        httpOnly : true,  //by this only server can modify not by frontend
        secure : true    //security steps of cookies
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refrehsToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refrehsToken   // if user want to save accesstoken and refresh token in local server

            },
            "User logged in successfully " //message
        )
    )

})

const logoutUser = asyncHandler(async(req,res)=>{

    await User.findByIdAndUpdate(
        req.user._id, //btao ki find karna kese he
        {
                $set:{
                    refreshToken:undefined
                }
        },//what to find
        {
            new :true //new bana diya
        }

    )
    
    const options = {    //kust an object
        httpOnly : true,  //by this only server can modify not by frontend
        secure : true    //security steps of cookies
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200 ,{} ,"User Logged Out"))
})

//we using it when working with front end and someone eant to it want refresh token from front end to login user without email and password

const refreshAccessToken = asyncHandler (async (req ,res)=>{

    const inncomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!inncomingRefreshToken){
        throw new ApiError(401,"unauthrized request")
    }

    try {
        const decodedToken=Jwt.verify(
            inncomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
    
        )//first token second secreat key  || not necessary that token always have payload thing
    
        const user = await User.findById(decodedToken?._id)
        if(user){
            throw new ApiError(401,"invalid refresh token")//database token
        }
    
        if(inncomingRefreshToken != user?.refrehsToken){
            throw new ApiError(401,"Refresh token is expired or used")
    
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
        const {accessToken,newrefreshToken}=await generateAccessAndRefereshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:newrefreshToken},
                "Access token refreshed"
            )
        )
    
    } catch (error) {

        throw new ApiError(401,error?.message|| "INvalid refresh Token")  
        // now we have to make a refresh token end point so when user try to check refresh token then frntend eng can varify that from that  end point
    }


})

const changeCurrentPassword = asyncHandler(async (req,res)=>{
       const {oldPassword,newPassword}=req.body

       const user = await User.findById(req.user?._id)
       const isPasswordCorrect= await user.isPasswordCorrect(oldPassword)

       if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid olfd password")
       }

       user.password=newPassword  //here we changing the password
       await user.save({validateBeforSave:false})//here we saving the password and doing validation false before it start  validating every field

       return res
       .status(200)
       .json(new ApiResponse(200,{},"password change"))

})

const getCurrentUser = asyncHandler(async (req ,res)=>{
    return  res
    .status(200)
    .json(new ApiResponse(200,req.user,"current userfetched successfully"))
})

const updateAccountDetails = asyncHandler(async (req,res)=>{
    const {fullName,email}= req.body

    if(!fullName ||!email){
        throw new ApiError(400,"all files are required")
    }
    const user= await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                fullName:fullName,
                email:email
            }
        },//here come mongo db operator,
        {new:true}//updated informatuon return 
        ).select("-password")

        return res
        .status(200)
        .json(new ApiResponse(200,user,"Account details update successfully"))
})

//now how to update files properly 

const updateUserAvatar = asyncHandler( async (req,res)=>{

    const avatarLocalPath=req.file?.path      //when some information we can't get from req.body then we use req.files to get things that are we uploaded or something

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }

    //we update our local saved avatar with local path on cloudinary

    const avatar= await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            //for update we use $set: operator
            $set:{
                avatar:avatar.url
            }
        },
        {new :true},

    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"avatar updated successfully"),
        
    )

})

const updateUserCoverImage = asyncHandler( async (req,res)=>{

    const coverImageLocalPath=req.file?.path      //when some information we can't get from req.body then we use req.files to get things that are we uploaded or something

    if(!coverImageLocalPath){
        throw new ApiError(400,"coverImage File is missing")
    }

    //we update our local saved CoverImage with local path on cloudinary

    const coverImage= await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading on cover image")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            //for update we use $set: operator
            $set:{
                coverImage:coverImage.url
            }
        },
        {new :true},

    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"coverimage updated successfully"),

    )

})

const getUserChannalProfile =asyncHandler(async (req,res)=>{
       const {username} = req.params
       if(!username?.trim()){
        throw new ApiError(400,"usernameis missing in getuserchannal");
       }

       //User.find({username})

       const channel=await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
                 
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelSubscribedtoCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if: { $in: [req.user?._id,"$subscribers"]},
                        then: true,
                        else:false
                    }
                }
             }
            
        },
        {
            $project:{
                fullname:1,
                username:1,
                subscribersCount:1,
                channelSubscribedtoCount:1,
                isSubscribed:1



            }
        }
       ])

       if(channel?.length){
        throw new ApiError(404,"channel not exist");
       }

       return res
       .status(200)
       .json(
        new ApiResponse(200,channel[0],"userchannel fetched successfully")
       )
})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannalProfile

}