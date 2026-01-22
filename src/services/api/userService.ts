/**
 * User Profile API Service
 * 
 * Handles user profile and preferences management for onboarding flow.
 */

import apiClient from './client';

// Types
export interface UserProfileData {
  fullName: string;
  phone: string;
  role: string;
  source: string;
  email?: string;
}

export interface UserPreferencesData {
  usageGoals: string[];
}

export interface UserProfileResponse {
  userID: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  role: string | null;
  source: string | null;
  usageGoals: string[];
  onboardingCompleted: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * Create or update user profile (onboarding step 3 - personal details)
 */
export async function saveUserProfile(data: UserProfileData): Promise<UserProfileResponse> {
  const response = await apiClient.post<UserProfileResponse>('/profile', data);
  return response.data;
}

/**
 * Save user preferences (onboarding step 4 - usage goals)
 */
export async function saveUserPreferences(data: UserPreferencesData): Promise<UserProfileResponse> {
  const response = await apiClient.post<UserProfileResponse>('/preferences', data);
  return response.data;
}
