'use server';

import path from 'path';
import { readJsonFile, writeJsonFile } from '@/lib/fs-utils'; // Use fs-utils for file operations
type ProgramName = string;

interface ProgramNamesData {
  programNames: ProgramName[];
}

const PROGRAM_NAMES_FILE = 'program-names.json';

// Helper function to get program names from JSON file
async function getStoredProgramNames(): Promise<ProgramName[]> {
  const data = await readJsonFile<ProgramNamesData>(PROGRAM_NAMES_FILE);
  return data?.programNames || [];
}

// Helper function to save program names to JSON file
async function saveProgramNames(programNames: ProgramName[]): Promise<void> {
  await writeJsonFile<ProgramNamesData>(PROGRAM_NAMES_FILE, { programNames });
}

export async function getProgramNamesServer(): Promise<ProgramName[]> {
  try {
    return await getStoredProgramNames();
  } catch (error) {
    console.error('Server Error getting all program names:', error);
    throw error;
  }
}

export async function addProgramNameServer(programName: ProgramName): Promise<void> {
  try {
    const programNames = await getStoredProgramNames();
    if (!programNames.includes(programName)) {
      programNames.push(programName);
      await saveProgramNames(programNames);
    }
  } catch (error) {
    console.error('Server Error adding program name:', error);
    throw error;
  }
}

export async function removeProgramNameServer(programName: ProgramName): Promise<void> {
  try {
    let programNames = await getStoredProgramNames();
    programNames = programNames.filter(name => name !== programName);
    await saveProgramNames(programNames);
  } catch (error) {
    console.error('Server Error removing program name:', error);
    throw error;
  }
}
