import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

interface CreateSequenceInput {
  campaignId: string;
  name: string;
}

interface UpdateSequenceInput {
  name?: string;
}

interface CreateSequenceStepInput {
  sequenceId: string;
  stepNumber: number;
  subject: string;
  body: string;
  delayMinutes?: number;
}

interface UpdateSequenceStepInput {
  stepNumber?: number;
  subject?: string;
  body?: string;
  delayMinutes?: number;
}

export async function createSequence(input: CreateSequenceInput) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: input.campaignId },
  });

  if (!campaign) {
    throw new AppError(404, "Campaign not found", {
      code: "CAMPAIGN_NOT_FOUND",
    });
  }

  const existing = await prisma.sequence.findUnique({
    where: {
      campaignId: input.campaignId,
    },
  });

  if (existing) {
    throw new AppError(409, "Sequence already exists for this campaign", {
      code: "SEQUENCE_ALREADY_EXISTS",
    });
  }

  return prisma.sequence.create({
    data: {
      campaignId: input.campaignId,
    },
    include: {
      steps: {
        orderBy: {
          stepNumber: "asc",
        },
      },
    },
  });
}

export async function getSequenceByCampaignId(campaignId: string) {
  const sequence = await prisma.sequence.findUnique({
    where: {
      campaignId,
    },
    include: {
      steps: {
        orderBy: {
          stepNumber: "asc",
        },
      },
    },
  });

  if (!sequence) {
    throw new AppError(404, "Sequence not found", {
      code: "SEQUENCE_NOT_FOUND",
    });
  }

  return sequence;
}

export async function updateSequence(
  id: string,
  _input: UpdateSequenceInput
) {
  const existing = await prisma.sequence.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, "Sequence not found", {
      code: "SEQUENCE_NOT_FOUND",
    });
  }

  // Current Prisma Sequence model has no editable "name" field.
  return existing;
}

export async function deleteSequence(id: string) {
  const existing = await prisma.sequence.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, "Sequence not found", {
      code: "SEQUENCE_NOT_FOUND",
    });
  }

  await prisma.sequence.delete({
    where: { id },
  });
}

export async function createSequenceStep(
  input: CreateSequenceStepInput
) {
  const sequence = await prisma.sequence.findUnique({
    where: { id: input.sequenceId },
  });

  if (!sequence) {
    throw new AppError(404, "Sequence not found", {
      code: "SEQUENCE_NOT_FOUND",
    });
  }

  const existing = await prisma.sequenceStep.findFirst({
    where: {
      sequenceId: input.sequenceId,
      stepNumber: input.stepNumber,
    },
  });

  if (existing) {
    throw new AppError(409, "Sequence step number already exists", {
      code: "SEQUENCE_STEP_ALREADY_EXISTS",
    });
  }

  return prisma.sequenceStep.create({
    data: {
      sequenceId: input.sequenceId,
      stepNumber: input.stepNumber,
      subject: input.subject.trim(),
      bodyHtml: input.body,
      delayMinutes: input.delayMinutes ?? 0,
    },
  });
}

export async function updateSequenceStep(
  id: string,
  input: UpdateSequenceStepInput
) {
  const existing = await prisma.sequenceStep.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, "Sequence step not found", {
      code: "SEQUENCE_STEP_NOT_FOUND",
    });
  }

  if (input.stepNumber !== undefined) {
    const duplicate = await prisma.sequenceStep.findFirst({
      where: {
        sequenceId: existing.sequenceId,
        stepNumber: input.stepNumber,
        NOT: {
          id,
        },
      },
    });

    if (duplicate) {
      throw new AppError(409, "Sequence step number already exists", {
        code: "SEQUENCE_STEP_ALREADY_EXISTS",
      });
    }
  }

  return prisma.sequenceStep.update({
    where: { id },
    data: {
      stepNumber: input.stepNumber,
      subject: input.subject?.trim(),
      bodyHtml: input.body,
      delayMinutes: input.delayMinutes,
    },
  });
}

export async function deleteSequenceStep(id: string) {
  const existing = await prisma.sequenceStep.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, "Sequence step not found", {
      code: "SEQUENCE_STEP_NOT_FOUND",
    });
  }

  await prisma.sequenceStep.delete({
    where: { id },
  });
}