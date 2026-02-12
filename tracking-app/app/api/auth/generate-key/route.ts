import { NextRequest } from "next/server";
import { getCorsHeaders, handleOptions, generateApiCredentials } from "@/lib/apiAuth";

/**
 * API Key Generation Endpoint
 *
 * Usage:
 * curl -X POST http://localhost:3000/api/auth/generate-key \
 *   -H "Content-Type: application/json" \
 *   -H "x-admin-secret: xK9mP2vL7nQ4wR8tY3bF6hJ0cG5dA1sE" \
 *   -d '{"clientName": "my-client"}'
 */

// Secret token to protect key generation (set in .env)
const ADMIN_SECRET = process.env.ADMIN_SECRET;

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return handleOptions(origin);
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = getCorsHeaders(origin);

  try {
    // Verify admin secret to prevent unauthorized key generation
    const adminSecret = request.headers.get("x-admin-secret");

    if (!ADMIN_SECRET || adminSecret !== ADMIN_SECRET) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
    }

    // Get client name from request body
    const body = await request.json();
    const { clientName } = body;

    if (!clientName || typeof clientName !== "string") {
      return new Response(JSON.stringify({ error: "clientName is required" }), { status: 400, headers });
    }

    // Generate new credentials
    const credentials = await generateApiCredentials(clientName);

    return new Response(
      JSON.stringify({
        message: "API credentials generated successfully. Save these keys - they won't be shown again!",
        credentials,
      }),
      { status: 201, headers },
    );
  } catch (error) {
    console.error("Error generating API credentials:", error);
    return new Response(JSON.stringify({ error: "Failed to generate credentials" }), { status: 500, headers });
  }
}
