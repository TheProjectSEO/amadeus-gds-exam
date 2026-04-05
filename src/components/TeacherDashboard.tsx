import { useState, useEffect } from 'react';
import { ChevronLeft, Shield, Users, ExternalLink, ToggleLeft, ToggleRight } from 'lucide-react';
import { releaseResults, getSubmissions, type SubmissionRow } from '../lib/api';
import type { GoogleUser } from '../lib/auth';

interface TeacherDashboardProps {
  user: GoogleUser;
  onBack: () => void;
}

export function TeacherDashboard({ user, onBack }: TeacherDashboardProps) {
  const [resultsReleased, setResultsReleased] = useState(false);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function loadSubmissions() {
    try {
      setLoading(true);
      const data = await getSubmissions(user.credential);
      setSubmissions(data.submissions || []);
    } catch {
      setError('Failed to load submissions. Check Apps Script deployment.');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleRelease() {
    try {
      setToggling(true);
      const newState = !resultsReleased;
      await releaseResults(user.credential, newState);
      setResultsReleased(newState);
    } catch {
      setError('Failed to toggle results release.');
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="cursor-pointer flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to menu
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Teacher Dashboard</h1>
            <p className="text-sm text-slate-400">Signed in as {user.email}</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Release Results Toggle */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium mb-1">Release Results</h3>
                <p className="text-xs text-slate-400">
                  {resultsReleased
                    ? 'Students can see their scores'
                    : 'Results are hidden from students'}
                </p>
              </div>
              <button
                onClick={handleToggleRelease}
                disabled={toggling}
                className="cursor-pointer text-slate-300 hover:text-white transition-colors disabled:opacity-50"
              >
                {resultsReleased ? (
                  <ToggleRight className="w-10 h-10 text-green-400" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-slate-500" />
                )}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <h3 className="text-white font-medium">Submissions</h3>
            </div>
            <p className="text-3xl font-bold text-white">{submissions.length}</p>
            <p className="text-xs text-slate-400 mt-1">Total exam submissions</p>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-700/30">
            <h3 className="text-white font-medium">All Submissions</h3>
            <button
              onClick={loadSubmissions}
              className="cursor-pointer text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading submissions...</div>
          ) : submissions.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No submissions yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/30 text-left">
                    <th className="px-4 py-3 text-slate-400 font-medium">#</th>
                    <th className="px-4 py-3 text-slate-400 font-medium">Student Name</th>
                    <th className="px-4 py-3 text-slate-400 font-medium">Email</th>
                    <th className="px-4 py-3 text-slate-400 font-medium">Section</th>
                    <th className="px-4 py-3 text-slate-400 font-medium">Attempted</th>
                    <th className="px-4 py-3 text-slate-400 font-medium">Score</th>
                    <th className="px-4 py-3 text-slate-400 font-medium">%</th>
                    <th className="px-4 py-3 text-slate-400 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s, i) => (
                    <tr key={i} className="border-b border-slate-700/20 hover:bg-slate-700/20">
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{i + 1}</td>
                      <td className="px-4 py-3 text-white">{s.studentName}</td>
                      <td className="px-4 py-3 text-slate-300 text-xs">{s.email}</td>
                      <td className="px-4 py-3 text-slate-300">{s.section}</td>
                      <td className="px-4 py-3 text-slate-300 font-mono">{s.questionsAttempted}</td>
                      <td className="px-4 py-3 text-white font-mono font-medium">{s.totalCorrect}/100</td>
                      <td className="px-4 py-3 font-mono">
                        <span className={s.scorePercent >= 75 ? 'text-green-400' : s.scorePercent >= 50 ? 'text-amber-400' : 'text-red-400'}>
                          {s.scorePercent.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{s.submissionTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
