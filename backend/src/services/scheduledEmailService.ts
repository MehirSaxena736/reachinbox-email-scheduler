import { ScheduledEmailStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ScheduledEmailListFilters } from "../types/scheduledEmail";
import { AppError } from "../utils/AppError";
import { emailQueue } from "../queues/emailQueue";

interface CreateScheduledEmailInput {
  workspaceId: string;
  campaignId: string;
  contactId: string;
  campaignEnrollmentId: string;
  sequenceStepId: string;
  emailAccountId: string;
  scheduledAt: Date;
}

interface UpdateScheduledEmailInput {
  scheduledAt?: Date;
  status?: ScheduledEmailStatus;
}

export async function createScheduledEmail(
  input: CreateScheduledEmailInput
) {
  const [
    workspace,
    campaign,
    contact,
    emailAccount,
    enrollment,
    step,
  ] = await Promise.all([
    prisma.workspace.findUnique({
      where: { id: input.workspaceId },
    }),

    prisma.campaign.findUnique({
      where: { id: input.campaignId },
    }),

    prisma.contact.findUnique({
      where: { id: input.contactId },
    }),

    prisma.emailAccount.findUnique({
      where: { id: input.emailAccountId },
    }),

    prisma.campaignEnrollment.findUnique({
      where: { id: input.campaignEnrollmentId },
    }),

    prisma.sequenceStep.findUnique({
      where: { id: input.sequenceStepId },
    }),
  ]);

  if (!workspace) {
    throw new AppError(404, "Workspace not found", {
      code: "WORKSPACE_NOT_FOUND",
    });
  }

  if (!campaign) {
    throw new AppError(404, "Campaign not found", {
      code: "CAMPAIGN_NOT_FOUND",
    });
  }

  if (!contact) {
    throw new AppError(404, "Contact not found", {
      code: "CONTACT_NOT_FOUND",
    });
  }

  if (!emailAccount) {
    throw new AppError(404, "Email account not found", {
      code: "EMAIL_ACCOUNT_NOT_FOUND",
    });
  }

  if (!enrollment) {
    throw new AppError(404, "Campaign enrollment not found", {
      code: "CAMPAIGN_ENROLLMENT_NOT_FOUND",
    });
  }

  if (!step) {
    throw new AppError(404, "Sequence step not found", {
      code: "SEQUENCE_STEP_NOT_FOUND",
    });
  }

  // ---------------------------------------------------------
  // Validate workspace relationships
  // ---------------------------------------------------------

  if (campaign.workspaceId !== input.workspaceId) {
    throw new AppError(
      400,
      "Campaign does not belong to this workspace",
      {
        code: "INVALID_RELATION",
      }
    );
  }

  if (contact.workspaceId !== input.workspaceId) {
    throw new AppError(
      400,
      "Contact does not belong to this workspace",
      {
        code: "INVALID_RELATION",
      }
    );
  }

  if (emailAccount.workspaceId !== input.workspaceId) {
    throw new AppError(
      400,
      "Email account does not belong to this workspace",
      {
        code: "INVALID_RELATION",
      }
    );
  }

  // ---------------------------------------------------------
  // Validate enrollment relationships
  // ---------------------------------------------------------

  if (enrollment.campaignId !== input.campaignId) {
    throw new AppError(
      400,
      "Enrollment does not belong to this campaign",
      {
        code: "INVALID_RELATION",
      }
    );
  }

  if (enrollment.contactId !== input.contactId) {
    throw new AppError(
      400,
      "Enrollment does not belong to this contact",
      {
        code: "INVALID_RELATION",
      }
    );
  }

  // ---------------------------------------------------------
  // Validate sequence relationship
  // SequenceStep -> Sequence -> Campaign
  // ---------------------------------------------------------

  const sequence = await prisma.sequence.findUnique({
    where: {
      id: step.sequenceId,
    },
  });

  if (!sequence) {
    throw new AppError(
      400,
      "Sequence not found for this step",
      {
        code: "INVALID_RELATION",
      }
    );
  }

  if (sequence.campaignId !== input.campaignId) {
    throw new AppError(
      400,
      "Sequence step does not belong to this campaign",
      {
        code: "INVALID_RELATION",
      }
    );
  }

  // ---------------------------------------------------------
  // Prevent duplicate scheduling
  // ---------------------------------------------------------

  const existing = await prisma.scheduledEmail.findUnique({
    where: {
      campaignEnrollmentId_sequenceStepId: {
        campaignEnrollmentId: input.campaignEnrollmentId,
        sequenceStepId: input.sequenceStepId,
      },
    },
  });

  if (existing) {
    throw new AppError(
      409,
      "Email already scheduled for this sequence step",
      {
        code: "SCHEDULED_EMAIL_ALREADY_EXISTS",
      }
    );
  }

  // ---------------------------------------------------------
  // Create scheduled email
  // ---------------------------------------------------------

  const scheduledEmail = await prisma.scheduledEmail.create({
    data: {
      workspaceId: input.workspaceId,
      campaignId: input.campaignId,
      contactId: input.contactId,
      campaignEnrollmentId: input.campaignEnrollmentId,
      sequenceStepId: input.sequenceStepId,
      emailAccountId: input.emailAccountId,
      subject: step.subject,
      bodyHtml: step.bodyHtml,
      scheduledAt: input.scheduledAt,
      status: ScheduledEmailStatus.PENDING,
    },
  });

  // ---------------------------------------------------------
  // Calculate BullMQ delay
  // ---------------------------------------------------------

  const delay = Math.max(
    0,
    input.scheduledAt.getTime() - Date.now()
  );

  // ---------------------------------------------------------
  // Add job to BullMQ
  // ---------------------------------------------------------

  const job = await emailQueue.add(
    "send-scheduled-email",
    {
      scheduledEmailId: scheduledEmail.id,
    },
    {
      delay,
    }
  );

  // ---------------------------------------------------------
  // Save BullMQ job ID in database
  // ---------------------------------------------------------

  const updatedScheduledEmail =
    await prisma.scheduledEmail.update({
      where: {
        id: scheduledEmail.id,
      },
      data: {
        bullmqJobId: job.id,
        status: ScheduledEmailStatus.QUEUED,
      },
    });

  return updatedScheduledEmail;
}

