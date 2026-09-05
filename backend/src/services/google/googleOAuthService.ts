import { google } from "googleapis";
import { config } from "../../config";
import { AppError } from "../../utils/AppError";
import crypto from "crypto";
import { redisConnection } from "../../queues/redis";


const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/userinfo.email",
];

function getOAuth2Client() {
  if (
    !config.google.clientId ||
    !config.google.clientSecret ||
    !config.google.callbackUrl
  ) {
    throw new AppError(
      500,
      "Google OAuth is not configured",
      {
        code: "GOOGLE_OAUTH_NOT_CONFIGURED",
      }
    );
  }

  return new google.auth.OAuth2(
    config.google.clientId,
    config.google.clientSecret,
    config.google.callbackUrl
  );
}

export async function getGoogleAuthorizationUrl() {
  const oauth2Client = getOAuth2Client();

  const state = crypto.randomBytes(32).toString("hex");

  await redisConnection.set(
    `google-oauth-state:${state}`,
    "1",
    "EX",
    600
  );

  const authorizationUrl =
    oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: GOOGLE_SCOPES,
      state,
    });

  return authorizationUrl;
}

export async function exchangeGoogleCodeForTokens(
  code: string
) {
  const oauth2Client = getOAuth2Client();

  try {
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      throw new AppError(
        400,
        "Google did not return a refresh token",
        {
          code: "GOOGLE_REFRESH_TOKEN_MISSING",
        }
      );
    }

    return tokens;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      400,
      "Failed to exchange Google authorization code",
      {
        code: "GOOGLE_TOKEN_EXCHANGE_FAILED",
      }
    );
  }
}

export async function getGoogleUserInfo(
  accessToken: string
) {
  const oauth2Client = getOAuth2Client();

  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  const oauth2 = google.oauth2({
    version: "v2",
    auth: oauth2Client,
  });

  try {
    const response = await oauth2.userinfo.get();

    return {
      id: response.data.id,
      email: response.data.email,
      name: response.data.name,
      picture: response.data.picture,
    };
  } catch {
    throw new AppError(
      400,
      "Failed to fetch Google user information",
      {
        code: "GOOGLE_USER_INFO_FAILED",
      }
    );
  }
}
export async function createGoogleTransporter(
  refreshToken: string
) {
  const oauth2Client = getOAuth2Client();

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { token } =
    await oauth2Client.getAccessToken();

  if (!token) {
    throw new AppError(
      401,
      "Failed to obtain Google access token",
      {
        code: "GOOGLE_ACCESS_TOKEN_FAILED",
      }
    );
  }

  return {
    accessToken: token,
    oauth2Client,
  };
}