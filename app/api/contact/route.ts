import { ok, readJson, contactSchema } from "@/lib/api/demo/http";

/**
 * POST /api/contact — DEMO ONLY. Validates the payload and replies; it does NOT send e-mail,
 * store the message or log personal data. Replace with a real endpoint in backend mode.
 */
export async function POST(req: Request) {
  const body = await readJson(req, contactSchema);
  if (body instanceof Response) return body;
  return ok({ accepted: true, delivered: false, demo: true, message: "Demo API: message validated, nothing was sent or stored." }, undefined, 202);
}
