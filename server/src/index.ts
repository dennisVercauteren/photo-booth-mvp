import { createApp } from "./app.js";
import { config } from "./config.js";

const app = createApp();
const server = app.listen(config.port, "127.0.0.1", () => {
  console.info("");
  console.info("AI Photobooth server");
  console.info(`  Local:          http://127.0.0.1:${config.port}`);
  console.info(`  Model:          ${config.geminiModel}`);
  console.info(`  Print:          ${config.aspectRatio}   preview ${config.previewImageSize}, final ${config.imageSize}`);
  console.info(`  API key:        ${config.geminiApiKey ? "configured" : "missing"}`);
  console.info(`  Save outputs:   ${config.saveOutputImages}`);
  console.info(`  Save sources:   ${config.saveSourceImages}`);
  console.info("");
});

server.requestTimeout = config.timeoutMs + 15_000;
server.headersTimeout = config.timeoutMs + 20_000;
