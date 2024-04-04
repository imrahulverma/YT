import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.query
    console.log(req.query)
    const { page = 1, limit = 10 } = req.query

    const comments = await Comment.aggregate(
        [
            {
              $match:
                {
                  video: new mongoose.Types.ObjectId(videoId)
                },
            },
            
            {
              $lookup:
                {
                  from: "users",
                  localField: "owner",
                  foreignField: "_id",
                  as: "ownerData",
                  pipeline: [
                    {$project: {
                      username:1,
                      fullName:1,
                      avatar:1
                    }}
                  ]
                },
            },
              {
              $addFields: {
                ownerData: { $arrayElemAt: ["$ownerData", 0] }
              }
            },
            {
              $project: {	
                content:1,
                video:1,
                commentorName: "$ownerData.fullName",
                commentorId: "$ownerData._id",
                commentorUsername: "$ownerData.username",
                commentorAvatar: "$ownerData.avatar",
              }
            }
          ]
    ).sort({ createdAt: -1 }).exec()
    

    return res
    .status(200)
    .json(new ApiResponse(200, {data:comments}, "Successfull"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { content, video } = req.body


    const comment = await Comment.create({
        content,
        video,
        owner: req.user._id
    })

    if (!comment) {
        return res
            .status(400)
            .json(new ApiResponse(400, {}, "Something went wrong"))
    }

    if (!content || typeof content !== 'string') {
        return res
            .status(400)
            .json(new ApiResponse(400, {}, "Comment Required"))
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Successfull"))
})

const updateComment = asyncHandler(async (req, res) => {
    const { content, commentId } = req.body

    const checkUser = await Comment.findById(commentId)

    if(!req.user._id.equals(checkUser.owner)) {
      
        return res.status(400)
            .json(new ApiResponse(400, {}, "Unauthorised User"))
    
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content,
            }
        }
    )


    if (!comment) {
        return res.status(400)
            .json(new ApiResponse(400, {}, "Something went wrong"))
    }

    return res.status(200)
        .json(new ApiResponse(200, {}, "Successfull"))

})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId)

    // if(req.user._id == )

    const deleteComment = await Comment.deleteOne({ _id: commentId })

    if (deleteComment.acknowledged == false || deleteComment.deletedCount == 0) {
        return res
            .status(400)
            .json(new ApiResponse(400, {}, "OOps Something Went Wrong"))
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Successfull"))


})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}