import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.query;

    const alreadyLikedId = await Like.findOne({ video: new mongoose.Types.ObjectId(videoId), likedBy: new mongoose.Types.ObjectId(req.user._id) })

    if (alreadyLikedId) {
        const toggleLike = await Like.findByIdAndDelete(alreadyLikedId._id)

        if (!toggleLike) {
            return res
                .status(400)
                .json(new ApiError(400, "Something Went Wrong"))
        }

        return res
            .status(200)
            .json(new ApiResponse(201, {}, "Unliked Successfully"))
    }
    else {
        const toggleLike = await Like.create({
            video: videoId,
            likedBy: req.user._id,
        })

        if (!toggleLike) {
            return res
                .status(400)
                .json(new ApiError(400, "Something Went Wrong"))
        }


        return res
            .status(200)
            .json(new ApiResponse(201, {}, "Liked Successfully"))
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.query;

    const alreadyLikedTweet = await Like.findOne({ tweet: new mongoose.Types.ObjectId(tweetId), likedBy: new mongoose.Types.ObjectId(req.user._id) })

    if (alreadyLikedTweet) {
        const toggleLike = await Like.findByIdAndDelete(alreadyLikedTweet._id)

        if (!toggleLike) {
            return res
                .status(400)
                .json(new ApiError(400, "Something Went Wrong"))
        }

        return res
            .status(200)
            .json(new ApiResponse(201, {}, "Unliked Successfully"))
    }
    else {
        const toggleLike = await Like.create({
            tweet: tweetId,
            likedBy: req.user._id,
        })

        if (!toggleLike) {
            return res
                .status(400)
                .json(new ApiError(400, "Something Went Wrong"))
        }


        return res
            .status(200)
            .json(new ApiResponse(201, {}, "Liked Successfully"))
    }
})


const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.query;

    const alreadyLikedComment = await Like.findOne({ comment: new mongoose.Types.ObjectId(commentId), likedBy: new mongoose.Types.ObjectId(req.user._id) })

    if (alreadyLikedComment) {
        const toggleLike = await Like.findByIdAndDelete(alreadyLikedComment._id)

        if (!toggleLike) {
            return res
                .status(400)
                .json(new ApiError(400, "Something Went Wrong"))
        }

        return res
            .status(200)
            .json(new ApiResponse(201, {}, "Unliked Successfully"))
    }
    else {
        const toggleLike = await Like.create({
            comment: commentId,
            likedBy: req.user._id,
        })

        if (!toggleLike) {
            return res
                .status(400)
                .json(new ApiError(400, "Something Went Wrong"))
        }


        return res
            .status(200)
            .json(new ApiResponse(201, {}, "Liked Successfully"))
    }
})

export { toggleVideoLike, toggleTweetLike, toggleCommentLike }