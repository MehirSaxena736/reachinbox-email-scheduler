import { emailWorker } from "./workers/emailWorker";

console.log("Email worker started");

async function shutdown(signal: string) {
  console.log(`${signal} received. Shutting down worker...`);

  await emailWorker.close();

  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});