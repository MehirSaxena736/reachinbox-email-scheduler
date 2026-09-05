import { Router } from "express";
import {
  createEmailEventController,
  getEmailEventController,
  listEmailEventsController,
} from "../controllers/emailEventController";
import { requireAuth } from "../middleware/authMiddleware";
import {
  requireEmailEventAccess,
  requireEmailEventCreateAccess,
  requireEmailEventQueryAccess,
} from "../middleware/workspaceMiddleware";

const router = Router();

router.use(requireAuth);

router.post(
  "/",
  requireEmailEventCreateAccess,
  createEmailEventController
);

router.get(
  "/",
  requireEmailEventQueryAccess,
  listEmailEventsController
);

router.get(
  "/:id",
  requireEmailEventAccess,
  getEmailEventController
);

export default router;