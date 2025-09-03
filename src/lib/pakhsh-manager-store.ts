'use server';

import bcrypt from 'bcryptjs';
import { User } from '@/types';
import { readJsonFile, writeJsonFile } from './fs-utils';

export interface PakhshManager {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  workplace?: string;
  profilePictureUrl?: string;
}

interface PakhshManagersData {
  pakhshManagers: PakhshManager[];
}

const PAKHSH_MANAGERS_FILE = 'pakhsh-managers.json';

// Helper function to get pakhsh managers from JSON file
async function getStoredPakhshManagers(): Promise<PakhshManager[]> {
  const data = await readJsonFile<PakhshManagersData>(PAKHSH_MANAGERS_FILE);
  return data?.pakhshManagers || [];
}

// Helper function to save pakhsh managers to JSON file
async function savePakhshManagers(managers: PakhshManager[]): Promise<void> {
  await writeJsonFile(PAKHSH_MANAGERS_FILE, { pakhshManagers: managers });
}

export async function getAllPakhshManagers(): Promise<PakhshManager[]> {
  try {
    return await getStoredPakhshManagers();
  } catch (error) {
    console.error('Error reading pakhsh managers:', error);
    return [];
  }
}

export async function getPakhshManagerByUsername(username: string): Promise<PakhshManager | null> {
  const managers = await getStoredPakhshManagers();
  console.log('Available pakhsh managers:', managers.map(m => m.username));
  console.log('Looking for username:', username);
  const found = managers.find(manager => manager.username === username) || null;
  console.log('Found manager:', found ? 'Yes' : 'No');
  return found;
}

export async function verifyPakhshManagerPassword(username: string, password: string): Promise<boolean> {
  console.log('Verifying pakhsh manager password for:', username);
  const manager = await getPakhshManagerByUsername(username);
  if (!manager) {
    console.log('Manager not found for username:', username);
    return false;
  }
  console.log('Manager found, comparing password...');
  console.log('Provided password:', password);
  console.log('Stored hash:', manager.password);
  const result = await bcrypt.compare(password, manager.password);
  console.log('Password comparison result:', result);
  return result;
}

export async function addPakhshManager(managerData: Omit<PakhshManager, 'id' | 'password'> & { password: string }): Promise<PakhshManager> {
  const managers = await getStoredPakhshManagers();
  
  // Check if username already exists
  const existingManager = managers.find(m => m.username === managerData.username);
  if (existingManager) {
    throw new Error(`مدیر پخش با نام کاربری "${managerData.username}" قبلاً وجود دارد.`);
  }

  const hashedPassword = await bcrypt.hash(managerData.password, 10);
  const newManager: PakhshManager = {
    ...managerData,
    id: Date.now().toString(),
    password: hashedPassword,
  };

  managers.push(newManager);
  await savePakhshManagers(managers);
  
  return newManager;
}

export async function updatePakhshManager(
  id: string, 
  updateData: Partial<Omit<PakhshManager, 'id'>> & { password?: string }
): Promise<PakhshManager | null> {
  const managers = await getStoredPakhshManagers();
  const managerIndex = managers.findIndex(manager => manager.id === id);
  
  if (managerIndex === -1) {
    throw new Error('مدیر پخش یافت نشد.');
  }

  const existingManager = managers[managerIndex];
  
  // Check if username is being changed and if it already exists
  if (updateData.username && updateData.username !== existingManager.username) {
    const usernameExists = managers.some(m => m.username === updateData.username && m.id !== id);
    if (usernameExists) {
      throw new Error(`نام کاربری "${updateData.username}" قبلاً استفاده شده است.`);
    }
  }

  const updatedManager: PakhshManager = {
    ...existingManager,
    ...updateData,
  };

  // Hash password if provided
  if (updateData.password) {
    updatedManager.password = await bcrypt.hash(updateData.password, 10);
  }

  managers[managerIndex] = updatedManager;
  await savePakhshManagers(managers);
  
  return updatedManager;
}

export async function deletePakhshManager(id: string): Promise<boolean> {
  const managers = await getStoredPakhshManagers();
  const filteredManagers = managers.filter(manager => manager.id !== id);
  
  if (filteredManagers.length === managers.length) {
    throw new Error('مدیر پخش یافت نشد.');
  }

  await savePakhshManagers(filteredManagers);
  return true;
}

export async function changePassword(username: string, oldPassword: string, newPassword: string): Promise<boolean> {
  const manager = await getPakhshManagerByUsername(username);
  if (!manager) {
    throw new Error('مدیر پخش یافت نشد.');
  }

  const isValidPassword = await bcrypt.compare(oldPassword, manager.password);
  if (!isValidPassword) {
    throw new Error('رمز عبور فعلی نادرست است.');
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  await updatePakhshManager(manager.id, { password: hashedNewPassword });
  
  return true;
}
