// Authentication API for direct client access
const AUTH_API_URL = 'https://backendmix.vercel.app';

// Interfaces for request/response types
export interface AuthRequest {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  email?: string;
  name?: string;
  phone?: string;
  details?: string;
}

/**
 * Register a new user
 */
export async function registerUser(email: string, password: string, name: string, phone: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${AUTH_API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name, phone }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Format error response to match our expected type
      return {
        success: false,
        message: data.message || 'Registration failed',
        details: data.details,
      };
    }
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'Network or server error occurred during registration',
    };
  }
}

/**
 * Login a user
 */
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${AUTH_API_URL}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Format error response to match our expected type
      return {
        success: false,
        message: data.message || 'Login failed',
        details: data.details,
      };
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Network or server error occurred during login',
    };
  }
}

/**
 * Check if the authentication API is available
 */
export async function checkAuthApiStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${AUTH_API_URL}/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}

/**
 * Check database connection
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${AUTH_API_URL}/db-test`);
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}