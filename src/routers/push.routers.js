import { Router } from "express";
import { subscribe, unsubscribe, sendTestNotification } from "../controllers/push.controller.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.post("/subscribe", auth, subscribe);
router.post("/unsubscribe", auth, unsubscribe);
router.post("/test", auth, sendTestNotification);

export default router;
