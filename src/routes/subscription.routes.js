import { Router } from 'express';
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controller.js"
import { upload } from "../middleware/multer.middleware.js"
import { verifyJWT } from "../utils/AuthMiddleware.js";

const router = Router()

router.use(verifyJWT); 

router.route("/subscribe").post(toggleSubscription)

router.route("/c/:subscriberId").get(getSubscribedChannels)

router.route("/u/:channelId").get(getUserChannelSubscribers);

export default router