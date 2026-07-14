import React, { useState } from 'react';
import { BookOpen, Target, Plus, Trash2, Tag } from 'lucide-react';
import { Subject, StudySession } from '../types';
import { PRESET_COLORS, getSubjectColorClasses } from '../utils';

interface SubjectFormProps {
  subjects: Subject[];
  sessions: StudySession[];
  onAddSubject: (subject: Omit<Subject, 'id'>) => void;
  onDeleteSubject: (id: string) => void;
}

export default function SubjectForm({
  subjects,
  sessions,
  onAddSubject,
  onDeleteSubject,
}: SubjectFormProps) {
  const [name, setName] = useState('');
  const [targetHours, setTargetHours] = useState<number | ''>('');
  const [selectedColor, setSelectedColor] = useState('sky');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!name.trim()) {
      setError('Subject name is required.');
      return;
    }
    
    // Check for duplicates
    if (subjects.some((sub) => sub.name.toLowerCase() === name.trim().toLowerCase())) {
      setError('A subject with this name already exists.');
      return;
    }

    if (!targetHours || targetHours <= 0) {
      setError('Please enter a valid weekly target hour (greater than 0).');
      return;
    }

    onAddSubject({
      name: name.trim(),
      targetHours: Number(targetHours),
      color: selectedColor,
    });

    setName('');
    setTargetHours('');
    setSelectedColor('sky');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  // Helper to find how many sessions are associated with a subject
  const getSubjectSessionCount = (id: string) => {
    return sessions.filter((s) => s.subjectId === id).length;
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 md:p-8 border-2 border-slate-200 shadow-xs space-y-6 animate-fade-in" id="subject-manager-container">
      {/* Subject Creator Form */}
      <div>
        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 font-display">Manage Subjects</h3>
            <p className="text-xs text-slate-400 font-sans">Define subjects and weekly goals.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-sm">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border-2 border-rose-100 text-xs font-bold">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border-2 border-emerald-100 text-xs font-bold">
              Subject added successfully!
            </div>
          )}

          {/* Subject Name */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
              Subject Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Inorganic Chemistry"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-200 px-3.5 py-2.5 text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-medium"
            />
          </div>

          {/* Target Hours */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
              <Target className="w-3.5 h-3.5 text-slate-400" />
              Target Weekly Hours <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="168"
              placeholder="e.g. 5"
              value={targetHours}
              onChange={(e) => setTargetHours(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full rounded-2xl border-2 border-slate-200 px-3.5 py-2.5 text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-mono font-medium"
            />
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Accent Color
            </label>
            <div className="flex gap-2.5 items-center">
              {PRESET_COLORS.map((color) => (
                <button
                  type="button"
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  title={color.name}
                  className={`w-7 h-7 rounded-full ${color.class} transition-all duration-200 relative cursor-pointer ${
                    selectedColor === color.value
                      ? 'scale-125 ring-4 ring-indigo-100 shadow-sm border-2 border-white'
                      : 'hover:scale-110 opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </button>
        </form>
      </div>

      {/* Subject List */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Enrolled Subjects ({subjects.length})
        </h4>

        {subjects.length === 0 ? (
          <div className="text-center p-4 bg-slate-50/50 rounded-2xl text-xs text-slate-400 italic border-2 border-dashed border-slate-150">
            No subjects added yet. Add one above to get started.
          </div>
        ) : (
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {subjects.map((sub) => {
              const colorClasses = getSubjectColorClasses(sub.color);
              const count = getSubjectSessionCount(sub.id);

              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border-2 border-slate-100/80 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${colorClasses.progress}`} />
                    <div className="truncate">
                      <p className="font-bold text-slate-800 truncate text-xs">{sub.name}</p>
                      <p className="text-[10px] text-slate-400 font-sans">
                        Goal: <strong className="font-mono font-bold">{sub.targetHours}h</strong>/wk • {count} logged session{count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteSubject(sub.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title={
                      count > 0
                        ? `Delete "${sub.name}" (Warning: will delete ${count} associated sessions)`
                        : `Delete "${sub.name}"`
                    }
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
