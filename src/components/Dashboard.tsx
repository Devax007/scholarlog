import { motion } from 'motion/react';
import { Clock, Flame, BookOpen, Award, CheckCircle2, Calendar, ChevronRight, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DashboardStats, Subject, StudySession } from '../types';
import { getSubjectColorClasses, isDateInCurrentWeek } from '../utils';

interface DashboardProps {
  stats: DashboardStats;
  subjects: Subject[];
  sessions: StudySession[];
  activeFilterId: string | null;
  onSelectFilterId: (id: string | null) => void;
}

export default function Dashboard({ 
  stats, 
  subjects, 
  sessions, 
  activeFilterId, 
  onSelectFilterId 
}: DashboardProps) {
  
  // Generate the last 7 calendar days to show study history
  const getLast7Days = () => {
    const days = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      const daySessions = sessions.filter(s => s.date === dateString);
      const totalMinutes = daySessions.reduce((acc, s) => acc + s.duration, 0);
      
      days.push({
        name: weekdays[date.getDay()],
        dateStr: dateString,
        isToday: i === 0,
        studied: totalMinutes > 0,
        totalHours: Number((totalMinutes / 60).toFixed(1)),
        sessionsCount: daySessions.length,
        mainSubjectColor: daySessions.length > 0 
          ? subjects.find(sub => sub.id === daySessions[0].subjectId)?.color || 'sky'
          : null
      });
    }
    return days;
  };

  const activityDays = getLast7Days();

  // Find most studied subject
  const getMostStudiedSubject = () => {
    if (sessions.length === 0) return 'None yet';
    const durationBySubject: Record<string, number> = {};
    sessions.forEach(s => {
      durationBySubject[s.subjectId] = (durationBySubject[s.subjectId] || 0) + s.duration;
    });
    
    let maxSubjId = '';
    let maxDuration = -1;
    Object.entries(durationBySubject).forEach(([id, duration]) => {
      if (duration > maxDuration) {
        maxDuration = duration;
        maxSubjId = id;
      }
    });

    const subject = subjects.find(s => s.id === maxSubjId);
    return subject ? `${subject.name} (${Math.round(maxDuration / 60)} hrs)` : 'None';
  };

  // Find top subject for the current calendar week (this week)
  const getTopSubjectThisWeek = () => {
    const currentWeekSessions = sessions.filter(s => isDateInCurrentWeek(s.date));
    
    if (currentWeekSessions.length === 0) {
      return { name: 'None yet', hours: 0, percentage: 0 };
    }
    
    const durationBySubject: Record<string, number> = {};
    currentWeekSessions.forEach(s => {
      durationBySubject[s.subjectId] = (durationBySubject[s.subjectId] || 0) + s.duration;
    });
    
    let maxSubjId = '';
    let maxDuration = -1;
    Object.entries(durationBySubject).forEach(([id, duration]) => {
      if (duration > maxDuration) {
        maxDuration = duration;
        maxSubjId = id;
      }
    });
    
    const subject = subjects.find(s => s.id === maxSubjId);
    if (!subject) return { name: 'Unknown', hours: 0, percentage: 0 };
    
    const totalMinutesThisWeek = currentWeekSessions.reduce((acc, s) => acc + s.duration, 0);
    const percentage = totalMinutesThisWeek > 0 ? Math.round((maxDuration / totalMinutesThisWeek) * 100) : 0;
    
    return {
      name: subject.name,
      hours: Number((maxDuration / 60).toFixed(1)),
      percentage
    };
  };

  const topSubjectThisWeek = getTopSubjectThisWeek();

  const getHexColor = (color: string) => {
    switch (color) {
      case 'emerald': return '#10b981';
      case 'indigo': return '#6366f1';
      case 'amber': return '#f59e0b';
      case 'rose': return '#f43f5e';
      case 'sky':
      default:
        return '#0ea5e9';
    }
  };

  const chartData = stats.subjectProgress.map((prog) => ({
    name: prog.subjectName,
    hours: prog.completedHours,
    color: prog.color,
    target: prog.targetHours,
  }));

  return (
    <div className="space-y-8 animate-fade-in" id="dashboard-wrapper">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="dashboard-kpis">
        {/* Total Weekly Hours Card */}
        <motion.div 
          id="card-weekly-hours"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-indigo-600 rounded-[2rem] p-6 text-white flex flex-col justify-between shadow-lg shadow-indigo-100/50 hover:scale-[1.01] transition-all duration-300"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider font-sans">This Week's Effort</span>
              <h3 className="text-xl font-extrabold font-display text-white mt-1">Study Hours</h3>
            </div>
            <div className="p-3 bg-indigo-500 text-indigo-100 rounded-2xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-baseline space-x-2 my-2">
            <span className="text-5xl font-black font-display text-white tracking-tight">{stats.totalHoursThisWeek}</span>
            <span className="text-sm font-medium text-indigo-200">/ 25h recommended</span>
          </div>

          <div className="mt-4 pt-4 border-t border-indigo-500 flex items-center justify-between text-xs text-indigo-200">
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-indigo-300" />
              Calendar Week (Mon - Sun)
            </span>
            <span className="font-bold text-white bg-indigo-500 px-2.5 py-0.5 rounded-full">
              Active Cycle
            </span>
          </div>
        </motion.div>

        {/* Streak Card with Interactive History */}
        <motion.div 
          id="card-streak"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="bg-white rounded-[2rem] p-6 border-2 border-slate-200 flex flex-col justify-between shadow-xs hover:shadow-md hover:scale-[1.01] transition-all duration-300"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Consistency Metric</span>
              <h3 className="text-xl font-extrabold font-display text-slate-800 mt-1">Daily Streak</h3>
            </div>
            <div className={`p-3 rounded-2xl transition-colors duration-300 ${stats.streakDays > 0 ? 'bg-orange-50 text-orange-500 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
              <Flame className="w-5 h-5 fill-current" />
            </div>
          </div>

          <div className="flex items-baseline space-x-2 my-1">
            <span className={`text-5xl font-black font-display tracking-tight ${stats.streakDays > 0 ? 'text-slate-800' : 'text-slate-400'}`}>
              {stats.streakDays}
            </span>
            <span className="text-sm font-semibold text-slate-400">{stats.streakDays === 1 ? 'day study streak' : 'days study streak'}</span>
          </div>

          {/* 7-Day Activity Heat Bar */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center gap-1.5">
              {activityDays.map((day) => {
                const colorClasses = day.mainSubjectColor ? getSubjectColorClasses(day.mainSubjectColor) : null;
                return (
                  <div key={day.dateStr} className="flex flex-col items-center flex-1">
                    <span className={`text-[9px] font-bold mb-1 ${day.isToday ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {day.name}
                    </span>
                    <div 
                      title={`${day.dateStr}: ${day.totalHours} hours studied`}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                        day.studied 
                          ? `${colorClasses?.bg || 'bg-indigo-100'} ${colorClasses?.text || 'text-indigo-700'} ring-2 ring-white shadow-xs` 
                          : 'bg-slate-100 text-slate-300 hover:bg-slate-200/50'
                      } ${day.isToday ? 'border-2 border-indigo-500' : ''}`}
                    >
                      {day.studied ? (
                        <span>{day.totalHours > 0 ? Math.round(day.totalHours) || '✔' : '✔'}</span>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Weekly Summary / Focus Card */}
        <motion.div 
          id="card-weekly-focus"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="bg-white rounded-[2rem] p-6 border-2 border-slate-200 flex flex-col justify-between shadow-xs hover:shadow-md hover:scale-[1.01] transition-all duration-300"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Weekly Summary</span>
              <h3 className="text-xl font-extrabold font-display text-slate-800 mt-1">Weekly Focus</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {topSubjectThisWeek.hours > 0 ? (
            <div className="my-1 space-y-1.5">
              <div className="text-xs font-semibold text-slate-400">
                Top Subject:
              </div>
              <div className="text-xl font-black font-display text-slate-800 truncate" title={topSubjectThisWeek.name}>
                {topSubjectThisWeek.name}
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-black font-display text-indigo-600 tracking-tight">
                  {topSubjectThisWeek.hours}h
                </span>
                <span className="text-xs font-semibold text-slate-400">logged this week</span>
              </div>
              <p className="text-xs text-slate-500 font-sans leading-relaxed">
                Represents <strong className="text-indigo-600 font-extrabold">{topSubjectThisWeek.percentage}%</strong> of your weekly effort.
              </p>
            </div>
          ) : (
            <div className="my-1 py-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Top Subject</p>
              <p className="text-sm font-extrabold text-slate-500 mt-1">No sessions logged</p>
              <p className="text-xs text-slate-400 mt-1.5 font-sans leading-relaxed">
                Add a study session of the week to reveal your top focus!
              </p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 italic">
            <span>"Consistency builds confidence."</span>
          </div>
        </motion.div>

        {/* Highlights & Quick Insights */}
        <motion.div 
          id="card-insights"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-white rounded-[2rem] p-6 border-2 border-slate-200 flex flex-col justify-between shadow-xs hover:shadow-md hover:scale-[1.01] transition-all duration-300"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Student Insights</span>
              <h3 className="text-xl font-extrabold font-display text-slate-800 mt-1">Focus Metrics</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-3.5 my-1 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Total Subjects:</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-xl">
                <BookOpen className="w-4 h-4 text-slate-400" />
                {subjects.length} enrolled
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Most Studied:</span>
              <span className="font-bold text-slate-800 truncate max-w-[150px] bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-xl" title={getMostStudiedSubject()}>
                {getMostStudiedSubject()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Targets Met:</span>
              <span className="font-extrabold text-emerald-600 flex items-center gap-1 bg-emerald-50/50 border border-emerald-100 px-2.5 py-1 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {stats.subjectProgress.filter(p => p.completedHours >= p.targetHours).length} / {subjects.length}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-50 text-[11px] text-slate-400 italic">
            "Every minute of focus brings you closer to mastery."
          </div>
        </motion.div>
      </div>

      {/* Weekly Study Distribution Chart */}
      <motion.div 
        id="weekly-chart-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.12 }}
        className="bg-white rounded-[2rem] p-6 md:p-8 border-2 border-slate-200 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <div>
            <h2 className="text-xl font-extrabold font-display text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Weekly Study Chart
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Visual distribution of hours studied per subject during the current week.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-500" />
              <span>Hours Studied</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-200" />
              <span>Weekly Target</span>
            </div>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/50 rounded-2xl text-xs text-slate-400 italic border-2 border-dashed border-slate-150">
            No subjects added yet. Add some subjects to view your study chart.
          </div>
        ) : chartData.every(d => d.hours === 0) ? (
          <div className="text-center py-12 bg-slate-50/50 rounded-[1.5rem] text-xs text-slate-400 italic border-2 border-dashed border-slate-150 flex flex-col items-center justify-center p-6">
            <Clock className="w-8 h-8 text-slate-300 mb-2" />
            <span className="font-bold text-slate-500">No hours logged this week</span>
            <span className="mt-1 text-slate-400">Once you start logging study sessions, your weekly bar chart will populate here!</span>
          </div>
        ) : (
          <div className="h-72 w-full mt-4 font-sans text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  stroke="#94a3b8" 
                  tick={{ fontSize: 11, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  stroke="#94a3b8" 
                  tick={{ fontSize: 11, fontWeight: 500 }}
                  unit="h"
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc', radius: 12 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const colorClasses = getSubjectColorClasses(data.color);
                      return (
                        <div className="bg-white p-3.5 border-2 border-slate-100 shadow-xl rounded-2xl font-sans text-xs min-w-[180px]">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full ${colorClasses.progress}`} />
                            <span className="font-extrabold text-slate-800 truncate block max-w-[140px]">{data.name}</span>
                          </div>
                          <div className="space-y-1 text-slate-500 font-medium">
                            <div className="flex justify-between">
                              <span>Hours Studied:</span>
                              <strong className="text-slate-800 font-mono font-bold">{data.hours}h</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Weekly Target:</span>
                              <strong className="text-slate-600 font-mono font-bold">{data.target}h</strong>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-slate-50 text-[10px]">
                              <span>Status:</span>
                              <span className={data.hours >= data.target ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                                {data.hours >= data.target ? "Target Met 🎉" : `${(data.target - data.hours).toFixed(1)}h to go`}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="hours" 
                  radius={[8, 8, 0, 0]} 
                  maxBarSize={60}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getHexColor(entry.color)} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {/* Progress Bars Grid Section */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 border-2 border-slate-200 shadow-xs" id="dashboard-progress">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-xl font-extrabold font-display text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Subject Progress
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Click any subject card to isolate and filter its logged sessions.
            </p>
          </div>
          {activeFilterId && (
            <button 
              onClick={() => onSelectFilterId(null)}
              className="mt-2 sm:mt-0 text-xs text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 px-3 py-1.5 rounded-full font-bold transition-all border-2 border-indigo-100 cursor-pointer"
            >
              Clear Subject Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="subject-progress-grid">
          {stats.subjectProgress.map((prog, idx) => {
            const colorClasses = getSubjectColorClasses(prog.color);
            const isCompleted = prog.completedHours >= prog.targetHours;
            const isSelected = activeFilterId === prog.subjectId;

            return (
              <motion.div
                key={prog.subjectId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                onClick={() => onSelectFilterId(isSelected ? null : prog.subjectId)}
                className={`relative rounded-2xl p-5 border-2 transition-all duration-300 cursor-pointer select-none flex flex-col justify-between ${
                  isSelected 
                    ? `border-indigo-500 bg-indigo-50/15 shadow-sm ring-4 ring-indigo-50` 
                    : `border-slate-100 bg-slate-50/40 hover:bg-white hover:border-slate-200 hover:shadow-xs`
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${colorClasses.badge}`}>
                      {prog.subjectName.split(' ')[0]}
                    </span>
                    {isCompleted && (
                      <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        Completed 🎉
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 line-clamp-1 mb-3" title={prog.subjectName}>
                    {prog.subjectName}
                  </h4>
                </div>

                <div className="space-y-2 mt-auto">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">
                      Logged: <strong className="text-slate-700 font-mono">{prog.completedHours}h</strong> / {prog.targetHours}h
                    </span>
                    <span className={isCompleted ? 'text-emerald-600 font-black' : `${colorClasses.text} font-black`}>
                      {prog.percentage}%
                    </span>
                  </div>

                  {/* Sleek Progress Track */}
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : colorClasses.progress}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(prog.percentage, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-sans">
                    <span>
                      {isCompleted 
                        ? 'Excellent work!' 
                        : `${(prog.targetHours - prog.completedHours).toFixed(1)}h remaining`}
                    </span>
                    <span className="flex items-center gap-0.5 text-indigo-500 font-bold">
                      Filter sessions <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
