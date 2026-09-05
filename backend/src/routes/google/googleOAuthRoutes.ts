import { Router } from "express";
import {
  connectGoogleAccountController,
  googleAuthController,
  googleCallbackController,
} from "../../controllers/google/googleOAuthController";
import { requireAuth } from "../../middleware/authMiddleware";
import { requireWorkspaceAccess } from "../../middleware/workspaceMiddleware";

const router = Router();

router.get("/auth", googleAuthController);

router.get("/callback", googleCallbackController);

router.post(
  "/connect",
  requireAuth,
  requireWorkspaceAccess,
  connectGoogleAccountController
);

export default router;