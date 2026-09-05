import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { AppError } from "../utils/AppError";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return next(
      new AppError(401, "Authorization token is required", {
        code: "UNAUTHORIZED",
      })
    );
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(
      new AppError(401, "Invalid authorization header", {
        code: "UNAUTHORIZED",
      })
    );
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.userId !== "string" ||
      typeof decoded.email !== "string"
    ) {
      throw new Error("Invalid token payload");
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch {
    next(
      new AppError(401, "Invalid or expired token", {
        code: "UNAUTHORIZED",
      })
    );
  }
}
declare global {
  namespace Express {
    interface Request {
      workspaceMember?: {
        id: string;
        workspaceId: string;
        userId: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}