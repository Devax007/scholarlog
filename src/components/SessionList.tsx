import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Calendar, Clock, Trash2, SlidersHorizontal, BookOpen, AlertCircle, Download } from 'lucide-react';
import { StudySession, Subject } from '../types';
import { getSubjectColorClasses } from '../utils';
import { getRelativeDateString } from '../sampleData';

interface SessionListProps {
  sessions: StudySession[];
  subjects: Subject[];
  onDeleteSession: (id: string) => void;
  activeSubjectFilterId: string | null;
  onSelectSubjectFilterId: (id: string | null) => void;
}

type SortOption = 'date-desc' | 'date-asc' | 'duration-desc' | 'duration-asc';

export default function SessionList({
  sessions,
  subjects,
  onDeleteSession,
  activeSubjectFilterId,
  onSelectSubjectFilterId,
}: SessionListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Helper to get friendly relative date string
  const getFriendlyDate = (dateStr: string) => {
    const today = getRelativeDateString(0);
    const yesterday = getRelativeDateString(-1);

    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';

    // Format standard date
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch (e) {
      // fallback
    }
    return dateStr;
  };

  // Helper to format minutes to "Xh Ym"
  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
  };

  // Process filters and sorting
  const filteredAndSortedSessions = useMemo(() => {
    let result = [...sessions];

    // 1. Subject Filter
    if (activeSubjectFilterId) {
      result = result.filter((s) => s.subjectId === activeSubjectFilterId);
    }

    // 2. Text Search Query Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((s) => {
        const subjectName = subjects.find((sub) => sub.id === s.subjectId)?.name.toLowerCase() || '';
        const coveredNotes = s.note.toLowerCase();
        return coveredNotes.includes(query) || subjectName.includes(query);
      });
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return b.date.localeCompare(a.date);
      }
      if (sortBy === 'date-asc') {
        return a.date.localeCompare(b.date);
      }
      if (sortBy === 'duration-desc') {
        return b.duration - a.duration;
      }
      if (sortBy === 'duration-asc') {
        return a.duration - b.duration;
      }
      return 0;
    });

    return result;
  }, [sessions, activeSubjectFilterId, searchQuery, sortBy, subjects]);

  const handleExportCSV = () => {
    if (sessions.length === 0) return;

    // Helper to escape cells in CSV
    const escapeCSV = (value: string) => {
      if (value === null || value === undefined) return '';
      const stringified = String(value);
      if (stringified.includes('"') || stringified.includes(',') || stringified.includes('\n') || stringified.includes('\r')) {
        return `"${stringified.replace(/"/g, '""')}"`;
      }
      return stringified;
    };

    // CSV Headers
    const headers = ['Date', 'Subject', 'Duration (Minutes)', 'Duration (Hours)', 'Note'];
    
    // Sort all sessions by date descending for the CSV export
    const sortedSessionsForExport = [...sessions].sort((a, b) => b.date.localeCompare(a.date));

    const rows = sortedSessionsForExport.map(session => {
      const subject = subjects.find(s => s.id === session.subjectId);
      const subjectName = subject ? subject.name : 'Unknown';
      const durationHours = (session.duration / 60).toFixed(2);
      
      return [
        escapeCSV(session.date),
        escapeCSV(subjectName),
        escapeCSV(session.duration.toString()),
        escapeCSV(durationHours),
        escapeCSV(session.note)
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `study_sessions_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 md:p-8 border-2 border-slate-200 shadow-xs" id="session-list-container">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-extrabold font-display text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500 animate-pulse" />
            Recent Study Sessions
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Showing {filteredAndSortedSessions.length} session{filteredAndSortedSessions.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto font-sans">
          {/* Quick Search */}
          <div className="relative flex-1 sm:flex-initial min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search subjects or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-full focus:outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-700 font-medium"
            />
          </div>

          {/* Export to CSV Button */}
          <button
            onClick={handleExportCSV}
            disabled={sessions.length === 0}
            className="p-2.5 px-4 rounded-full border-2 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-slate-500 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Export all logged study sessions to CSV"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          {/* Toggle Advanced Filters */}
          <button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={`p-2.5 px-4 rounded-full border-2 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
              showFiltersPanel || activeSubjectFilterId
                ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel (Collapsible) */}
      <AnimatePresence>
        {(showFiltersPanel || activeSubjectFilterId) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden font-sans text-xs"
          >
            <div className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filter by Subject */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-500 block">Filter by Subject:</span>
                <select
                  value={activeSubjectFilterId || ''}
                  onChange={(e) => onSelectSubjectFilterId(e.target.value || null)}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-slate-600 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort by option */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-500 block">Sort Sessions:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-slate-600 focus:outline-none focus:border-indigo-500"
                >
                  <option value="date-desc">Date: Latest to Oldest</option>
                  <option value="date-asc">Date: Oldest to Latest</option>
                  <option value="duration-desc">Duration: Longest to Shortest</option>
                  <option value="duration-asc">Duration: Shortest to Longest</option>
                </select>
              </div>

              {/* Reset filter helpers */}
              {(activeSubjectFilterId || searchQuery) && (
                <div className="md:col-span-2 pt-2 border-t border-slate-250 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      onSelectSubjectFilterId(null);
                      setSearchQuery('');
                      setSortBy('date-desc');
                    }}
                    className="text-indigo-600 hover:text-indigo-700 font-extrabold hover:underline cursor-pointer"
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sessions Feed */}
      {filteredAndSortedSessions.length === 0 ? (
        <div className="text-center py-12 bg-slate-50/40 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center font-sans">
          <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
          <h4 className="font-extrabold text-slate-500 text-sm">No study logs found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Try adjustments to your search query, clear filters, or log a brand new study session above!
          </p>
        </div>
      ) : (
        <div className="space-y-3 font-sans" id="sessions-feed-list">
          <AnimatePresence initial={false}>
            {filteredAndSortedSessions.map((session, index) => {
              const subject = subjects.find((sub) => sub.id === session.subjectId);
              const colorClasses = getSubjectColorClasses(subject?.color || 'sky');

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
                  className={`group relative rounded-[1.5rem] p-5 border-2 transition-all duration-300 bg-white hover:border-indigo-100 hover:shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                    activeSubjectFilterId === session.subjectId 
                      ? 'border-indigo-400 bg-indigo-50/10 shadow-xs ring-4 ring-indigo-50' 
                      : 'border-slate-100'
                  }`}
                >
                  {/* Left Column: Subject Badge & Note details */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${colorClasses.badge}`}>
                        {subject ? subject.name : 'Unknown Subject'}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {getFriendlyDate(session.date)}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatDuration(session.duration)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-sans leading-relaxed break-words pr-4 select-text font-medium">
                      {session.note}
                    </p>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="shrink-0 flex items-center justify-end w-full md:w-auto border-t md:border-t-0 pt-2.5 md:pt-0 border-slate-100">
                    <button
                      onClick={() => onDeleteSession(session.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-100 md:opacity-0 group-hover:opacity-100 cursor-pointer flex items-center gap-1 text-xs md:text-sm font-bold"
                      title="Delete log entry"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="md:hidden">Delete Entry</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
