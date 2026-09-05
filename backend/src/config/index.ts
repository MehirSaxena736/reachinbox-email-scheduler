import dotenv from "dotenv";

dotenv.config();

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  port: parseInt(requireEnv("PORT", "3000"), 10),
  databaseUrl: requireEnv("DATABASE_URL"),
  redis: {
    host: requireEnv("REDIS_HOST", "localhost"),
    port: parseInt(requireEnv("REDIS_PORT", "6379"), 10),
  },
  elasticsearch: {
    node: requireEnv("ELASTICSEARCH_NODE", "http://localhost:9200"),
  },
  worker: {
    concurrency: parseInt(requireEnv("WORKER_CONCURRENCY", "5"), 10),
    minDelayBetweenEmailsMs: parseInt(
      requireEnv("MIN_DELAY_BETWEEN_EMAILS_MS", "2000"),
      10
    ),
    maxEmailsPerHourPerSender: parseInt(
      requireEnv("MAX_EMAILS_PER_HOUR_PER_SENDER", "100"),
      10
    ),
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    callbackUrl: process.env.GOOGLE_CALLBACK_URL ?? "",
  },
  jwt: {
    secret: requireEnv("JWT_SECRET", "dev-secret-change-in-production"),
  },
  slack: {
    clientId: process.env.SLACK_CLIENT_ID ?? "",
    clientSecret: process.env.SLACK_CLIENT_SECRET ?? "",
    redirectUri: process.env.SLACK_REDIRECT_URI ?? "",
  },
} as const;
