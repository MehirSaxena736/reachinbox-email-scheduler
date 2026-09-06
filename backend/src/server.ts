import { createApp } from "./app";
import { config } from "./config";

const app = createApp();

const port = Number(process.env.PORT) || config.port;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on 0.0.0.0:${port}`);
});