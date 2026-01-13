/**
 * Centralized error handling utility
 * Provides consistent error messages and handling across the application
 */

import { toast } from "sonner";

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
}

/**
 * Formats error messages for user display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === "string") {
    return error;
  }
  
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  
  return "An unexpected error occurred";
}

/**
 * Gets a user-friendly error message based on error type
 */
export function getUserFriendlyMessage(error: unknown): string {
  const message = formatErrorMessage(error);
  
  // Map common error messages to user-friendly ones
  const errorMappings: Record<string, string> = {
    "Invalid login credentials": "Invalid email or password. Please try again.",
    "already registered": "An account with this email already exists. Try logging in instead.",
    "Network request failed": "Network error. Please check your connection and try again.",
    "Failed to fetch": "Unable to connect to the server. Please try again later.",
  };
  
  // Check for partial matches
  for (const [key, value] of Object.entries(errorMappings)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return message;
}

/**
 * Shows an error toast notification
 */
export function showErrorToast(error: unknown, title: string = "Error") {
  const message = getUserFriendlyMessage(error);
  toast.error(title, {
    description: message,
  });
}

/**
 * Shows a success toast notification
 */
export function showSuccessToast(message: string, title: string = "Success") {
  toast.success(title, {
    description: message,
  });
}

/**
 * Handles Supabase query errors
 */
export function handleSupabaseError(error: unknown): never {
  const message = formatErrorMessage(error);
  console.error("Supabase error:", error);
  throw new Error(message);
}
