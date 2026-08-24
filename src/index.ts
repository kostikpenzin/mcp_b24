#!/usr/bin/env node
import { loadConfig } from "./config.js";
import { createServer } from "./server.js";
import { startStdio, startHttp } from "./transport.js";

async function main() {
  const config = loadConfig();
  const { server } = createServer(config);

  const stop = config.transport === "http"
    ? await startHttp(server, config)
    : await startStdio(server);

  const shutdown = async () => {
    try {
      await stop();
    } catch (err) {
      console.error("Shutdown error:", err);
    }
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});