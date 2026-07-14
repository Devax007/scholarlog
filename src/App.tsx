import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, RefreshCw, GraduationCap, CheckCircle } from 'lucide-react';
import { Subject, StudySession } from './types';
import { INITIAL_SUBJECTS, INITIAL_SESSIONS } from './sampleData';
import { getDashboardStats } from './utils';

// Import components
import Dashboard from './components/Dashboard';
import SessionForm from './components/SessionForm';
import SubjectForm from './components/SubjectForm';
import SessionList from './components/SessionList';

export default function App() {
  // 1. Initialize State from LocalStorage or Fallback to Sample Data
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('study_tracker_subjects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_SUBJECTS;
  });

  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem('study_tracker_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_SESSIONS;
  });

  // 2. Active Subject Filter (linked interactive dashboard click)
  const [activeSubjectFilterId, setActiveSubjectFilterId] = useState<string | null>(null);

  // 3. Save State Changes to LocalStorage
  useEffect(() => {
    localStorage.setItem('study_tracker_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('study_tracker_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // 4. State Handlers
  const handleAddSubject = (newSub: Omit<Subject, 'id'>) => {
    const createdSub: Subject = {
      ...newSub,
      id: `subj-${Date.now()}`,
    };
    setSubjects((prev) => [...prev, createdSub]);
  };

  const handleDeleteSubject = (id: string) => {
    // Cascade delete sessions associated with this subject
    if (window.confirm('Are you sure you want to delete this subject? This will permanently erase all associated logged study sessions.')) {
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      setSessions((prev) => prev.filter((s) => s.subjectId !== id));
      if (activeSubjectFilterId === id) {
        setActiveSubjectFilterId(null);
      }
    }
  };

  const handleLogSession = (newSess: Omit<StudySession, 'id'>) => {
    const createdSess: StudySession = {
      ...newSess,
      id: `sess-${Date.now()}`,
    };
    // Prepend to list so recent logs show first
    setSessions((prev) => [createdSess, ...prev]);
  };

  const handleDeleteSession = (id: string) => {
    if (window.confirm('Are you sure you want to remove this logged study session?')) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleResetToSampleData = () => {
    if (window.confirm('Reset app data back to the original 5 sample subjects and 10 sessions? This overrides custom entries.')) {
      setSubjects(INITIAL_SUBJECTS);
      setSessions(INITIAL_SESSIONS);
      setActiveSubjectFilterId(null);
    }
  };

  // 5. Compute Live Stats
  const dashboardStats = getDashboardStats(subjects, sessions);

  // 6. Current Date Header String
  const getHeaderDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-indigo-100 selection:text-indigo-900 pb-12">
      {/* Visual top border bar */}
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 w-full" />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-1 space-y-8">
        
        {/* Portal Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-white rounded-[2rem] p-6 md:p-8 border-2 border-slate-200 shadow-xs animate-fade-in" id="app-header">
          <div className="flex flex-col">
            <span className="text-indigo-600 font-bold tracking-tight text-xs uppercase mb-1">Student Portal</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 font-display flex items-center gap-2">
              ScholarLog<span className="text-indigo-500">.</span>
            </h1>
            <p className="text-xs text-slate-500 font-sans mt-1.5 flex items-center gap-1.5 font-medium">
              {getHeaderDate()}
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              University Student Planner
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-sans mt-2 sm:mt-0">
            {/* Dynamic target tracking progress pill */}
            <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-800 border border-indigo-100 px-3 py-1.5 rounded-full text-xs font-bold">
              <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Goal Cycle Active</span>
            </div>

            {/* Reset to Sample Data */}
            <button
              onClick={handleResetToSampleData}
              className="text-xs text-slate-600 hover:text-indigo-600 hover:bg-slate-50 border-2 border-slate-200 bg-white px-3.5 py-2 rounded-full font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              title="Reset state to realistic mock data"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              Restore Demo Data
            </button>
          </div>
        </header>

        {/* TOP COMPONENT: The Interactive Dashboard & Progress Grid */}
        <Dashboard
          stats={dashboardStats}
          subjects={subjects}
          sessions={sessions}
          activeFilterId={activeSubjectFilterId}
          onSelectFilterId={setActiveSubjectFilterId}
        />

        {/* BOTTOM COMPONENT: Double Column Grid (Input Forms on Left, Logging Feed on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="app-workspace-grid">
          {/* Left Columns (1/3rd of screen): Form inputs */}
          <div className="lg:col-span-1 space-y-6 flex flex-col">
            {/* Log study session Form */}
            <SessionForm 
              subjects={subjects} 
              onLogSession={handleLogSession} 
            />

            {/* Manage subjects list & targets */}
            <SubjectForm
              subjects={subjects}
              sessions={sessions}
              onAddSubject={handleAddSubject}
              onDeleteSubject={handleDeleteSubject}
            />
          </div>

          {/* Right Column (2/3rds of screen): Scrollable history log */}
          <div className="lg:col-span-2">
            <SessionList
              sessions={sessions}
              subjects={subjects}
              onDeleteSession={handleDeleteSession}
              activeSubjectFilterId={activeSubjectFilterId}
              onSelectSubjectFilterId={setActiveSubjectFilterId}
            />
          </div>
        </div>

      </main>

      {/* Footer copyright */}
      <footer className="text-center text-[11px] text-slate-400 mt-12 font-mono">
        © 2026 Personal Study Tracker Portal • Designed with calm and balance.
      </footer>
    </div>
  );
}
