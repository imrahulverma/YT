import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
    getVideoByChannel
} from "../controllers/video.controller.js"
import { upload } from "../middleware/multer.middleware.js"
import { verifyJWT } from "../utils/AuthMiddleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file


router.route("/").get(getAllVideos)

router.route("/postVideo").post(upload.fields([{
    name: "videoFile",
    maxCount: 1,
},
{
    name: "thumbnail",
    maxCount: 1,
},
]),
    publishAVideo
);
router.route("/video/:username").get(getVideoByChannel)

router
    .route("/:videoId")
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);
router.route("/getVideoById").get(getVideoById)    

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router
