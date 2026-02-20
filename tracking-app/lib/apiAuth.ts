import crypto from "crypto";
import { connectToDatabase } from "./mongodb";

// Allowed origins for CORS - loaded from environment variable
const originsEnv = process.env.ALLOWED_ORIGINS || "";
export const allowedOrigins = originsEnv
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Allow requests without origin (e.g., Postman, server-to-server)
  return allowedOrigins.some((allowed) => origin.includes(allowed));
}

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    // include custom auth headers so preflight permits `x-api-key` and `x-api-secret`
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, x-api-secret",
    // Security headers
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  };

  if (origin && isOriginAllowed(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    // required when browser requests use credentials: 'include'
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  return headers;
}

export function handleOptions(origin: string | null) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

// ============================================
// API Key/Secret Authentication
// ============================================

/**
 * Hash a value using SHA-256
 */
function hashValue(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/**
 * Generate new API credentials for a client
 * Returns plain keys ONCE - they are not stored in plain text
 */
export async function generateApiCredentials(clientName: string): Promise<{
  apiKey: string;
  apiSecret: string;
  clientName: string;
}> {
  const db = await connectToDatabase();
  const collection = db.collection("apiCredentials");

  // Generate random keys
  const apiKey = crypto.randomBytes(32).toString("hex");
  const apiSecret = crypto.randomBytes(64).toString("hex");

  // Hash the keys before storing
  const hashedApiKey = hashValue(apiKey);
  const hashedApiSecret = hashValue(apiSecret);

  // Store hashed credentials in database
  await collection.insertOne({
    clientName,
    hashedApiKey,
    hashedApiSecret,
    createdAt: new Date(),
    lastUsedAt: null,
    isActive: true,
  });

  // Return plain keys (only time they're available)
  return {
    apiKey,
    apiSecret,
    clientName,
  };
}

/**
 * Validate API credentials from request headers
 */
export async function validateApiCredentials(apiKey: string | null, apiSecret: string | null): Promise<boolean> {
  if (!apiKey || !apiSecret) {
    return false;
  }

  const db = await connectToDatabase();
  const collection = db.collection("apiCredentials");

  // Hash the provided credentials
  const hashedApiKey = hashValue(apiKey);
  const hashedApiSecret = hashValue(apiSecret);

  // Find matching credentials
  const credentials = await collection.findOne({
    hashedApiKey,
    hashedApiSecret,
    isActive: true,
  });

  if (!credentials) {
    return false;
  }

  // Update last used timestamp
  await collection.updateOne({ _id: credentials._id }, { $set: { lastUsedAt: new Date() } });

  return true;
}

/**
 * Revoke API credentials for a client
 */
export async function revokeApiCredentials(clientName: string): Promise<boolean> {
  const db = await connectToDatabase();
  const collection = db.collection("apiCredentials");

  const result = await collection.updateOne({ clientName, isActive: true }, { $set: { isActive: false } });

  return result.modifiedCount > 0;
}

/**
 * Helper to authenticate a request and return error response if invalid
 * Returns null if valid, or a Response object if authentication failed
 */
export async function authenticateRequest(request: Request): Promise<Response | null> {
  const origin = request.headers.get("origin");
  const headers = getCorsHeaders(origin);

  const apiKey = request.headers.get("x-api-key");
  const apiSecret = request.headers.get("x-api-secret");

  const isValid = await validateApiCredentials(apiKey, apiSecret);

  if (!isValid) {
    return new Response(JSON.stringify({ error: "Unauthorized: Invalid API credentials" }), { status: 401, headers });
  }

  return null; // Authentication successful
}
