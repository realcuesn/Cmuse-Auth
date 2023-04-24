import { sign } from "jsonwebtoken";

/**
 * Generates a JWT access token with the user's private ID and token version.
 * @param privateId - The user's private ID.
 * @param tokenVersion - The version number of the token.
 * @returns The JWT access token.
 */
function createAccessToken(privateId: string, tokenVersion: number): string {
    const expiresIn = "7d"; // token expiration time (7 days)

    // create a new token with the user's private ID and the token version, with expiresIn option
    const token = sign(
        {
            privateId: privateId,
            version: tokenVersion,
        },
        process.env.SECRET as string, // replace with your own secret key
        { expiresIn: expiresIn } // set token expiration time
    );

    return token;
}

export { createAccessToken };
