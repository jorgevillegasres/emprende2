export function getConfig() {
  return {
    port: Number(process.env.API_PORT ?? 3001),
    webOrigin: process.env.WEB_ORIGIN ?? "http://127.0.0.1:5173"
  };
}
