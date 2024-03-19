import { ApiError } from "./ApiError.js";
import { asyncHandler } from "./asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import ApiResponse from "./ApiResponse.js";

export const verifyJWT = asyncHandler(async(req,res,next) => {
 try {
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
     if([null, undefined, "","null"].includes(token) ) {
      return res.status(200)
      .json(new ApiResponse(
          401,
          {},
          "Unauthorized request"
      ))
      //  throw new ApiError(401,"Unauthorized request")
     }
   
     const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
   
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
   
     if(!user) {
      //  throw new ApiError(401,"Invalid Access Token")
      return res
      .status(200)
      .json(new ApiResponse(
          401,
          {},
          "Invalid Access Token"
      ))
     }
   
     req.user = user
     next()
 } catch (error) {
    console.log(error);
    return res
      .status(200)
      .json(new ApiResponse(
          401,
          {},
          "Invalid Access Token"
      ))
 }
}) 