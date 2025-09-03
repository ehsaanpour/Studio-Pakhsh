import fs from 'fs/promises';
import path from 'path';
import { getDataFilePath } from '@/lib/data-path';

export async function writeJsonFile(filePath: string, data: any): Promise<void> {
  try {
    // Ensure the directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    
    // Write the file with pretty formatting
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
    throw error;
  }
}
