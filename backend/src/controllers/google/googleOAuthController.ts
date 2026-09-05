import { Request, Response } from "express";
import { EmailAccountProvider } from "@prisma/client";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/AppError";
import {
  exchangeGoogleCodeForTokens,
  getGoogleAuthorizationUrl,
  getGoogleUserInfo,
} from "../../services/google/googleOAuthService";
import { prisma } from "../../lib/prisma";
import { redisConnection } from "../../queues/redis";

export const googleAuthController = asyncHandler(
  async (_req: Request, res: Response) => {
    const authorizationUrl =
      await getGoogleAuthorizationUrl();

    res.json({
      success: true,
      data: {
        authorizationUrl,
      },
    });
  }
);

export const googleCallbackController = asyncHandler(
  async (req: Request, res: Response) => {
    const code =
      typeof req.query.code === "string"
        ? req.query.code
        : undefined;

    if (!code) {
      throw new AppError(
        400,
        "Google authorization code is required",
        {
          code: "GOOGLE_AUTH_CODE_REQUIRED",
        }
      );
    }

    const state =
      typeof req.query.state === "string"
        ? req.query.state
        : undefined;

    if (!state) {
      throw new AppError(
        400,
        "Google OAuth state is required",
        {
          code: "GOOGLE_OAUTH_STATE_REQUIRED",
        }
      );
    }

    const stateKey = `google-oauth-state:${state}`;

    const storedState =
      await redisConnection.get(stateKey);

    if (!storedState) {
      throw new AppError(
        400,
        "Invalid or expired Google OAuth state",
        {
          code: "INVALID_GOOGLE_OAUTH_STATE",
        }
      );
    }

    await redisConnection.del(stateKey);

    const tokens =
      await exchangeGoogleCodeForTokens(code);

    if (!tokens.access_token) {
      throw new AppError(
        400,
        "Google access token was not returned",
        {
          code: "GOOGLE_ACCESS_TOKEN_MISSING",
        }
      );
    }

    const googleUser =
      await getGoogleUserInfo(tokens.access_token);

    res.json({
      success: true,
      data: {
        googleUser,
        tokens: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiryDate: tokens.expiry_date,
        },
      },
    });
  }
);

export const connectGoogleAccountController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;

    const workspaceId = body.workspaceId;
    const code = body.code;

    if (
      typeof workspaceId !== "string" ||
      workspaceId.trim().length === 0
    ) {
      throw new AppError(400, "workspaceId is required", {
        code: "VALIDATION_ERROR",
      });
    }

    if (
      typeof code !== "string" ||
      code.trim().length === 0
    ) {
      throw new AppError(
        400,
        "Google authorization code is required",
        {
          code: "VALIDATION_ERROR",
        }
      );
    }

    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
    });

    if (!workspace) {
      throw new AppError(404, "Workspace not found", {
        code: "WORKSPACE_NOT_FOUND",
      });
    }

    const tokens =
      await exchangeGoogleCodeForTokens(code);

    if (!tokens.access_token) {
      throw new AppError(
        400,
        "Google access token was not returned",
        {
          code: "GOOGLE_ACCESS_TOKEN_MISSING",
        }
      );
    }

    if (!tokens.refresh_token) {
      throw new AppError(
        400,
        "Google refresh token was not returned",
        {
          code: "GOOGLE_REFRESH_TOKEN_MISSING",
        }
      );
    }

    const googleUser =
      await getGoogleUserInfo(tokens.access_token);

    if (!googleUser.email) {
      throw new AppError(
        400,
        "Google account email was not returned",
        {
          code: "GOOGLE_EMAIL_MISSING",
        }
      );
    }

    const email = googleUser.email
      .toLowerCase()
      .trim();

    const existing =
      await prisma.emailAccount.findUnique({
        where: {
          workspaceId_email: {
            workspaceId,
            email,
          },
        },
      });

    if (existing) {
      const updated =
        await prisma.emailAccount.update({
          where: {
            id: existing.id,
          },
          data: {
            provider: EmailAccountProvider.GOOGLE,
            googleRefreshToken:
              tokens.refresh_token,
            status: "ACTIVE",
          },
        });

      res.json({
        success: true,
        data: updated,
      });

      return;
    }

    const emailAccount =
      await prisma.emailAccount.create({
        data: {
          workspaceId,
          email,
          displayName:
            googleUser.name ?? email,
          provider: EmailAccountProvider.GOOGLE,
          googleRefreshToken:
            tokens.refresh_token,
          status: "ACTIVE",
        },
      });

    res.status(201).json({
      success: true,
      data: emailAccount,
    });
  }
);