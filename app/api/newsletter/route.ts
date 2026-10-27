import { ok, readJson, newsletterSchema } from "@/lib/api/demo/http";

/** POST /api/newsletter — DEMO ONLY. Validates the e-mail; nobody is subscribed and nothing is stored. */
export async function POST(req: Request) {
  const body = await readJson(req, newsletterSchema);
  if (body instanceof Response) return body;
  return ok({ accepted: true, delivered: false, demo: true, message: "Demo API: address validated, no subscription was created." }, undefined, 202);
}
