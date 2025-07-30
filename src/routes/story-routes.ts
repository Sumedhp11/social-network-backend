import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  addStoryController,
  getStoriesController,
} from "../controllers/story-controller";
import { storyContent } from "../config/multerConfig";

const router = Router();

router.use(authMiddleware);
router.post("/create", storyContent, addStoryController);
router.get("/get-stories", getStoriesController);

export default router;
