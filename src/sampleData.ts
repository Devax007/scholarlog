import { Subject, StudySession } from './types';

// Helper to get relative dates in YYYY-MM-DD format
export const getRelativeDateString = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'subj-1',
    name: 'Advanced Calculus',
    targetHours: 6,
    color: 'sky',
  },
  {
    id: 'subj-2',
    name: 'Data Structures & Algorithms',
    targetHours: 8,
    color: 'emerald',
  },
  {
    id: 'subj-3',
    name: 'Intro to Psychology',
    targetHours: 4,
    color: 'indigo',
  },
  {
    id: 'subj-4',
    name: 'Quantum Physics',
    targetHours: 5,
    color: 'amber',
  },
  {
    id: 'subj-5',
    name: 'Academic Writing & Research',
    targetHours: 3,
    color: 'rose',
  },
];

export const INITIAL_SESSIONS: StudySession[] = [
  {
    id: 'sess-1',
    subjectId: 'subj-2',
    duration: 90, // 1.5 hours
    date: getRelativeDateString(0), // Today
    note: 'Implemented AVL tree balancing and analyzed path compression on Disjoint Set Union.',
  },
  {
    id: 'sess-2',
    subjectId: 'subj-1',
    duration: 60, // 1 hour
    date: getRelativeDateString(0), // Today
    note: 'Solved multiple double integrals using polar coordinates. Reviewed spherical transforms.',
  },
  {
    id: 'sess-3',
    subjectId: 'subj-4',
    duration: 120, // 2 hours
    date: getRelativeDateString(-1), // Yesterday
    note: 'Studied Schrodinger\'s time-independent equation and solved 1D infinite square well.',
  },
  {
    id: 'sess-4',
    subjectId: 'subj-3',
    duration: 45, // 0.75 hours
    date: getRelativeDateString(-1), // Yesterday
    note: 'Read chapter 4 on cognitive development. Synthesized Piaget\'s vs. Vygotsky\'s theories.',
  },
  {
    id: 'sess-5',
    subjectId: 'subj-2',
    duration: 120, // 2 hours
    date: getRelativeDateString(-2), // 2 days ago
    note: 'Practiced graph traversal algorithms. Coded BFS, DFS, and Dijkstra\'s with adjacency lists.',
  },
  {
    id: 'sess-6',
    subjectId: 'subj-1',
    duration: 90, // 1.5 hours
    date: getRelativeDateString(-3), // 3 days ago
    note: 'Reviewed infinite series convergence tests: ratio, root, integral, and alternating series.',
  },
  {
    id: 'sess-7',
    subjectId: 'subj-5',
    duration: 60, // 1 hour
    date: getRelativeDateString(-4), // 4 days ago
    note: 'Drafted the introduction and outlined core arguments for the literature review paper.',
  },
  {
    id: 'sess-8',
    subjectId: 'subj-4',
    duration: 90, // 1.5 hours
    date: getRelativeDateString(-5), // 5 days ago
    note: 'Completed lab report on the Photoelectric Effect. Plotted frequency vs stop voltage.',
  },
  {
    id: 'sess-9',
    subjectId: 'subj-2',
    duration: 75, // 1.25 hours
    date: getRelativeDateString(-6), // 6 days ago
    note: 'Solved dynamic programming practice problems. Focused on Knapsack and Longest Common Subsequence.',
  },
  {
    id: 'sess-10',
    subjectId: 'subj-3',
    duration: 60, // 1 hour
    date: getRelativeDateString(-7), // 7 days ago
    note: 'Summarized lecture notes on classical vs. operant conditioning. Highlighted extinction.',
  },
];
