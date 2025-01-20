import { Router } from "express";
import { getNotification } from "../controllers/notification-controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { sseHandler } from "../controllers/sse-controller";

const router: Router = Router();
router.use(authMiddleware);
router.get("/sse", sseHandler);
router.get("/get-notification", getNotification);

export default router;
