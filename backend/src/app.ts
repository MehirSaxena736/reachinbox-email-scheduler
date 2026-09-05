import express, { Application } from "express";
import cors from "cors";

import campaignRoutes from "./routes/campaignRoutes";
import contactRoutes from "./routes/contactRoutes";
import sequenceRoutes from "./routes/sequenceRoutes";
import scheduledEmailRoutes from "./routes/scheduledEmailRoutes";
import emailEventRoutes from "./routes/emailEventRoutes";
import campaignEnrollmentRoutes from "./routes/campaignEnrollmentRoutes";
import authRoutes from "./routes/authRoutes";
import workspaceRoutes from "./routes/workspaceRoutes";
import googleOAuthRoutes from "./routes/google/googleOAuthRoutes";
import emailAccountRoutes from "./routes/emailAccountRoutes";

import { errorHandler } from "./middleware/errorHandler";

export function createApp(): Application {
  const app = express();

  // Allow frontend (Vite) to communicate with backend
  app.use(
    cors({
      origin: "http://localhost:8443",
      credentials: true,
    })
  );

  // Parse JSON request bodies
  app.use(express.json());

  // =========================
  // Authentication
  // =========================
  app.use("/api/auth", authRoutes);

  // =========================
  // Campaigns
  // =========================
  app.use("/api/campaigns", campaignRoutes);

  // =========================
  // Contacts
  // =========================
  app.use("/api/contacts", contactRoutes);

  // =========================
  // Sequences
  // =========================
  app.use("/api/sequences", sequenceRoutes);

  // =========================
  // Scheduled Emails
  // =========================
  app.use("/api/scheduled-emails", scheduledEmailRoutes);

  // =========================
  // Email Events
  // =========================
  app.use("/api/email-events", emailEventRoutes);

  // =========================
  // Campaign Enrollments
  // =========================
  app.use("/api/campaign-enrollments", campaignEnrollmentRoutes);

  // =========================
  // Workspaces
  // =========================
  app.use("/api/workspaces", workspaceRoutes);

  // =========================
  // Email Accounts
  // =========================
  app.use("/api/email-accounts", emailAccountRoutes);

  // =========================
  // Google OAuth
  // =========================
  app.use("/api/google", googleOAuthRoutes);

  // =========================
  // Health Check
  // =========================
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
    });
  });

  // =========================
  // Error Handler
  // =========================
  app.use(errorHandler);

  return app;
}