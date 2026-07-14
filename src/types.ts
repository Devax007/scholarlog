export interface Subject {
  id: string;
  name: string;
  targetHours: number; // target study hours per week
  color: string;       // Tailwind theme color (e.g., 'emerald', 'sky', 'indigo', 'amber', 'rose')
}

export interface StudySession {
  id: string;
  subjectId: string;
  duration: number;    // duration in minutes
  date: string;        // YYYY-MM-DD
  note: string;        // brief note on what was covered
}

export interface DashboardStats {
  totalHoursThisWeek: number;
  streakDays: number;
  subjectProgress: {
    subjectId: string;
    subjectName: string;
    targetHours: number;
    completedHours: number;
    color: string;
    percentage: number;
  }[];
}
