import path from 'path';

/**
 * Gets the absolute path for the data directory.
 * It defaults to a local 'data' folder for development, using the current working directory.
 * In production, it uses the path from the LIARA_DATA_DIR environment variable.
 * @returns The full path to the data directory.
 */
const getDataDir = () => process.env.LIARA_DATA_DIR || path.join(process.cwd(), 'data');

/**
 * Gets the absolute path for a data file.
 * @param fileName - The name of the data file (e.g., 'reservations.json').
 * @returns The full path to the data file.
 */
export function getDataFilePath(fileName: string): string {
  return path.join(getDataDir(), fileName);
}

