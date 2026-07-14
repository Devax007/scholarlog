import React, { useState } from 'react';
import { BookOpen, Clock, Calendar, FileText, PlusCircle } from 'lucide-react';
import { Subject, StudySession } from '../types';
import { getRelativeDateString } from '../sampleData';

interface SessionFormProps {
  subjects: Subject[];
  onLogSession: (session: Omit<StudySession, 'id'>) => void;
}

export default function SessionForm({ subjects, onLogSession }: SessionFormProps) {
  const [subjectId, setSubjectId] = useState('');
  const [duration, setDuration] = useState<number | ''>('');
  const [date, setDate] = useState(getRelativeDateString(0));
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const durationPresets = [
    { label: '30m', value: 30 },
    { label: '45m', value: 45 },
    { label: '1h', value: 60 },
    { label: '1.5h', value: 90 },
    { label: '2h', value: 120 },
    { label: '3h', value: 180 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!subjectId) {
      setError('Please select a subject.');
      return;
    }
    if (!duration || duration <= 0) {
      setError('Please enter a valid study duration in minutes.');
      return;
    }
    if (!date) {
      setError('Please select a study date.');
      return;
    }
    if (!note.trim()) {
      setError('Please enter a brief note on what you covered.');
      return;
    }

    onLogSession({
      subjectId,
      duration: Number(duration),
      date,
      note: note.trim(),
    });

    // Reset inputs
    setDuration('');
    setNote('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 md:p-8 border-2 border-slate-200 shadow-xs" id="session-form-container">
      <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
          <PlusCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-800 font-display">Log Study Session</h3>
          <p className="text-xs text-slate-400 font-sans">Record and review your study efforts.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-sm">
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border-2 border-rose-100 text-xs font-bold">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border-2 border-emerald-100 text-xs font-bold">
            Session logged successfully! Keep it up! 🚀
          </div>
        )}

        {/* Subject Dropdown */}
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            Subject <span className="text-rose-500">*</span>
          </label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full rounded-2xl border-2 border-slate-200 px-3.5 py-2.5 text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-white font-medium"
          >
            <option value="">-- Choose Subject --</option>
            {subjects.map((subj) => (
              <option key={subj.id} value={subj.id}>
                {subj.name}
              </option>
            ))}
          </select>
        </div>

        {/* Duration Input & Presets */}
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Duration (Minutes) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            placeholder="e.g. 45"
            value={duration}
            onChange={(e) => setDuration(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full rounded-2xl border-2 border-slate-200 px-3.5 py-2.5 text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-mono font-medium"
          />
          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {durationPresets.map((preset) => (
              <button
                type="button"
                key={preset.value}
                onClick={() => setDuration(preset.value)}
                className={`text-xs px-3 py-1.5 rounded-full border-2 font-bold transition-all cursor-pointer ${
                  duration === preset.value
                    ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                    : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Input */}
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Study Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-2xl border-2 border-slate-200 px-3.5 py-2.5 text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-mono bg-white font-medium"
          />
        </div>

        {/* Note Textarea */}
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            What did you cover? <span className="text-rose-500">*</span>
          </label>
          <textarea
            placeholder="Detail topics studied, chapters read, or issues solved..."
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-2xl border-2 border-slate-200 px-3.5 py-2.5 text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all leading-relaxed font-medium"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 font-extrabold shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add Log Entry
        </button>
      </form>
    </div>
  );
}
