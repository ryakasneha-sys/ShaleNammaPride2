export type Role = 'admin' | 'headmaster' | 'parent';

export interface UserProfile {
  uid: string;
  role: Role;
  email: string;
  createdAt: any;
}

export interface DailyMeal {
  id: string; // YYYY-MM-DD
  date: string;
  imageUrl: string;
  description: string;
  createdAt: any;
}

export interface Facility {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  order: number;
}

export interface StudentStar {
  id: string;
  name: string;
  achievement: string;
  imageUrl: string;
  date: string;
  createdAt: any;
}

export interface FeedbackEntry {
  id: string;
  message: string;
  isAnonymous: boolean;
  userId?: string;
  createdAt: any;
}

export type Language = 'en' | 'kn';

export interface UIStrings {
  appName: string;
  dailyMeal: string;
  facilityTour: string;
  studentStars: string;
  feedback: string;
  uploadMeal: string;
  addStar: string;
  addFacility: string;
  submitFeedback: string;
  anonymousToggle: string;
  mealPosted: string;
  onlyOneMealDay: string;
  studentAchievement: string;
  facilityDescription: string;
  switchLanguage: string;
  login: string;
  logout: string;
  placeholderMessage: string;
  noPostsYet: string;
}
