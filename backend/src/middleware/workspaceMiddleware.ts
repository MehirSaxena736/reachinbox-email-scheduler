import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { AuthenticatedRequest } from "./authMiddleware";

export async function requireWorkspaceAccess(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user?.userId) {
      throw new AppError(401, "Authentication required", {
        code: "UNAUTHORIZED",
      });
    }

    const workspaceId =
      typeof req.params.workspaceId === "string"
        ? req.params.workspaceId
        : typeof req.body?.workspaceId === "string"
          ? req.body.workspaceId
          : typeof req.query.workspaceId === "string"
            ? req.query.workspaceId
            : undefined;

    if (!workspaceId) {
      throw new AppError(400, "workspaceId is required", {
        code: "WORKSPACE_ID_REQUIRED",
      });
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: authReq.user.userId,
        },
      },
    });

    if (!membership) {
      throw new AppError(
        403,
        "You do not have access to this workspace",
        {
          code: "WORKSPACE_ACCESS_DENIED",
        }
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}

export async function requireCampaignAccess(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user?.userId) {
      throw new AppError(401, "Authentication required", {
        code: "UNAUTHORIZED",
      });
    }

    const campaignId =
      typeof req.params.id === "string"
        ? req.params.id
        : typeof req.params.campaignId === "string"
          ? req.params.campaignId
          : typeof req.body?.campaignId === "string"
            ? req.body.campaignId
            : undefined;

    if (!campaignId) {
      throw new AppError(400, "Campaign id is required", {
        code: "CAMPAIGN_ID_REQUIRED",
      });
    }

    const campaign = await prisma.campaign.findUnique({
      where: {
        id: campaignId,
      },
      select: {
        workspaceId: true,
      },
    });

    if (!campaign) {
      throw new AppError(404, "Campaign not found", {
        code: "CAMPAIGN_NOT_FOUND",
      });
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: campaign.workspaceId,
          userId: authReq.user.userId,
        },
      },
    });

    if (!membership) {
      throw new AppError(
        403,
        "You do not have access to this campaign",
        {
          code: "CAMPAIGN_ACCESS_DENIED",
        }
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}
export async function requireContactAccess(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user?.userId) {
      throw new AppError(401, "Authentication required", {
        code: "UNAUTHORIZED",
      });
    }

    const contactId =
      typeof req.params.id === "string"
        ? req.params.id
        : undefined;

    if (!contactId) {
      throw new AppError(400, "Contact id is required", {
        code: "CONTACT_ID_REQUIRED",
      });
    }

    const contact = await prisma.contact.findUnique({
      where: {
        id: contactId,
      },
      select: {
        workspaceId: true,
      },
    });

    if (!contact) {
      throw new AppError(404, "Contact not found", {
        code: "CONTACT_NOT_FOUND",
      });
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: contact.workspaceId,
          userId: authReq.user.userId,
        },
      },
    });

    if (!membership) {
      throw new AppError(
        403,
        "You do not have access to this contact",
        {
          code: "CONTACT_ACCESS_DENIED",
        }
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}
export async function requireSequenceAccess(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user?.userId) {
      throw new AppError(401, "Authentication required", {
        code: "UNAUTHORIZED",
      });
    }

    const sequenceId =
      typeof req.params.id === "string"
        ? req.params.id
        : undefined;

    if (!sequenceId) {
      throw new AppError(400, "Sequence id is required", {
        code: "SEQUENCE_ID_REQUIRED",
      });
    }

    const sequence = await prisma.sequence.findUnique({
      where: {
        id: sequenceId,
      },
      select: {
        campaign: {
          select: {
            workspaceId: true,
          },
        },
      },
    });

    if (!sequence) {
      throw new AppError(404, "Sequence not found", {
        code: "SEQUENCE_NOT_FOUND",
      });
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: sequence.campaign.workspaceId,
          userId: authReq.user.userId,
        },
      },
    });

    if (!membership) {
      throw new AppError(
        403,
        "You do not have access to this sequence",
        {
          code: "SEQUENCE_ACCESS_DENIED",
        }
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}

export async function requireSequenceStepAccess(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user?.userId) {
      throw new AppError(401, "Authentication required", {
        code: "UNAUTHORIZED",
      });
    }

    const stepId =
      typeof req.params.id === "string"
        ? req.params.id
        : undefined;

    if (!stepId) {
      throw new AppError(400, "Sequence step id is required", {
        code: "SEQUENCE_STEP_ID_REQUIRED",
      });
    }

    const step = await prisma.sequenceStep.findUnique({
      where: {
        id: stepId,
      },
      select: {
        sequence: {
          select: {
            campaign: {
              select: {
                workspaceId: true,
              },
            },
          },
        },
      },
    });

    if (!step) {
      throw new AppError(404, "Sequence step not found", {
        code: "SEQUENCE_STEP_NOT_FOUND",
      });
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: step.sequence.campaign.workspaceId,
          userId: authReq.user.userId,
        },
      },
    });

    if (!membership) {
      throw new AppError(
        403,
        "You do not have access to this sequence step",
        {
          code: "SEQUENCE_STEP_ACCESS_DENIED",
        }
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}

export async function requireScheduledEmailAccess(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user?.userId) {
      throw new AppError(401, "Authentication required", {
        code: "UNAUTHORIZED",
      });
    }

    const scheduledEmailId =
      typeof req.params.id === "string"
        ? req.params.id
        : undefined;

    if (!scheduledEmailId) {
      throw new AppError(400, "Scheduled email id is required", {
        code: "SCHEDULED_EMAIL_ID_REQUIRED",
      });
    }

    const scheduledEmail = await prisma.scheduledEmail.findUnique({
      where: {
        id: scheduledEmailId,
      },
      select: {
        workspaceId: true,
      },
    });

    if (!scheduledEmail) {
      throw new AppError(404, "Scheduled email not found", {
        code: "SCHEDULED_EMAIL_NOT_FOUND",
      });
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: scheduledEmail.workspaceId,
          userId: authReq.user.userId,
        },
      },
    });

    if (!membership) {
      throw new AppError(
        403,
        "You do not have access to this scheduled email",
        {
          code: "SCHEDULED_EMAIL_ACCESS_DENIED",
        }
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}
export async function requireEnrollmentAccess(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user?.userId) {
      throw new AppError(401, "Authentication required", {
        code: "UNAUTHORIZED",
      });
    }

    const enrollmentId =
      typeof req.params.id === "string"
        ? req.params.id
        : undefined;

    if (!enrollmentId) {
      throw new AppError(400, "Campaign enrollment id is required", {
        code: "ENROLLMENT_ID_REQUIRED",
      });
    }

    const enrollment =
      await prisma.campaignEnrollment.findUnique({
        where: {
          id: enrollmentId,
        },
        select: {
          campaign: {
            select: {
              workspaceId: true,
            },
          },
        },
      });

    if (!enrollment) {
      throw new AppError(
        404,
        "Campaign enrollment not found",
        {
          code: "ENROLLMENT_NOT_FOUND",
        }
      );
    }

    const membership =
      await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: enrollment.campaign.workspaceId,
            userId: authReq.user.userId,
          },
        },
      });

    if (!membership) {
      throw new AppError(
        403,
        "You do not have access to this campaign enrollment",
        {
          code: "ENROLLMENT_ACCESS_DENIED",
        }
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}
export async function requireEnrollmentQueryAccess(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user?.userId) {
      throw new AppError(401, "Authentication required", {
        code: "UNAUTHORIZED",
      });
    }

    const campaignId =
      typeof req.query.campaignId === "string"
        ? req.query.campaignId
        : undefined;

    const contactId =
      typeof req.query.contactId === "string"
        ? req.query.contactId
        : undefined;

    if (!campaignId && !contactId) {
      throw new AppError(
        400,
        "campaignId or contactId is required",
        {
          code: "ENROLLMENT_FILTER_REQUIRED",
        }
      );
    }

    let workspaceId: string | undefined;

    if (campaignId) {
      const campaign = await prisma.campaign.findUnique({
        where: {
          id: campaignId,
        },
        select: {
          workspaceId: true,
        },
      });

      if (!campaign) {
        throw new AppError(404, "Campaign not found", {
          code: "CAMPAIGN_NOT_FOUND",
        });
      }

      workspaceId = campaign.workspaceId;
    }

    if (contactId) {
      const contact = await prisma.contact.findUnique({
        where: {
          id: contactId,
        },
        select: {
          workspaceId: true,
        },
      });

      if (!contact) {
        throw new AppError(404, "Contact not found", {
          code: "CONTACT_NOT_FOUND",
        });
      }

      if (workspaceId && workspaceId !== contact.workspaceId) {
        throw new AppError(
          400,
          "Campaign and contact must belong to the same workspace",
          {
            code: "INVALID_RELATION",
          }
        );
      }

      workspaceId = contact.workspaceId;
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspaceId!,
          userId: authReq.user.userId,
        },
      },
    });

    if (!membership) {
      throw new AppError(
        403,
        "You do not have access to these campaign enrollments",
        {
          code: "ENROLLMENT_ACCESS_DENIED",
        }
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}
export async function requireEmailEventCreateAccess(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user?.userId) {
      throw new AppError(401, "Authentication required", {
        code: "UNAUTHORIZED",
      });
    }

    const scheduledEmailId =
      typeof req.body?.scheduledEmailId === "string"
        ? req.body.scheduledEmailId
        : undefined;

    if (!scheduledEmailId) {
      throw new AppError(400, "scheduledEmailId is required", {
        code: "SCHEDULED_EMAIL_ID_REQUIRED",
      });
    }

    const scheduledEmail =
      await prisma.scheduledEmail.findUnique({
        where: {
          id: scheduledEmailId,
        },
        select: {
          workspaceId: true,
        },
      });

    if (!scheduledEmail) {
      throw new AppError(404, "Scheduled email not found", {
        code: "SCHEDULED_EMAIL_NOT_FOUND",
      });
    }

    const membership =
      await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: scheduledEmail.workspaceId,
            userId: authReq.user.userId,
          },
        },
      });

    if (!membership) {
      throw new AppError(
        403,
        "You do not have access to this scheduled email",
        {
          code: "EMAIL_EVENT_ACCESS_DENIED",
        }
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}
export async function requireEmailEventAccess(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user?.userId) {
      throw new AppError(401, "Authentication required", {
        code: "UNAUTHORIZED",
      });
    }

    const eventId =
      typeof req.params.id === "string"
        ? req.params.id
        : undefined;

    if (!eventId) {
      throw new AppError(400, "Email event id is required", {
        code: "EMAIL_EVENT_ID_REQUIRED",
      });
    }

    const event = await prisma.emailEvent.findUnique({
      where: {
        id: eventId,
      },
      select: {
        scheduledEmail: {
          select: {
            workspaceId: true,
          },
        },
      },
    });

    if (!event) {
      throw new AppError(404, "Email event not found", {
        code: "EMAIL_EVENT_NOT_FOUND",
      });
    }

    const membership =
      await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: event.scheduledEmail.workspaceId,
            userId: authReq.user.userId,
          },
        },
      });

    if (!membership) {
      throw new AppError(
        403,
        "You do not have access to this email event",
        {
          code: "EMAIL_EVENT_ACCESS_DENIED",
        }
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}
export async function requireEmailEventQueryAccess(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user?.userId) {
      throw new AppError(401, "Authentication required", {
        code: "UNAUTHORIZED",
      });
    }

    const scheduledEmailId =
      typeof req.query.scheduledEmailId === "string"
        ? req.query.scheduledEmailId
        : undefined;

    if (!scheduledEmailId) {
      throw new AppError(
        400,
        "scheduledEmailId is required",
        {
          code: "SCHEDULED_EMAIL_ID_REQUIRED",
        }
      );
    }

    const scheduledEmail =
      await prisma.scheduledEmail.findUnique({
        where: {
          id: scheduledEmailId,
        },
        select: {
          workspaceId: true,
        },
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

    const membership =
      await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: scheduledEmail.workspaceId,
            userId: authReq.user.userId,
          },
        },
      });

    if (!membership) {
      throw new AppError(
        403,
        "You do not have access to these email events",
        {
          code: "EMAIL_EVENT_ACCESS_DENIED",
        }
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}
export async function requireEmailAccountAccess(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    const emailAccountId =
  typeof req.params.id === "string"
    ? req.params.id
    : undefined;


    if (!emailAccountId) {
      return next(
        new AppError(400, "Email account id is required", {
          code: "VALIDATION_ERROR",
        })
      );
    }

    if (!req.user?.userId) {
      return next(
        new AppError(401, "Unauthorized", {
          code: "UNAUTHORIZED",
        })
      );
    }

    const emailAccount = await prisma.emailAccount.findUnique({
      where: {
        id: emailAccountId,
      },
      select: {
        id: true,
        workspaceId: true,
      },
    });

    if (!emailAccount) {
      return next(
        new AppError(404, "Email account not found", {
          code: "EMAIL_ACCOUNT_NOT_FOUND",
        })
      );
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: emailAccount.workspaceId,
          userId: req.user.userId,
        },
      },
    });

    if (!membership) {
      return next(
        new AppError(403, "You do not have access to this email account", {
          code: "FORBIDDEN",
        })
      );
    }

    req.workspaceMember = membership;

    next();
  } catch (error) {
    next(error);
  }
}