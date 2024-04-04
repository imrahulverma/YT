import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import ApiResponse from '../utils/ApiResponse.js';
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { secondsToMMSS } from "../utils/secondToHHmmss.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    let video = await Video.aggregate([
        {
          $lookup:
            {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerData",
            },
        },
        {
          $addFields: {
            ownerUserName: {
              $arrayElemAt: ["$ownerData.username", 0],
            },
            ownerName: {
              $arrayElemAt: ["$ownerData.fullName", 0],
            },
            ownerAvatar: {
              $arrayElemAt: ["$ownerData.avatar", 0],
            },
          },
        },
        {
          $project: {
            ownerData: 0,
          },
        },
      ])

    video = video.map(res=> {
       return {  ...res,
                duration: secondsToMMSS(res.duration)        }
    })

    return res.status(200)
    .json(new ApiResponse(200,{data:video},""))

})

const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    const { title, description } = req.body
    console.log(req.files)


    if (!(title || description)) {
        return res.status(200).
            json(new ApiResponse(401, {}, "Missing Data"))
    }

    let videoLocalPath = req.files?.videoFile[0]?.path
    let thumbnailLocalPath = req.files?.thumbnail[0]?.path
    if (!videoLocalPath) {
        throw new ApiError(400, "Video not found")
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Video not found")
    }

    let videoFile = await uploadOnCloudinary(videoLocalPath)
    let thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!(videoFile || thumbnail)) {
        throw new ApiError(400, "Something went wrong")
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        description,
        title,
        duration: videoFile.duration,
        owner: req.user._id
    })
    if (!video) {
        return res.status(400).
            json(new ApiResponse(200, {}, "Something went wrong"))
    }
    return res.status(200).
        json(new ApiResponse(200, {}, "Video Uploaded Successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.query
    //TODO: get video by id
    // console.log(video)

    const video = await Video.aggregate([
      {
        $match:
          {
            _id: new mongoose.Types.ObjectId(videoId),
          },
      },
      {
        $lookup:
          {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "userData",
            pipeline: [
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
                  password: 0,
                  subscribedTo: 0,
                  subscribers:0
                },
              },
            ],
          },
      },
      {
        $project:
          {
            owner: 0,
          },
      },
    ])
    
    if (!video) {
        return res
        .status(200).
        json(new ApiResponse(400, "", "Video Not Found"))
    }

    return res.status(200).
        json(new ApiResponse(200, {data: video[0]}, "Success"))

})

const getVideoByChannel = asyncHandler(async (req, res) => {
    const { username } = req.params
    
    const user = await User.findOne({username: username})

    if (!user) {
        return res
            .status(200).
            json(new ApiResponse(400, {}, "User Not Found"))
    }
    
    const Videos = await Video.find({owner: new mongoose.Types.ObjectId(user?._id)})
    
    
        if (!Videos) {
            return res
                .status(200).
                json(new ApiResponse(400, video, "Video Not Found"))
        }
    
        return res.status(200).
            json(new ApiResponse(200, {data:Videos}, "Success"))
    

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const video = await Video.findByIdAndUpdate(videoId,
        {
          $set: {
            title,
            description
          }
        },
        { new: true }
      )

      

    if (!video) {
        return res
        .status(200).
        json(new ApiResponse(400, "", "Video Not Found"))
    }

    return res.status(200).
        json(new ApiResponse(200, video, "Data Updated Successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getVideoByChannel
}