import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js'
import { User } from "../models/user.model.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"
import ApiResponse from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)
    const refreshToken = await user.generateRefreshToken()
    const accessToken = await user.generateAccessToken()

    user.refreshToken = refreshToken
    user.save({ validateBeforeSave: false }) // To bypass the model validation on password field during token generation

    return { refreshToken, accessToken }
  } catch (error) {

    throw new ApiError(500, "Something went wrong while generating referesh and access token")

  }
}

const registerUser = asyncHandler(async (req, res) => {
  //get user details
  // validation - not empty
  //check user already exist: username, email
  //check for images
  //upload to cloudinary
  //create user object - entry in db
  // remove password nad reresh token from response
  //check for user creation
  // return res 

  const { username, fullName, email, password, description } = req.body

  if (
    [fullName, email, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All Fields are required")
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (existedUser) {
    throw new ApiError(409, "Email or username already exists")
  }
  // console.log( req.files)

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Upload Avatar Image")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
    throw new ApiError(400, "Upload Avatar Image")
  }

  const user = await User.create({
    fullName,
    email,
    username: username.toLowerCase(),
    avatar: avatar.url,
    password,
    description,
    coverImage: coverImage?.url || ''
  })

  const createdUser = await User.findById(user._id).select(["-password", "-refreshToken"])

  if (!createdUser) {
    throw new Error(500, "Something Went Wrong! User not registered  ")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User Registered Successfully")
  )

})


const login = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie


  const { email, username, password } = req.body

  if (!(email || username)) {
    throw new ApiError(409, "Username or email required")
  }

  const user = await User.findOne({ $or: [{ email }, { username }] })

  if (!user) {
    // throw new ApiError(404, "User does not exist")
    return res.status(200).json(
      new ApiResponse(404, {}, " User does not exist")
    )
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    // throw new ApiError(404, "Invalid Credentials")
    return res.status(200).json(
      new ApiResponse(401, {}, "Invalid Credentials")
    )
  }

  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id)

  const loggedInUser = await User.findById(user._id).select("-password --refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "Logged In successfully")
    )
})

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined
    }

  }, {
    new: true
  },)

  const options = {
    httpOnly: true,
    secure: true
  }
  return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request")
  }

  const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

  const user = User.findById(decodedToken?._id)
  if (!user) {
    throw new ApiError(401, "Invalid Refresh Token")
  }

  if (incomingRefreshToken != user?.refrehToken) {
    throw new ApiError(401, " Refresh Token is expired or used")
  }

  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id)
  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refrehToken", refreshToken, options)
    .json(new ApiResponse(200, { accessToken, }, "Access Token Refreshed"))
})

const ChangePassword = asyncHandler(async (req, res) => {

  const { oldPassword, newPassword } = req.body

  const user = await User.findById(req.user?._id)

  const matchOldPassword = await user.isPasswordCorrect(oldPassword)

  if (!matchOldPassword) {
    throw new ApiError(400, "Invalid Old Password")
  }

  user.password = newPassword
  await user.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))

})

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(
      200,
      req.user,
      "User fetched successfully"
    ))
})

const updateUserDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body

  const user = await User.findByIdAndUpdate(req.user._id,
    {
      $set: {
        fullName,
        email
      }
    },
    { new: true },
  ).select("-password")


  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updateAvatar = asyncHandler(async (req, res, next) => {
  // console.log(req.file)

  const avatarLocalPath = req.file?.path

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar Not Found")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar")
  }

  if (req.user.avatar) {
    await deleteFromCloudinary(req.user.avatar.split("/")[7]?.split(".")[0])
  }

  const user = await User.findByIdAndUpdate(req.user?._id,
    {
      $set: { avatar: avatar.url }
    },
    { new: true }
  ).select("-password")

  return res.
    status(200)
    .json(
      new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const updateCoverImage = asyncHandler(async (req, res, next) => {
  // console.log(req.file)

  const coverImageLocalPath = req.file?.path
  console.log(coverImageLocalPath)

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image Not Found")
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on avatar")
  }

  if (req.user.avatar) {
    await deleteFromCloudinary(req.user.coverImage.split("/")[7]?.split(".")[0])
  }

  const user = await User.findByIdAndUpdate(req.user?._id,
    {
      $set: { coverImage: coverImage.url }
    },
    { new: true }
  ).select("-password")

  return res.
    status(200)
    .json(
      new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  console.log(username)

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing")
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers"
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo"
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        description: 1,
        email: 1

      }
    }
  ])

  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})

const getWatchHistory = asyncHandler(async (req, res) => {
  
})
export { registerUser, login, logout, refreshAccessToken, ChangePassword, getCurrentUser, updateUserDetails, updateAvatar, updateCoverImage, getUserChannelProfile } 