import { Router } from "express";
import { login, registerUser, logout ,refreshAccessToken, ChangePassword,getCurrentUser,updateAvatar, updateCoverImage, getUserChannelProfile} from "../controllers/user.controller.js";
import {upload} from "../middleware/multer.middleware.js"
import { verifyJWT } from "../utils/AuthMiddleware.js";
const router = Router()


router.route("/register").post(
    upload.fields([
        {name: "avatar",maxCount:1},
        {name:"coverImage",maxCount:1}
    ]),
    registerUser)


router.route("/login").post(login)    

//secured routes
 router.route("/logout").post(verifyJWT, logout)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT, ChangePassword)

router.route("/current-user").post(verifyJWT, getCurrentUser)

router.route("/update-avatar").post(verifyJWT,upload.single("avatar"), updateAvatar)

router.route("/update-cover").post(verifyJWT,upload.single("coverImage"), updateCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

export default router