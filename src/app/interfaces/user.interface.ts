export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username?: string;
  avatar?: string;
  image?: string; // For API compatibility
}

export interface PaginatedResponse<T> {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  results: T[]; // API uses 'results' not 'data'
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar?: string;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}