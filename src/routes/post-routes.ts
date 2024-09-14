import { Router } from "express";
import { singlePost } from "../config/multerConfig";
import { addPostController } from "../controllers/post-controller";
const router = Router();

router.post("/add-post", singlePost, addPostController);

export default router;
