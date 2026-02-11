// Allowed origins for CORS - loaded from environment variable
// Set ALLOWED_ORIGINS in .env as a comma-separated list, e.g.:
// ALLOWED_ORIGINS=https://cp.conversio.com,http://localhost:3000,http://localhost:3001
const originsEnv = process.env.ALLOWED_ORIGINS || "";
export const allowedOrigins = originsEnv
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Allow requests without origin (e.g., Postman, server-to-server)
  return allowedOrigins.some((allowed) => origin.startsWith(allowed));
}

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (origin && isOriginAllowed(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

export function handleOptions(origin: string | null) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}
