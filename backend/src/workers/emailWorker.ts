import { Worker, Job } from "bullmq";
import nodemailer from "nodemailer";
import { prisma } from "../lib/prisma";
import { redisConnection } from "../queues/redis";
import { SendEmailJobData } from "../queues/emailQueue";
import { ScheduledEmailStatus } from "@prisma/client";
import { config } from "../config";
import { createGoogleTransporter } from "../services/google/googleOAuthService";

async function processEmailJob(job: Job<SendEmailJobData>) {
  const scheduledEmail = await prisma.scheduledEmail.findUnique({
    where: {
      id: job.data.scheduledEmailId,
    },
    include: {
      emailAccount: true,
      contact: true,
    },
  });

  if (!scheduledEmail) {
    throw new Error("Scheduled email not found");
  }

  if (scheduledEmail.status === ScheduledEmailStatus.CANCELLED) {
    return {
      skipped: true,
      reason: "Email was cancelled",
    };
  }

  if (scheduledEmail.status === ScheduledEmailStatus.SENT) {
    return {
      skipped: true,
      reason: "Email was already sent",
    };
  }

  const emailAccount = scheduledEmail.emailAccount;

  if (!emailAccount) {
    throw new Error("Email account not found");
  }

  if (emailAccount.status !== "ACTIVE") {
    throw new Error("Email account is not active");
  }

  if (
    emailAccount.provider === "GOOGLE" &&
    !emailAccount.googleRefreshToken
  ) {
    throw new Error(
      "Google refresh token is not configured"
    );
  }

  if (
    emailAccount.provider === "SMTP" ||
    emailAccount.provider === "ETHEREAL"
  ) {
    if (
      !emailAccount.smtpHost ||
      !emailAccount.smtpPort ||
      !emailAccount.smtpUser ||
      !emailAccount.smtpPass
    ) {
      throw new Error(
        "SMTP host, port, username and password are not configured"
      );
    }
  }

  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;

  const recentSentEmails = await prisma.scheduledEmail.count({
    where: {
      emailAccountId: emailAccount.id,
      status: ScheduledEmailStatus.SENT,
      sentAt: {
        gte: new Date(hourAgo),
      },
    },
  });

  if (
    recentSentEmails >=
    config.worker.maxEmailsPerHourPerSender
  ) {
    throw new Error(
      `Hourly email limit reached for sender ${emailAccount.email}`
    );
  }

  const lastSentKey =
    `email-rate:${emailAccount.id}:last-sent`;

  const lastSentAt =
    await redisConnection.get(lastSentKey);

  if (lastSentAt) {
    const elapsed = now - Number(lastSentAt);

    const remaining =
      config.worker.minDelayBetweenEmailsMs - elapsed;

    if (remaining > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, remaining)
      );
    }
  }

  let transporter;

  if (emailAccount.provider === "GOOGLE") {
    const googleTransport =
      await createGoogleTransporter(
        emailAccount.googleRefreshToken!
      );

    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: emailAccount.email,
        clientId: config.google.clientId,
        clientSecret: config.google.clientSecret,
        refreshToken: emailAccount.googleRefreshToken!,
        accessToken: googleTransport.accessToken,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: emailAccount.smtpHost!,
      port: emailAccount.smtpPort!,
      secure: emailAccount.smtpPort === 465,
      auth: {
        user: emailAccount.smtpUser!,
        pass: emailAccount.smtpPass!,
      },
    });
  }

  try {
    const info = await transporter.sendMail({
      from: emailAccount.email,
      to: scheduledEmail.contact.email,
      subject: scheduledEmail.subject,
      html: scheduledEmail.bodyHtml,
    });

    await redisConnection.set(
      lastSentKey,
      Date.now().toString(),
      "PX",
      config.worker.minDelayBetweenEmailsMs
    );

    await prisma.scheduledEmail.update({
      where: {
        id: scheduledEmail.id,
      },
      data: {
        status: ScheduledEmailStatus.SENT,
        sentAt: new Date(),
        bullmqJobId: null,
        messageId: info.messageId,
      },
    });

    await prisma.emailEvent.create({
      data: {
        scheduledEmailId: scheduledEmail.id,
        type: "SENT",
        metadata: {
          messageId: info.messageId,
        },
      },
    });

    return {
      sent: true,
      scheduledEmailId: scheduledEmail.id,
      messageId: info.messageId,
    };
  } catch (error) {
    const failureReason =
      error instanceof Error
        ? error.message
        : "Unknown email sending error";

    const maxAttempts = job.opts.attempts ?? 1;
    const currentAttempt = job.attemptsMade + 1;

    const hasRetriesLeft =
      currentAttempt < maxAttempts;

    if (hasRetriesLeft) {
      await prisma.scheduledEmail.update({
        where: {
          id: scheduledEmail.id,
        },
        data: {
          status: ScheduledEmailStatus.QUEUED,
          failureReason,
        },
      });
    } else {
      await prisma.scheduledEmail.update({
        where: {
          id: scheduledEmail.id,
        },
        data: {
          status: ScheduledEmailStatus.FAILED,
          failedAt: new Date(),
          failureReason,
          bullmqJobId: null,
        },
      });

      await prisma.emailEvent.create({
        data: {
          scheduledEmailId: scheduledEmail.id,
          type: "FAILED",
          metadata: {
            reason: failureReason,
            attempts: currentAttempt,
          },
        },
      });
    }

    throw error;
  }
}

export const emailWorker = new Worker<SendEmailJobData>(
  "email-sending",
  processEmailJob,
  {
    connection: redisConnection,
    concurrency: config.worker.concurrency,
  }
);

emailWorker.on("completed", (job) => {
  console.log(`Email job completed: ${job.id}`);
});

emailWorker.on("failed", (job, error) => {
  console.error(
    `Email job failed: ${job?.id}`,
    error
  );
});