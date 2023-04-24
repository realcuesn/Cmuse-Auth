import { verify } from "jsonwebtoken";

/**
 * Verifies a JWT access token and returns the decoded token payload.
 * @param accessToken - The JWT access token to verify.
 * @returns The decoded token payload.
 * @throws An error if the token is invalid or has expired.
 */
function verifyAccessToken(accessToken: string): any {
  const decodedToken = verify(accessToken, process.env.SECRET as string);
  return decodedToken;
}

export { verifyAccessToken };
