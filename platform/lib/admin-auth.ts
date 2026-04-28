import { SignJWT, jwtVerify } from "jose";

export const adminCookieName = "foxes_admin_session";

function getJwtKey(): Uint8Array {
  const s = process.env.ADMIN_JWT_SECRET;
  if (!s || s.length < 24) throw new Error("ADMIN_JWT_SECRET must be set (≥24 chars)");
  return new TextEncoder().encode(s.slice(0, 64));
}

export async function createAdminJwt(): Promise<string> {
  const key = getJwtKey();
  return new SignJWT({ sub: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(key);
}

export async function verifyAdminJwt(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getJwtKey());
    return true;
  } catch {
    return false;
  }
}
