import { Engineer } from '@/types';
import { readJsonFile, writeJsonFile } from './fs-utils';

const ENGINEERS_FILE = 'engineers.json';

interface EngineersData {
  engineers: Engineer[];
}

async function readData(): Promise<Engineer[]> {
  try {
    const data = await readJsonFile<EngineersData>(ENGINEERS_FILE);
    return data?.engineers || [];
  } catch (error) {
    console.error('Error reading engineers file:', error);
    return [];
  }
}

async function writeData(engineers: Engineer[]): Promise<void> {
  await writeJsonFile<EngineersData>(ENGINEERS_FILE, { engineers });
}

export async function addEngineer(engineer: Omit<Engineer, 'id'>): Promise<Engineer> {
  const engineers = await readData();
  const newEngineer: Engineer = {
    id: Date.now().toString(),
    ...engineer,
  };
  engineers.push(newEngineer);
  await writeData(engineers);
  return newEngineer;
}

export async function removeEngineer(id: string): Promise<void> {
  let engineers = await readData();
  engineers = engineers.filter((engineer) => engineer.id !== id);
  await writeData(engineers);
}

export async function listEngineers(): Promise<Engineer[]> {
  return readData();
}
