import { Router } from "express";
import {
  cancelScheduledEmailController,
  createScheduledEmailController,
  getScheduledEmailController,
  listScheduledEmailsController,
  updateScheduledEmailController,
} from "../controllers/scheduledEmailController";
import { requireAuth } from "../middleware/authMiddleware";
import {
  requireScheduledEmailAccess,
  requireWorkspaceAccess,
} from "../middleware/workspaceMiddleware";

const router = Router();

router.use(requireAuth);

router.post(
  "/",
  requireWorkspaceAccess,
  createScheduledEmailController
);

router.get(
  "/",
  requireWorkspaceAccess,
  listScheduledEmailsController
);

router.get(
  "/:id",
  requireScheduledEmailAccess,
  getScheduledEmailController
);

router.patch(
  "/:id",
  requireScheduledEmailAccess,
  updateScheduledEmailController
);

router.post(
  "/:id/cancel",
  requireScheduledEmailAccess,
  cancelScheduledEmailController
);

export default router;