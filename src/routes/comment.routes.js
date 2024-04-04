import { Router } from 'express';
import { verifyJWT } from '../utils/AuthMiddleware.js';
import { addComment ,deleteComment,updateComment ,getVideoComments } from '../controllers/comment.controller.js';


const router = Router();

router.use(verifyJWT);

router.route("/addComment").post(addComment);

router.route("/allComment").get(getVideoComments);

router.route("/c/:commentId").delete(deleteComment);

router.route("/updateComment").patch(updateComment);



export default router
