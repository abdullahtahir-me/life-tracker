import { createHmac, timingSafeEqual } from "crypto";

const calendarSecret = process.env.CALENDAR_TOKEN_SECRET ?? process.env.CALENDAR_SYNC_TOKEN;

function getCalendarSecret() {
  if (!calendarSecret) {
    throw new Error("Missing CALENDAR_TOKEN_SECRET or CALENDAR_SYNC_TOKEN");
  }

  return calendarSecret;
}

function signUserId(userId: string) {
  return createHmac("sha256", getCalendarSecret())
    .update(userId)
    .digest("base64url");
}

export function createCalendarToken(userId: string) {
  return `${userId}.${signUserId(userId)}`;
}

export function verifyCalendarToken(token: string | null) {
  if (!token) return null;

  const separatorIndex = token.indexOf(".");
  if (separatorIndex === -1) return null;

  const userId = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  const expectedSignature = signUserId(userId);

  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedSignatureBuffer.length) return null;

  return timingSafeEqual(signatureBuffer, expectedSignatureBuffer) ? userId : null;
}
