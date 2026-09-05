import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { config } from "../config";
import { AppError } from "../utils/AppError";

interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export async function registerUser(input: RegisterInput) {
  const email = input.email.toLowerCase().trim();

  if (input.password.length < 6) {
    throw new AppError(
      400,
      "Password must be at least 6 characters",
      {
        code: "INVALID_PASSWORD",
      }
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError(
      409,
      "User with this email already exists",
      {
        code: "USER_ALREADY_EXISTS",
      }
    );
  }

  const passwordHash = await bcrypt.hash(
    input.password,
    12
  );

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: input.name?.trim(),
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

export async function loginUser(input: LoginInput) {
  const email = input.email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.passwordHash) {
    throw new AppError(
      401,
      "Invalid email or password",
      {
        code: "INVALID_CREDENTIALS",
      }
    );
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new AppError(
      401,
      "Invalid email or password",
      {
        code: "INVALID_CREDENTIALS",
      }
    );
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    config.jwt.secret,
    {
      expiresIn: "7d",
    }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
}