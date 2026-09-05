import { Request, Response } from "express";
import { loginUser, registerUser } from "../services/authService";
import { asyncHandler } from "../utils/asyncHandler";
import { assertNonEmptyString } from "../utils/validation";

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;

    assertNonEmptyString(body.email, "email");
    assertNonEmptyString(body.password, "password");

    const name =
      body.name !== undefined
        ? String(body.name)
        : undefined;

    const user = await registerUser({
      email: body.email,
      password: body.password,
      name,
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  }
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;

    assertNonEmptyString(body.email, "email");
    assertNonEmptyString(body.password, "password");

    const result = await loginUser({
      email: body.email,
      password: body.password,
    });

    res.json({
      success: true,
      data: result,
    });
  }
);