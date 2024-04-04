import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js"
import ApiResponse from "../utils/ApiResponse.js"
import { asyncHandler } from '../utils/asyncHandler.js';

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body

    if (!content) {
        return res.status(400)
            .json(new ApiResponse(400, {}, "Tweet Not Found"))
    }

    const tweet = await Tweet.create({
        content,
        owner: req?.user._id
    })

    if (!tweet) {
        return res.status(400).
            json(new ApiResponse(400, {}, "Something Went wrong"));
    }
    return res.status(201).
        json(new ApiResponse(201, tweet, "Created Successfully"));

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { channelId } = req.query

    if (!channelId) {
        return res.status(400).
            json(new ApiResponse(400, {}, "Id not found"));
    }

    const tweets = await Tweet.find({ owner: new mongoose.Types.ObjectId(channelId) })
        .sort('-createdAt')

    return res.status(201).
        json(new ApiResponse(201, { data: tweets }, "tweet fetched Successfully"));

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId, content, ownerId } = req.body;

    if (!req.user._id.equals(ownerId)) {
        return res.status(401)
            .json(new ApiResponse(401, {}, "unauthorised to delete tweet"));
    }

    const editTweet = await Tweet.findByIdAndUpdate(tweetId, {
        $set: {
            content
        }
    })

    if (!editTweet) {
        return res.status(401).
            json(new ApiResponse(401, {}, "Something went wrong"));

    }
    return res.status(200).
        json(new ApiResponse(200, editTweet, "Tweet Updated"));

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;

    const tweet = await Tweet.findById(tweetId)


    const deleteTweet = await Tweet.deleteOne({ _id: tweetId })

    if (deleteTweet.acknowledged == false || deleteTweet.deletedCount == 0) {
        return res
            .status(400)
            .json(new ApiResponse(400, {}, "OOps Something Went Wrong"))
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Successfull"))

})


export { createTweet, getUserTweets, updateTweet, deleteTweet }