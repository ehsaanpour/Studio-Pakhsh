'use server';

import type { User } from '@/types'; // Assuming User type is defined in types/index.ts
import { readJsonFile, writeJsonFile } from './fs-utils';
import { comparePassword } from './utils'; // Import comparePassword from utils

const USERS_FILE = 'users.json';

// Helper function to get users from JSON file
async function getStoredUsers(): Promise<User[]> {
  const data = await readJsonFile<User[]>(USERS_FILE);
  console.log('getStoredUsers: Data read from users.json:', data);
  return data || [];
}

// Helper function to save users to JSON file
async function saveUsers(users: User[]): Promise<void> {
  await writeJsonFile<User[]>(USERS_FILE, users);
}

export async function getAdminByUsername(username: string): Promise<User | null> {
  try {
    console.log('getAdminByUsername: Searching for username:', username);
    const users = await getStoredUsers();
    const adminUser = users.find(u => u.username === username && u.isAdmin) || null;
    console.log('getAdminByUsername: Found admin user:', adminUser);
    return adminUser;
  } catch (error) {
    console.error('Error getting admin user:', error);
    return null;
  }
}

export async function verifyAdminPassword(username: string, password: string): Promise<boolean> {
  try {
    console.log('verifyAdminPassword: Attempting to verify password for username:', username);
    if (!username || !password) {
      console.log('verifyAdminPassword: Username or password not provided.');
      return false;
    }

    const adminUser = await getAdminByUsername(username);
    if (!adminUser || !adminUser.password) {
      console.log('verifyAdminPassword: Admin user not found or password missing.');
      return false;
    }
    
    console.log('verifyAdminPassword: Provided password:', password);
    console.log('verifyAdminPassword: Stored hashed password:', adminUser.password);
    const isMatch = await comparePassword(password, adminUser.password); // Use comparePassword from utils
    console.log('verifyAdminPassword: Password match result (comparePassword):', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Error verifying admin password:', error);
    return false;
  }
}
