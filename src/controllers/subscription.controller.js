import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import ApiResponse from '../utils/ApiResponse.js';
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.body

  const checkSubscription = await Subscription.findOne({ subscriber: new mongoose.Types.ObjectId(req.user._id), channel: new mongoose.Types.ObjectId(channelId) });


  if (checkSubscription) {
    const unsubscribe = await Subscription.findByIdAndDelete(checkSubscription?._id)
    return res.
      status(200)
      .json(new ApiResponse(200, {}, "Unsubscribed"))
  } else {

    let subscription = await Subscription.create({
      subscriber: req.user._id,
      channel: new mongoose.Types.ObjectId(channelId)
    })
    return res.
      status(200)
      .json(new ApiResponse(200, subscription, "Subscribed"))
  }




})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params
  console.log(channelId)

  const subscriberList = await Subscription.aggregate([
    {
      $match:

      {
        channel: new mongoose.Types.ObjectId(channelId)

      },
    },
    {
      $lookup:
      {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberList",
      },
    },
    {
      $addFields: {
        subscribedList: {
          $arrayElemAt: ["$subscriberList", 0],
        },
      },
    },
    {
      $project:
      {
        subscribedList: 1,
      },
    },
    {
      $group: {
        _id: null,
        data: {
          $push: "$$ROOT",
        },
      },
    },
    {
      $project: {
        _id: 0,
        data: {
          $map: {
            input: "$data",
            as: "doc",
            in: "$$doc.subscribedList",
          },
        },
      },
    },
  ])
  return res
    .status(200)
    .json(new ApiResponse(200, subscriberList[0]))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params

  const channelList = await Subscription.aggregate([
    {
      $match:

      {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup:
      {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedData",
        pipeline: [
          {
            $project: {
              "password": 0
            }
          }
        ]
      },
    },
    {
      $addFields: {
        subscribedList: {
          $arrayElemAt: ["$subscribedData", 0],
        },
      },
    },
    {
      $project:
      {
        subscribedList: 1,
      },
    },
    {
      $group: {
        _id: null,
        data: {
          $push: "$$ROOT",
        },
      },
    },
    {
      $project: {
        _id: 0,
        data: {
          $map: {
            input: "$data",
            as: "doc",
            in: "$$doc.subscribedList",
          },
        },
      },
    },
  ])
  console.log(channelList)
  return res
    .status(200)
    .json(new ApiResponse(200, channelList[0]))
})

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels
}