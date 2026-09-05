import { Router } from "express";
import {
  createSequenceController,
  createSequenceStepController,
  deleteSequenceController,
  deleteSequenceStepController,
  getSequenceController,
  updateSequenceController,
  updateSequenceStepController,
} from "../controllers/sequenceController";
import { requireAuth } from "../middleware/authMiddleware";
import {
  requireCampaignAccess,
  requireSequenceAccess,
  requireSequenceStepAccess,
} from "../middleware/workspaceMiddleware";

const router = Router();

router.use(requireAuth);

// Create sequence → campaignId is supplied in body
router.post(
  "/",
  requireCampaignAccess,
  createSequenceController
);

// Get sequence → campaignId is in URL
router.get(
  "/campaign/:campaignId",
  requireCampaignAccess,
  getSequenceController
);

// Update/delete sequence → sequence ID is in URL
router.patch(
  "/:id",
  requireSequenceAccess,
  updateSequenceController
);

router.delete(
  "/:id",
  requireSequenceAccess,
  deleteSequenceController
);

// Create sequence step → sequenceId is supplied in body
router.post(
  "/steps",
  requireSequenceAccess,
  createSequenceStepController
);

// Update/delete sequence step → step ID is in URL
router.patch(
  "/steps/:id",
  requireSequenceStepAccess,
  updateSequenceStepController
);

router.delete(
  "/steps/:id",
  requireSequenceStepAccess,
  deleteSequenceStepController
);

export default router;