/**
 * User utility functions
 */

/**
 * Get user initials from full name
 * @param name - Full name of the user
 * @returns Uppercase initials
 */
export const getUserInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};