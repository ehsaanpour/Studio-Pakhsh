// FormEase specific types (can be removed or commented out)
/*
export interface FormFieldSuggestion {
  id: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox' | 'radio';
  options?: string[]; // For select, radio
}

export interface FormFieldDefinition extends FormFieldSuggestion {
  placeholder?: string;
  required: boolean;
  validationRules?: string[];
}

export interface AppForm {
  id: string;
  name: string;
  description?: string;
  fields: FormFieldDefinition[];
  createdAt: string;
  updatedAt: string;
}
*/

// Studio Reservation System Types
export interface PersonalInformation {
  nameOrOrganization: string;
  phoneNumber: string;
  emailAddress: string;
}

export interface ReservationDateTime {
  reservationDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
}

export type StudioSelection = 'studio2' | 'studio5' | 'studio6'; // استودیو ۲ (فرانسه), استودیو ۵ (-۳), استودیو ۶ (مایا ناصر)

export interface StudioServicesInfo {
  serviceType: 'with_crew' | 'without_crew'; // استودیو با عوامل, استودیو بدون عوامل و تجهیزات
  numberOfDays: number;
  hoursPerDay: number;
}

export type AdditionalService =

  | 'videowall'

  | 'xdcam'

  | 'crane'

  | 'makeup_artist'

  | 'service_staff'

  | 'live_communication' // ارتباط اینترنتی / ارتباط زنده

  | 'stream' // استریم

  | 'live_program';

export type CateringService =
  | 'drinks'
  | 'breakfast'
  | 'snack'
  | 'lunch'
  | 'dinner';

export interface Repetition {
  type: 'no_repetition' | 'weekly_1month' | 'weekly_3months' | 'daily_until_date';
  endDate?: Date;
}

export interface StudioReservationRequest {
  id: string; // Auto-generated or from backend
  type: 'guest' | 'producer';
  requesterName?: string; // For producer, derived from their login
  programName: string; // New field for program name
  
  personalInfo?: PersonalInformation; // Required for guest, optional/excluded for producer
  
  dateTime: ReservationDateTime;
  studio: StudioSelection;
  studioServices: StudioServicesInfo;
  additionalServices?: AdditionalService[];
  cateringServices?: CateringService[]; // Excluded for producer
  details?: string;
  repetition?: Repetition;
  
  status: 'new' | 'read' | 'confirmed' | 'cancelled' | 'finalized';
  submittedAt: Date;
  updatedAt?: Date;
  engineers?: string[];
  engineerCount?: number;
}

export interface User {
  name: string;
  username: string;
  email: string;
  phone: string;
  workplace?: string;
  isAdmin?: boolean;
  profilePictureUrl?: string;
  password?: string; // Password is optional for the User interface, as it might not always be loaded
}

export interface Producer {
  id: string;
  username: string;
  password: string; // Password is required for Producer as it's stored
  name: string;
  email: string;
  phone: string;
  workplace?: string;
}

export interface Engineer {
  id: string;
  name: string;
}
