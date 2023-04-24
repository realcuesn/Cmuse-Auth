import { genSalt, hash } from "bcrypt";

/**
 * Hashes a password using bcrypt
 * @param {string} password - The password to hash
 * @returns {Promise<string>} A promise that resolves to the hashed password
 */
const hashPassword = async (password: string): Promise<string> => {
    // Generate a salt to be used in the hash
    const saltRounds = 10;
    const salt = await genSalt(saltRounds);
    // Hash the password using the generated salt
    const hashedPassword = await hash(password, salt);
    return hashedPassword;
};
export { hashPassword };
