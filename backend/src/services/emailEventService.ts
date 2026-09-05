import { EmailEventType, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

interface CreateEmailEventInput {
  scheduledEmailId: string;
  type: EmailEventType;
  metadata?: Record<string, unknown>;
}

interface EmailEventListFilters {
  scheduledEmailId?: string;
  type?: EmailEventType;
}

export async function createEmailEvent(
  input: CreateEmailEventInput
) {
  const scheduledEmail = await prisma.scheduledEmail.findUnique({
    where: {
      id: input.scheduledEmailId,
    },
  });

  if (!scheduledEmail) {
    throw new AppError(404, "Scheduled email not found", {
      code: "SCHEDULED_EMAIL_NOT_FOUND",
    });
  }

  return prisma.emailEvent.create({
    data: {
      scheduledEmailId: input.scheduledEmailId,
      type: input.type,
      metadata: input.metadata
        ? (input.metadata as Prisma.InputJsonValue)
        : undefined,
    },
  });
}

export async function listEmailEvents(
  filters: EmailEventListFilters
) {
  return prisma.emailEvent.findMany({
    where: {
      scheduledEmailId: filters.scheduledEmailId,
      type: filters.type,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getEmailEventById(id: string) {
  const event = await prisma.emailEvent.findUnique({
    where: {
      id,
    },
  });

  if (!event) {
    throw new AppError(404, "Email event not found", {
      code: "EMAIL_EVENT_NOT_FOUND",
    });
  }

  return event;
}