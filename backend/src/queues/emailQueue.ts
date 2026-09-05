import { Queue } from "bullmq";
import { redisConnection } from "./redis";

export interface SendEmailJobData {
  scheduledEmailId: string;
}

export const emailQueue = new Queue<SendEmailJobData>(
  "email-sending",
  {
    connection: redisConnection,

    defaultJobOptions: {
      attempts: 3,

      backoff: {
        type: "exponential",
        delay: 5000,
      },

      removeOnComplete: 100,
      removeOnFail: 500,
    },
  }
);