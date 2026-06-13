import { buildApp } from "./app.js";
import { getConfig } from "./config.js";

const app = buildApp();
const config = getConfig();

await app.listen({ port: config.port, host: config.host });
console.log(`Emprendedos API running on http://${config.host}:${config.port}`);
