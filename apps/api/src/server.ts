import { buildApp } from "./app.js";
import { getConfig } from "./config.js";

const app = buildApp();
const config = getConfig();

await app.listen({ port: config.port, host: "127.0.0.1" });
console.log(`Emprendedos API running on http://127.0.0.1:${config.port}`);
