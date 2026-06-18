import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { Role, TenantId } from "@/lib/domain/types";

export interface InvitePayload {
  email: string;
  role: Role;
  tenantId: TenantId;
  /** Unix timestamp (seconds) waarop de uitnodiging verloopt. */
  exp: number;
}

export const INVITE_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 dagen
const DEFAULT_TTL_SECONDS = INVITE_TTL_SECONDS;

function getSecret(): string {
  const secret = process.env.INVITE_TOKEN_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "INVITE_TOKEN_SECRET ontbreekt of is te kort. Zet een willekeurige waarde (>= 32 tekens) in je omgeving.",
    );
  }
  return secret;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

/**
 * Bouwt een stateless, ondertekende uitnodigingstoken. Er is geen database
 * nodig om de token later te valideren: alle gegevens zitten in de payload en
 * worden beschermd met een HMAC-handtekening + vervaltijd.
 */
export function createInviteToken(
  input: Omit<InvitePayload, "exp"> & { ttlSeconds?: number },
): string {
  const { ttlSeconds = DEFAULT_TTL_SECONDS, ...rest } = input;
  const payload: InvitePayload = {
    ...rest,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const body = base64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export type VerifyResult =
  | { ok: true; payload: InvitePayload }
  | { ok: false; reason: "malformed" | "bad_signature" | "expired" };

/** Valideert een uitnodigingstoken en geeft de payload terug als die klopt. */
export function verifyInviteToken(token: string): VerifyResult {
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "malformed" };

  const [body, signature] = parts;
  const expected = sign(body);

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "bad_signature" };
  }

  let payload: InvitePayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as InvitePayload;
  } catch {
    return { ok: false, reason: "malformed" };
  }

  if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, payload };
}

/**
 * Stabiele hash van een token om in de database op te slaan. Zo bewaren we niet
 * de token zelf (die in de e-mail staat), maar kunnen we hem wel opzoeken.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
