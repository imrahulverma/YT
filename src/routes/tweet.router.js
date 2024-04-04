import { Router } from "express" 
import { verifyJWT } from "../utils/AuthMiddleware.js"
import { createTweet, getUserTweets,updateTweet , deleteTweet} from "../controllers/tweet.controller.js"

const router = Router()

router.use(verifyJWT)

router.route("/addTweet").post(createTweet)
router.route("/getAllTweet").get(getUserTweets)
router.route("/updateTweet").patch(updateTweet)
router.route("/deleteTweet/:tweetId").delete(deleteTweet)


export default router