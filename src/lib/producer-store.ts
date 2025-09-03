'use server';

import type { Producer } from '@/types';
import { readJsonFile, writeJsonFile } from './fs-utils';
import { hashPassword, comparePassword } from './utils'; // Import hashing utilities

interface ProducersData {
  producers: Producer[];
}

const PRODUCERS_FILE = 'producers.json';

// Helper function to get producers from JSON file
async function getStoredProducers(): Promise<Producer[]> {
  const data = await readJsonFile<ProducersData>(PRODUCERS_FILE);
  return data?.producers || [];
}

// Helper function to save producers to JSON file
async function saveProducers(producers: Producer[]): Promise<void> {
  await writeJsonFile<ProducersData>(PRODUCERS_FILE, { producers });
}

export async function addProducer(producer: Omit<Producer, 'id'>): Promise<string> {
  try {
    // Validate required fields
    if (!producer.username || !producer.password || !producer.name || !producer.phone) {
      throw new Error('Username, password, name, and phone are required');
    }

    const producers = await getStoredProducers();
    
    // Check if username already exists
    if (producers.some(p => p.username === producer.username)) {
      throw new Error('Username already exists');
    }

    // Ensure password is a string
    const password = String(producer.password);
    
    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    const newProducer: Producer = {
      id: Date.now().toString(),
      ...producer,
      password: hashedPassword
    };
    
    producers.push(newProducer);
    await saveProducers(producers);
    return newProducer.id;
  } catch (error) {
    console.error('Error adding producer:', error);
    throw error;
  }
}

export async function getProducerByUsername(username: string): Promise<Producer | null> {
  try {
    const producers = await getStoredProducers();
    return producers.find(p => p.username === username) || null;
  } catch (error) {
    console.error('Error getting producer:', error);
    throw error;
  }
}

export async function verifyProducerPassword(username: string, password: string): Promise<boolean> {
  try {
    if (!username || !password) {
      return false;
    }

    const producer = await getProducerByUsername(username);
    if (!producer || !producer.password) {
      return false;
    }
    
    return await comparePassword(password, producer.password);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

export async function getAllProducers(): Promise<Producer[]> {
  try {
    return await getStoredProducers();
  } catch (error) {
    console.error('Error getting all producers:', error);
    throw error;
  }
}

export async function deleteProducer(producerId: string): Promise<void> {
  try {
    const producers = await getStoredProducers();
    const updatedProducers = producers.filter(p => p.id !== producerId);
    await saveProducers(updatedProducers);
  } catch (error) {
    console.error('Error deleting producer:', error);
    throw error;
  }
}

export async function updateProducer(id: string, updates: Partial<Omit<Producer, 'id'>>): Promise<void> {
  try {
    const producers = await getStoredProducers();
    const index = producers.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Producer not found');
    }

    const updatedProducer = { ...producers[index] };
    
    // Update fields if provided
    if (updates.name) updatedProducer.name = updates.name;
    if (updates.username) updatedProducer.username = updates.username;
    if (updates.email) updatedProducer.email = updates.email;
    if (updates.phone) updatedProducer.phone = updates.phone;
    if (updates.workplace) updatedProducer.workplace = updates.workplace;
    
    // Only hash and update password if a new one is provided
    if (updates.password) {
      updatedProducer.password = await hashPassword(String(updates.password));
    }

    producers[index] = updatedProducer;
    await saveProducers(producers);
  } catch (error) {
    console.error('Error updating producer:', error);
    throw error;
  }
}

