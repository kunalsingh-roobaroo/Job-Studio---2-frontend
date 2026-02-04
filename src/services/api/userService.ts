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

/**
 * Get user profile to check onboarding status
 */
export async function getUserProfile(): Promise<UserProfileResponse | null> {
  try {
    const response = await apiClient.get<UserProfileResponse>('/profile');
    return response.data;
  } catch (error: any) {
    // 404 means user profile doesn't exist yet (new user)
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Check if user has completed onboarding
 */
export async function checkOnboardingStatus(): Promise<{ completed: boolean; profile: UserProfileResponse | null }> {
  const profile = await getUserProfile();
  return {
    completed: profile?.onboardingCompleted ?? false,
    profile
  };
}