// User types
export interface User {
  id: string;
  name: string;
  email: string;
}

// Auth response from backend
export interface AuthResponse {
  success: true;
  token: string;
  user: User;
}

// Birthday types
export interface Birthday {
  _id: string;
  userId: string;
  name: string;
  date: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// API response for list of birthdays
export interface BirthdaysListResponse {
  success: true;
  count: number;
  data: Birthday[];
}

// API response for single birthday
export interface SingleBirthdayResponse {
  success: true;
  data: Birthday;
}

// API response for delete
export interface DeleteBirthdayResponse {
  success: true;
  message: string;
}

// API error response
export interface ErrorResponse {
  success: false;
  error: string;
  details?: Array<{
    field?: string;
    message: string;
  }>;
}

// Form input types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export interface BirthdayFormData {
  name: string;
  date: string;
  email?: string;
  phone?: string;
  notes?: string;
}
