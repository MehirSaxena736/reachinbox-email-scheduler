import { Router } from "express";
import {
  createEmailAccountController,
  deleteEmailAccountController,
  getEmailAccountController,
  listEmailAccountsController,
  updateEmailAccountController,
} from "../controllers/emailAccountController";
import { requireAuth } from "../middleware/authMiddleware";
import {
  requireEmailAccountAccess,
  requireWorkspaceAccess,
} from "../middleware/workspaceMiddleware";

const router = Router();

router.use(requireAuth);

router.post(
  "/",
  requireWorkspaceAccess,
  createEmailAccountController
);

router.get(
  "/",
  requireWorkspaceAccess,
  listEmailAccountsController
);

router.get(
  "/:id",
  requireEmailAccountAccess,
  getEmailAccountController
);

router.patch(
  "/:id",
  requireEmailAccountAccess,
  updateEmailAccountController
);

router.delete(
  "/:id",
  requireEmailAccountAccess,
  deleteEmailAccountController
);

export default router;