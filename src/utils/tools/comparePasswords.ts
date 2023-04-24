import { compare } from "bcrypt";

/**
 * Compares a plain text password to a hashed password
 * @param {string} password - The plain text password to compare
 * @param {string} hashedPassword - The hashed password to compare against
 * @returns {Promise<boolean>} A promise that resolves to true if the passwords match, false otherwise
 */
const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  // Compare the plain text password to the hashed password using bcrypt
  const passwordsMatch = await compare(password, hashedPassword);
  return passwordsMatch;
};

export { comparePasswords };
