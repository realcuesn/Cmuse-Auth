import { v5 as uuid } from "uuid";

/**
 * Generates a UUIDv5 based on the current timestamp and an argument
 * @param {string} arg - The argument to include in the UUID
 * @returns {string} A UUIDv5 string
 */
const generateTimestampBasedUUID = (arg: string): string => {
  // Generate the UUIDv5 using the current timestamp and the argument,
  // using the URL namespace
  return uuid(Date.now().toString() + arg, uuid.URL);
};

export { generateTimestampBasedUUID };