import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { jwt } from "jsonwebtoken";
import { User } from "../models/user.model";


        // some time it can be use like this (req, _ , next)
export const verifyJWT = asyncHandler(async (req,res,next)=>{

    try {
        const token =req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")      //Authorization : bearer <token> learn about it
    
        if(!token){ 
            throw new ApiError(401,"Unauthorized request")
        }
        
        const decodedToken=jwt.verify(token,process.env.ACESS_TOKEN_SECRET)
        const user=await User.findById(decodedToken?._id).select
        ("-password -refreshToken")
    
        if(!user){
    
            //next _discuss about frontend
            throw new ApiError(401,"Invalid Access Token")
        }
    
        req.user=user;  //req.user ak kya user bana le user ki information add kardo
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Accesstoken")
    }
})

//middleware mostly use on routes
