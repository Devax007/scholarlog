import { StudySession, Subject, DashboardStats } from './types';
import { getRelativeDateString } from './sampleData';

/**
 * Gets the start of the current calendar week (Monday) at 00:00:00
 */
export const getStartOfWeek = (): Date => {
  const today = new Date();
  const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday to get last Monday
  const start = new Date(today.setDate(diff));
  start.setHours(0, 0, 0, 0);
  return start;
};

/**
 * Checks if a date string (YYYY-MM-DD) is in the current calendar week (Mon - Sun)
 */
export const isDateInCurrentWeek = (dateStr: string): boolean => {
  const startOfWeek = getStartOfWeek();
  const sessionDate = new Date(dateStr + 'T00:00:00'); // Ensure local time parsing
  
  // End of current week is Sunday night at 23:59:59
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
};

/**
 * Calculates current study streak in days
 */
export const calculateStreak = (sessions: StudySession[]): number => {
  if (sessions.length === 0) return 0;

  const loggedDates = new Set(sessions.map((s) => s.date));
  let streak = 0;
  let checkOffset = 0;

  const studiedToday = loggedDates.has(getRelativeDateString(0));
  const studiedYesterday = loggedDates.has(getRelativeDateString(-1));

  // If no study today and no study yesterday, streak has died
  if (!studiedToday && !studiedYesterday) {
    return 0;
  }

  // If studied yesterday but not yet today, start counting from yesterday
  if (!studiedToday && studiedYesterday) {
    checkOffset = -1;
  }

  while (true) {
    const dateStr = getRelativeDateString(checkOffset);
    if (loggedDates.has(dateStr)) {
      streak++;
      checkOffset--;
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Compiles dashboard statistics based on subjects and sessions
 */
export const getDashboardStats = (
  subjects: Subject[],
  sessions: StudySession[]
): DashboardStats => {
  // 1. Calculate total hours this week
  const currentWeekSessions = sessions.filter((s) => isDateInCurrentWeek(s.date));
  const totalMinutesThisWeek = currentWeekSessions.reduce((acc, s) => acc + s.duration, 0);
  const totalHoursThisWeek = Number((totalMinutesThisWeek / 60).toFixed(1));

  // 2. Calculate streak
  const streakDays = calculateStreak(sessions);

  // 3. Calculate subject-wise progress for current week
  const subjectProgress = subjects.map((subj) => {
    const subjSessions = currentWeekSessions.filter((s) => s.subjectId === subj.id);
    const completedMinutes = subjSessions.reduce((acc, s) => acc + s.duration, 0);
    const completedHours = Number((completedMinutes / 60).toFixed(1));
    const percentage = subj.targetHours > 0 
      ? Math.round((completedHours / subj.targetHours) * 100) 
      : 0;

    return {
      subjectId: subj.id,
      subjectName: subj.name,
      targetHours: subj.targetHours,
      completedHours,
      color: subj.color,
      percentage,
    };
  });

  return {
    totalHoursThisWeek,
    streakDays,
    subjectProgress,
  };
};

/**
 * Color class mapping for subjects
 */
export interface SubjectColorClasses {
  bg: string;
  text: string;
  border: string;
  progress: string;
  accent: string;
  badge: string;
  hover: string;
  ring: string;
  textDark: string;
}

export const getSubjectColorClasses = (color: string): SubjectColorClasses => {
  switch (color) {
    case 'emerald':
      return {
        bg: 'bg-emerald-50/70',
        text: 'text-emerald-700',
        border: 'border-emerald-100',
        progress: 'bg-emerald-500',
        accent: 'emerald',
        badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
        hover: 'hover:bg-emerald-100/50',
        ring: 'focus:ring-emerald-500',
        textDark: 'text-emerald-900',
      };
    case 'indigo':
      return {
        bg: 'bg-indigo-50/70',
        text: 'text-indigo-700',
        border: 'border-indigo-100',
        progress: 'bg-indigo-500',
        accent: 'indigo',
        badge: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
        hover: 'hover:bg-indigo-100/50',
        ring: 'focus:ring-indigo-500',
        textDark: 'text-indigo-900',
      };
    case 'amber':
      return {
        bg: 'bg-amber-50/70',
        text: 'text-amber-700',
        border: 'border-amber-100',
        progress: 'bg-amber-500',
        accent: 'amber',
        badge: 'bg-amber-100 text-amber-800 border border-amber-200',
        hover: 'hover:bg-amber-100/50',
        ring: 'focus:ring-amber-500',
        textDark: 'text-amber-900',
      };
    case 'rose':
      return {
        bg: 'bg-rose-50/70',
        text: 'text-rose-700',
        border: 'border-rose-100',
        progress: 'bg-rose-500',
        accent: 'rose',
        badge: 'bg-rose-100 text-rose-800 border border-rose-200',
        hover: 'hover:bg-rose-100/50',
        ring: 'focus:ring-rose-500',
        textDark: 'text-rose-900',
      };
    case 'sky':
    default:
      return {
        bg: 'bg-sky-50/70',
        text: 'text-sky-700',
        border: 'border-sky-100',
        progress: 'bg-sky-500',
        accent: 'sky',
        badge: 'bg-sky-100 text-sky-800 border border-sky-200',
        hover: 'hover:bg-sky-100/50',
        ring: 'focus:ring-sky-500',
        textDark: 'text-sky-900',
      };
  }
};

/**
 * Predefined set of colors that the student can assign to a subject
 */
export const PRESET_COLORS = [
  { name: 'Sky Blue', value: 'sky', class: 'bg-sky-500' },
  { name: 'Emerald Green', value: 'emerald', class: 'bg-emerald-500' },
  { name: 'Indigo Purple', value: 'indigo', class: 'bg-indigo-500' },
  { name: 'Amber Yellow', value: 'amber', class: 'bg-amber-500' },
  { name: 'Rose Pink', value: 'rose', class: 'bg-rose-500' },
];
