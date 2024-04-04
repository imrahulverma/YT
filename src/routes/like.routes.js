import {  Router } from "express";
import { verifyJWT } from "../utils/AuthMiddleware.js";
import { toggleVideoLike,toggleTweetLike, toggleCommentLike  } from "../controllers/like.controller.js";

const router = Router()

router.use(verifyJWT);

router.route('/toggleVideoLike').get(toggleVideoLike)
router.route('/toggleTweetLike').get(toggleTweetLike)
router.route('/toggleCommentLike').get(toggleCommentLike)

export default router