// ---------------------------------------------------------
// List scheduled emails
// ---------------------------------------------------------

export async function listScheduledEmails(
  filters: ScheduledEmailListFilters
) {
  return prisma.scheduledEmail.findMany({
    where: {
      workspaceId: filters.workspaceId,
      campaignId: filters.campaignId,
      contactId: filters.contactId,
      status: filters.status,
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });
}

// ---------------------------------------------------------
// Get scheduled email
// ---------------------------------------------------------

export async function getScheduledEmailById(id: string) {
  const scheduledEmail = await prisma.scheduledEmail.findUnique({
    where: { id },
  });

  if (!scheduledEmail) {
    throw new AppError(
      404,
      "Scheduled email not found",
      {
        code: "SCHEDULED_EMAIL_NOT_FOUND",
      }
    );
  }

  return scheduledEmail;
}

// ---------------------------------------------------------
// Update / Reschedule scheduled email
// ---------------------------------------------------------

export async function updateScheduledEmail(
  id: string,
  input: UpdateScheduledEmailInput
) {
  const existing = await prisma.scheduledEmail.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(
      404,
      "Scheduled email not found",
      {
        code: "SCHEDULED_EMAIL_NOT_FOUND",
      }
    );
  }

  // ---------------------------------------------------------
  // Sent emails cannot be modified
  // ---------------------------------------------------------

  if (existing.status === ScheduledEmailStatus.SENT) {
    throw new AppError(
      400,
      "A sent email cannot be modified",
      {
        code: "INVALID_STATUS_TRANSITION",
      }
    );
  }

  // ---------------------------------------------------------
  // Cancelled emails cannot be rescheduled
  // ---------------------------------------------------------

  if (existing.status === ScheduledEmailStatus.CANCELLED) {
    throw new AppError(
      400,
      "A cancelled email cannot be modified",
      {
        code: "INVALID_STATUS_TRANSITION",
      }
    );
  }

  // ---------------------------------------------------------
  // If only status is being updated
  // ---------------------------------------------------------

  if (input.scheduledAt === undefined) {
    return prisma.scheduledEmail.update({
      where: { id },
      data: {
        status: input.status,
      },
    });
  }

  // ---------------------------------------------------------
  // Rescheduling
  // ---------------------------------------------------------

  if (existing.bullmqJobId) {
    const existingJob = await emailQueue.getJob(
      existing.bullmqJobId
    );

    if (existingJob) {
      await existingJob.remove();
    }
  }

  const delay = Math.max(
    0,
    input.scheduledAt.getTime() - Date.now()
  );

  const newJob = await emailQueue.add(
    "send-scheduled-email",
    {
      scheduledEmailId: existing.id,
    },
    {
      delay,
    }
  );

  return prisma.scheduledEmail.update({
    where: {
      id,
    },
    data: {
      scheduledAt: input.scheduledAt,
      status:
        input.status ?? ScheduledEmailStatus.QUEUED,
      bullmqJobId: newJob.id,
    },
  });
}

// ---------------------------------------------------------
// Cancel scheduled email
// ---------------------------------------------------------

export async function cancelScheduledEmail(id: string) {
  const existing = await prisma.scheduledEmail.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(
      404,
      "Scheduled email not found",
      {
        code: "SCHEDULED_EMAIL_NOT_FOUND",
      }
    );
  }

  // ---------------------------------------------------------
  // Sent emails cannot be cancelled
  // ---------------------------------------------------------

  if (existing.status === ScheduledEmailStatus.SENT) {
    throw new AppError(
      400,
      "A sent email cannot be cancelled",
      {
        code: "INVALID_STATUS_TRANSITION",
      }
    );
  }

  // ---------------------------------------------------------
  // Remove BullMQ job
  // ---------------------------------------------------------

  if (existing.bullmqJobId) {
    const existingJob = await emailQueue.getJob(
      existing.bullmqJobId
    );

    if (existingJob) {
      await existingJob.remove();
    }
  }

  // ---------------------------------------------------------
  // Mark as cancelled
  // ---------------------------------------------------------

  return prisma.scheduledEmail.update({
    where: {
      id,
    },
    data: {
      status: ScheduledEmailStatus.CANCELLED,
      bullmqJobId: null,
    },
  });
}