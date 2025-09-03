// No longer directly used here

// This constant is now mostly for conceptual pathing, not direct file access
import { getDataFilePath } from './data-path';

const PROGRAM_NAMES_FILE = getDataFilePath('program-names.json');

// type Listener = () => void; // No longer needed for client-side reactivity
// const listeners: Listener[] = []; // No longer needed for client-side reactivity

// function notifyListeners() { // No longer needed for client-side reactivity
//   listeners.forEach(listener => listener());
// }

// export function subscribe(listener: Listener) { // No longer needed for client-side reactivity
//   listeners.push(listener);
//   return () => {
//     const index = listeners.indexOf(listener);
//     if (index > -1) {
//       listeners.splice(index, 1);
//     }
//   };
// }

export type ProgramName = string;

export async function getProgramNames(): Promise<ProgramName[]> {
  try {
    const response = await fetch('/api/program-names');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching program names from API:', error);
    return [];
  }
}

export async function addProgramName(programName: ProgramName): Promise<void> {
  try {
    const response = await fetch('/api/program-names', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ programName }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // No need to notify listeners here, the client-side useEffect will re-fetch
  } catch (error) {
    console.error('Error adding program name via API:', error);
    throw error; // Re-throw to be caught by the component
  }
}

export async function removeProgramName(programName: ProgramName): Promise<void> {
  try {
    const response = await fetch('/api/program-names', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ programName }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // No need to notify listeners here, the client-side useEffect will re-fetch
  } catch (error) {
    console.error('Error removing program name via API:', error);
    throw error; // Re-throw to be caught by the component
  }
}
