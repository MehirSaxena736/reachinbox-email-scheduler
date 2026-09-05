import { Router } from "express";
import {
  createCampaignEnrollmentController,
  deleteCampaignEnrollmentController,
  getCampaignEnrollmentController,
  listCampaignEnrollmentsController,
} from "../controllers/campaignEnrollmentController";
import { requireAuth } from "../middleware/authMiddleware";
import {
  requireCampaignAccess,
  requireEnrollmentAccess,
  requireEnrollmentQueryAccess,
} from "../middleware/workspaceMiddleware";

const router = Router();

router.use(requireAuth);

router.post(
  "/",
  requireCampaignAccess,
  createCampaignEnrollmentController
);

router.get(
  "/",
  requireEnrollmentQueryAccess,
  listCampaignEnrollmentsController
);

router.get(
  "/:id",
  requireEnrollmentAccess,
  getCampaignEnrollmentController
);

router.delete(
  "/:id",
  requireEnrollmentAccess,
  deleteCampaignEnrollmentController
);

export default router;