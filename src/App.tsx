import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plane, BookOpen, Clock, ChevronLeft, ChevronRight, Check, X,
  Menu, XIcon, AlertTriangle, Printer, RotateCcw, Monitor, MonitorOff,
  Eye, EyeOff
} from 'lucide-react';
import { QUESTIONS, SECTIONS, decodeAnswer, type Question, type Section } from './data/questions';

// ─── Types ───────────────────────────────────────────────────────────

type AppMode = 'landing' | 'practice' | 'exam-setup' | 'exam' | 'results';

interface Answers {
  [questionId: number]: string;
}

interface FeedbackState {
  [questionId: number]: { correct: boolean; shown: boolean };
}

interface SectionScore {
  correct: number;
  total: number;
}

// ─── Utility ─────────────────────────────────────────────────────────

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function checkAnswer(input: string, encoded: string): boolean {
  return input.trim() === decodeAnswer(encoded);
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function getSectionIcon(sectionId: string) {
  const icons: Record<string, typeof Plane> = {
    encode_decode: BookOpen,
    time_difference: Clock,
    availability: Plane,
    pnr_name: BookOpen,
    pnr_itinerary: BookOpen,
    pnr_contact: BookOpen,
    pnr_ticketing: BookOpen,
    pnr_received: BookOpen,
  };
  return icons[sectionId] || BookOpen;
}

// ─── Landing Page ────────────────────────────────────────────────────

function LandingPage({ onSelectMode }: { onSelectMode: (mode: AppMode) => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Plane className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Fira Code', monospace" }}>
          Amadeus GDS
        </h1>
        <h2 className="text-xl sm:text-2xl font-semibold text-blue-400 mb-2">
          Practical Examination
        </h2>
        <p className="text-slate-400 text-sm">ABT Tech — Final Exam</p>
      </div>

      {/* Mode Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full">
        <button
          onClick={() => onSelectMode('practice')}
          className="cursor-pointer group relative p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-green-500/50 hover:bg-slate-800/80 transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-4">
            <BookOpen className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Practice Mode</h3>
          <p className="text-sm text-slate-400">Practice freely with instant feedback. No timer, unlimited retries.</p>
          <div className="mt-4 text-xs text-green-400 font-medium">100 Questions • All Sections</div>
        </button>

        <button
          onClick={() => onSelectMode('exam-setup')}
          className="cursor-pointer group relative p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Exam Mode</h3>
          <p className="text-sm text-slate-400">Timed exam, randomized questions. Score shown after submission.</p>
          <div className="mt-4 text-xs text-blue-400 font-medium">120 Minutes • 1 Point Each</div>
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-10 max-w-xl text-center">
        <p className="text-xs text-slate-500">
          Answers are case-sensitive, space-sensitive, and punctuation-sensitive. Type commands exactly as taught.
        </p>
      </div>
    </div>
  );
}

// ─── Exam Setup ──────────────────────────────────────────────────────

function ExamSetup({ onStart }: { onStart: (name: string, section: string) => void }) {
  const [name, setName] = useState('');
  const [section, setSection] = useState('');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md">
        <button onClick={() => window.location.reload()} className="cursor-pointer flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to menu
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Exam Setup</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. JUAN DELA CRUZ"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              style={{ fontFamily: "'Fira Code', monospace" }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Section / Student Number *</label>
            <input
              type="text"
              value={section}
              onChange={e => setSection(e.target.value)}
              placeholder="e.g. BSBA-TM 2A"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-300">
              <p className="font-medium mb-1">Before you start:</p>
              <ul className="space-y-1 text-amber-300/80">
                <li>• You have 120 minutes to complete 100 questions</li>
                <li>• Questions are randomized</li>
                <li>• You cannot see if your answer is correct during the exam</li>
                <li>• The exam auto-submits when time runs out</li>
                <li>• Closing the browser will lose all progress</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={() => { if (name.trim() && section.trim()) onStart(name.trim(), section.trim()); }}
          disabled={!name.trim() || !section.trim()}
          className="cursor-pointer w-full mt-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold transition-colors"
        >
          Start Exam
        </button>
      </div>
    </div>
  );
}

// ─── Terminal Display ────────────────────────────────────────────────

function TerminalDisplay({ text }: { text: string }) {
  return (
    <div className="my-3 rounded-lg border border-slate-700/50 overflow-x-auto" style={{ background: '#0D1117' }}>
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-700/30">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60"></div>
        <span className="ml-2 text-[10px] text-slate-500 font-mono">AMADEUS</span>
      </div>
      <pre className="p-4 text-sm leading-relaxed" style={{ fontFamily: "'Fira Code', monospace", color: '#4ADE80', whiteSpace: 'pre', fontSize: '13px' }}>
        {text}
      </pre>
    </div>
  );
}

// ─── Question Card ───────────────────────────────────────────────────

function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  answer,
  feedback,
  isExam,
  isPasteBlocked,
  onAnswer,
  onCheck,
}: {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  answer: string;
  feedback: { correct: boolean; shown: boolean } | undefined;
  isExam: boolean;
  isPasteBlocked: boolean;
  onAnswer: (val: string) => void;
  onCheck: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [question.id]);

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 text-xs font-bold font-mono">
            #{question.id}
          </span>
          <span className="text-xs text-slate-400 font-medium">{question.sectionLabel}</span>
        </div>
        <span className="text-xs text-slate-500">{questionIndex + 1} / {totalQuestions}</span>
      </div>

      {/* Question text */}
      <p className="text-white text-base sm:text-lg leading-relaxed mb-4">{question.question}</p>

      {/* Availability display for SS questions */}
      {question.hasAvailabilityDisplay && question.availabilityText && (
        <TerminalDisplay text={question.availabilityText} />
      )}

      {/* Answer input */}
      <div className="mt-4">
        <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider font-medium">Your Answer</label>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={answer}
            onChange={e => onAnswer(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onCheck(); }}
            onPaste={isPasteBlocked ? e => e.preventDefault() : undefined}
            maxLength={100}
            placeholder="Type your command here..."
            className="flex-1 px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
            style={{ fontFamily: "'Fira Code', monospace" }}
            autoComplete="off"
            spellCheck={false}
          />
          {!isExam && (
            <button
              onClick={onCheck}
              className="cursor-pointer px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors shrink-0"
            >
              Check
            </button>
          )}
        </div>
        <p className="mt-1.5 text-[11px] text-slate-500">
          Case-sensitive, space-sensitive, and punctuation-sensitive
        </p>
      </div>

      {/* Feedback (practice mode only) */}
      {!isExam && feedback?.shown && (
        <div className={`mt-4 p-3 rounded-lg border ${feedback.correct ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <div className="flex items-center gap-2">
            {feedback.correct ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400 font-medium">Correct!</span>
              </>
            ) : (
              <>
                <X className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400 font-medium">Incorrect</span>
              </>
            )}
          </div>
          {!feedback.correct && (
            <div className="mt-2">
              <span className="text-xs text-slate-400">Correct answer: </span>
              <code className="text-xs text-amber-400 font-mono bg-slate-900/50 px-2 py-0.5 rounded">
                {decodeAnswer(question.answer)}
              </code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────

function Sidebar({
  sections,
  questions,
  answers,
  feedback,
  currentQuestionId,
  isExam,
  isOpen,
  onClose,
  onSelectQuestion,
}: {
  sections: Section[];
  questions: Question[];
  answers: Answers;
  feedback: FeedbackState;
  currentQuestionId: number;
  isExam: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestion: (idx: number) => void;
}) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />}

      <aside className={`fixed top-0 left-0 h-full w-72 bg-slate-900/95 border-r border-slate-700/50 z-40 transform transition-transform duration-200 lg:relative lg:translate-x-0 lg:z-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <span className="text-sm font-semibold text-white">Navigation</span>
            <button onClick={onClose} className="cursor-pointer text-slate-400 hover:text-white">
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Progress overview */}
          <div className="mb-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
            <div className="text-xs text-slate-400 mb-1">Progress</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${(Object.keys(answers).filter(k => answers[Number(k)]?.trim()).length / questions.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-300 font-mono">
                {Object.keys(answers).filter(k => answers[Number(k)]?.trim()).length}/{questions.length}
              </span>
            </div>
          </div>

          {/* Sections */}
          {sections.map(section => {
            const sectionQs = questions.filter(q => q.section === section.id);
            if (sectionQs.length === 0) return null;
            const Icon = getSectionIcon(section.id);
            const answered = sectionQs.filter(q => answers[q.id]?.trim()).length;
            const correct = isExam ? 0 : sectionQs.filter(q => feedback[q.id]?.correct).length;

            return (
              <div key={section.id} className="mb-3">
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-medium text-slate-300 flex-1">{section.label}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {isExam ? `${answered}/${sectionQs.length}` : `${correct}/${sectionQs.length}`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 px-2">
                  {sectionQs.map(q => {
                    const qIdx = questions.findIndex(qq => qq.id === q.id);
                    const isActive = q.id === currentQuestionId;
                    const hasAnswer = !!answers[q.id]?.trim();
                    const isCorrect = feedback[q.id]?.correct;

                    let dotColor = 'bg-slate-700 border-slate-600';
                    if (isActive) dotColor = 'bg-blue-500 border-blue-400';
                    else if (!isExam && isCorrect) dotColor = 'bg-green-500/80 border-green-400';
                    else if (!isExam && feedback[q.id]?.shown && !isCorrect) dotColor = 'bg-red-500/60 border-red-400';
                    else if (hasAnswer) dotColor = 'bg-slate-500 border-slate-400';

                    return (
                      <button
                        key={q.id}
                        onClick={() => { onSelectQuestion(qIdx); onClose(); }}
                        className={`cursor-pointer w-6 h-6 rounded text-[10px] font-mono border transition-colors flex items-center justify-center ${dotColor} ${isActive ? 'text-white' : 'text-slate-300 hover:border-blue-400/50'}`}
                      >
                        {q.id}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}

// ─── Results Screen ──────────────────────────────────────────────────

function ResultsScreen({
  questions,
  answers,
  studentName,
  studentSection,
  onRestart,
}: {
  questions: Question[];
  answers: Answers;
  studentName?: string;
  studentSection?: string;
  onRestart: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  // Calculate scores
  let total = 0;
  const sectionScores: Record<string, SectionScore> = {};
  const results: { question: Question; studentAnswer: string; correct: boolean }[] = [];

  // Sort by original ID for display
  const sortedQuestions = [...questions].sort((a, b) => a.id - b.id);

  sortedQuestions.forEach(q => {
    const studentAnswer = answers[q.id] || '';
    const correct = checkAnswer(studentAnswer, q.answer);
    if (correct) total++;
    if (!sectionScores[q.section]) sectionScores[q.section] = { correct: 0, total: 0 };
    sectionScores[q.section].total++;
    if (correct) sectionScores[q.section].correct++;
    results.push({ question: q, studentAnswer, correct });
  });

  const percentage = (total / questions.length) * 100;

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Score Card */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 sm:p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Exam Results</h2>

          {studentName && (
            <div className="text-sm text-slate-300 mb-1">
              <span className="text-slate-500">Student:</span> {studentName}
            </div>
          )}
          {studentSection && (
            <div className="text-sm text-slate-300 mb-1">
              <span className="text-slate-500">Section:</span> {studentSection}
            </div>
          )}
          <div className="text-sm text-slate-300 mb-6">
            <span className="text-slate-500">Date:</span> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          {/* Big Score */}
          <div className="text-center py-6 rounded-xl bg-slate-900/50 border border-slate-700/30 mb-6">
            <div className="text-5xl font-bold font-mono" style={{ color: percentage >= 75 ? '#22C55E' : percentage >= 50 ? '#F59E0B' : '#EF4444' }}>
              {total}/{questions.length}
            </div>
            <div className="text-lg text-slate-400 mt-1">{percentage.toFixed(1)}%</div>
          </div>

          {/* Section Breakdown */}
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Section Breakdown</h3>
          <div className="space-y-2">
            {SECTIONS.map(section => {
              const score = sectionScores[section.id];
              if (!score) return null;
              const pct = (score.correct / score.total) * 100;
              return (
                <div key={section.id} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-36 truncate">{section.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct >= 75 ? '#22C55E' : pct >= 50 ? '#F59E0B' : '#EF4444',
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-300 font-mono w-12 text-right">{score.correct}/{score.total}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6 no-print">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-colors text-sm"
          >
            {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
          <button
            onClick={() => window.print()}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-colors text-sm"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button
            onClick={onRestart}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" /> Restart
          </button>
        </div>

        {/* Detailed Review */}
        {showDetails && (
          <div className="space-y-3">
            {results.map(r => (
              <div
                key={r.question.id}
                className={`p-4 rounded-xl border ${r.correct ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-700/50 text-slate-300">
                    #{r.question.id}
                  </span>
                  {r.correct ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <X className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-xs text-slate-500">{r.question.sectionLabel}</span>
                </div>
                <p className="text-sm text-slate-300 mb-2">{r.question.question}</p>
                {r.question.hasAvailabilityDisplay && r.question.availabilityText && (
                  <TerminalDisplay text={r.question.availabilityText} />
                )}
                <div className="flex flex-col sm:flex-row gap-2 text-xs">
                  <div className="flex-1">
                    <span className="text-slate-500">Your answer: </span>
                    <code className={`font-mono px-1.5 py-0.5 rounded ${r.correct ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
                      {r.studentAnswer || '(empty)'}
                    </code>
                  </div>
                  {!r.correct && (
                    <div className="flex-1">
                      <span className="text-slate-500">Correct: </span>
                      <code className="font-mono text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10">
                        {decodeAnswer(r.question.answer)}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────

export default function App() {
  const [mode, setMode] = useState<AppMode>('landing');
  const [questions, setQuestions] = useState<Question[]>(QUESTIONS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [feedback, setFeedback] = useState<FeedbackState>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Exam state
  const [studentName, setStudentName] = useState('');
  const [studentSection, setStudentSection] = useState('');
  const [timeLeft, setTimeLeft] = useState(120 * 60); // 120 minutes
  const [examStarted, setExamStarted] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion = questions[currentIdx];
  const isExam = mode === 'exam';

  // ── Anti-cheat: tab switching detection ──
  useEffect(() => {
    if (!isExam || !examStarted) return;
    const handler = () => {
      if (document.hidden) {
        setTabSwitches(prev => {
          const next = prev + 1;
          setShowTabWarning(true);
          setTimeout(() => setShowTabWarning(false), 5000);
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [isExam, examStarted]);

  // ── Anti-cheat: disable right-click and dev tools in exam ──
  useEffect(() => {
    if (!isExam || !examStarted) return;
    const contextHandler = (e: MouseEvent) => e.preventDefault();
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', contextHandler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('contextmenu', contextHandler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [isExam, examStarted]);

  // ── Timer ──
  useEffect(() => {
    if (!isExam || !examStarted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isExam, examStarted]);

  // ── Mode handlers ──
  const handleSelectMode = useCallback((m: AppMode) => {
    if (m === 'practice') {
      setQuestions(QUESTIONS);
      setCurrentIdx(0);
      setAnswers({});
      setFeedback({});
      setMode('practice');
    } else {
      setMode(m);
    }
  }, []);

  const handleStartExam = useCallback((name: string, section: string) => {
    setStudentName(name);
    setStudentSection(section);
    setQuestions(shuffleArray(QUESTIONS));
    setCurrentIdx(0);
    setAnswers({});
    setFeedback({});
    setTimeLeft(120 * 60);
    setTabSwitches(0);
    setExamStarted(true);
    setMode('exam');

    // Request fullscreen
    try { document.documentElement.requestFullscreen?.(); } catch { /* ok */ }
  }, []);

  const handleSubmitExam = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setExamStarted(false);
    try { document.exitFullscreen?.(); } catch { /* ok */ }
    setMode('results');
  }, []);

  const handleConfirmSubmit = useCallback(() => {
    const unanswered = questions.filter(q => !answers[q.id]?.trim()).length;
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`)) return;
    } else {
      if (!confirm('Submit your exam? You cannot change your answers after submission.')) return;
    }
    handleSubmitExam();
  }, [questions, answers, handleSubmitExam]);

  // ── Answer / Check ──
  const handleAnswer = useCallback((val: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }));
  }, [currentQuestion]);

  const handleCheck = useCallback(() => {
    const ans = answers[currentQuestion.id] || '';
    if (!ans.trim()) return;
    const correct = checkAnswer(ans, currentQuestion.answer);
    setFeedback(prev => ({ ...prev, [currentQuestion.id]: { correct, shown: true } }));
  }, [answers, currentQuestion]);

  // ── Navigation ──
  const goNext = useCallback(() => {
    if (currentIdx < questions.length - 1) setCurrentIdx(prev => prev + 1);
  }, [currentIdx, questions.length]);

  const goPrev = useCallback(() => {
    if (currentIdx > 0) setCurrentIdx(prev => prev - 1);
  }, [currentIdx]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  // ── Render ──
  if (mode === 'landing') return <LandingPage onSelectMode={handleSelectMode} />;
  if (mode === 'exam-setup') return <ExamSetup onStart={handleStartExam} />;
  if (mode === 'results') {
    return (
      <ResultsScreen
        questions={questions}
        answers={answers}
        studentName={studentName}
        studentSection={studentSection}
        onRestart={() => { setMode('landing'); setExamStarted(false); }}
      />
    );
  }

  // Practice or Exam mode
  const timerWarning = isExam && timeLeft <= 300;
  const timerCritical = isExam && timeLeft <= 60;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ userSelect: isExam ? 'none' : 'auto' }}>
      {/* Sidebar */}
      <Sidebar
        sections={SECTIONS}
        questions={questions}
        answers={answers}
        feedback={feedback}
        currentQuestionId={currentQuestion.id}
        isExam={isExam}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelectQuestion={idx => setCurrentIdx(idx)}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700/50 px-4 py-3 no-print">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="cursor-pointer lg:hidden text-slate-400 hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-white hidden sm:inline">
                  {isExam ? 'Exam Mode' : 'Practice Mode'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isExam && (
                <>
                  {/* Timer */}
                  <div className={`px-3 py-1.5 rounded-lg font-mono text-sm font-bold ${timerCritical ? 'bg-red-500/20 text-red-400 animate-pulse' : timerWarning ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-white'}`}>
                    {formatTime(timeLeft)}
                  </div>
                  {/* Submit */}
                  <button
                    onClick={handleConfirmSubmit}
                    className="cursor-pointer px-4 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors"
                  >
                    Submit
                  </button>
                </>
              )}
              {!isExam && (
                <button
                  onClick={() => setMode('landing')}
                  className="cursor-pointer text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Exit
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Tab switch warning */}
        {showTabWarning && (
          <div className="bg-red-500/20 border-b border-red-500/30 px-4 py-2 text-center no-print">
            <div className="flex items-center justify-center gap-2 text-sm text-red-400">
              <MonitorOff className="w-4 h-4" />
              <span>Tab switch detected! ({tabSwitches} total)</span>
            </div>
          </div>
        )}

        {/* Exam info bar */}
        {isExam && studentName && (
          <div className="bg-slate-800/30 border-b border-slate-700/30 px-4 py-2 no-print">
            <div className="max-w-4xl mx-auto flex items-center gap-4 text-xs text-slate-400">
              <span><Monitor className="w-3 h-3 inline mr-1" />{studentName}</span>
              <span>{studentSection}</span>
              {tabSwitches > 0 && <span className="text-red-400">Switches: {tabSwitches}</span>}
            </div>
          </div>
        )}

        {/* Question area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            {currentQuestion && (
              <QuestionCard
                question={currentQuestion}
                questionIndex={currentIdx}
                totalQuestions={questions.length}
                answer={answers[currentQuestion.id] || ''}
                feedback={feedback[currentQuestion.id]}
                isExam={isExam}
                isPasteBlocked={isExam}
                onAnswer={handleAnswer}
                onCheck={handleCheck}
              />
            )}
          </div>
        </div>

        {/* Bottom nav */}
        <nav className="sticky bottom-0 bg-slate-900/90 backdrop-blur-sm border-t border-slate-700/50 px-4 py-3 no-print">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button
              onClick={goPrev}
              disabled={currentIdx === 0}
              className="cursor-pointer flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800 disabled:text-slate-600 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-xs text-slate-400 font-mono">
              {currentIdx + 1} / {questions.length}
            </span>
            <button
              onClick={goNext}
              disabled={currentIdx === questions.length - 1}
              className="cursor-pointer flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800 disabled:text-slate-600 disabled:hover:bg-transparent transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </nav>
      </main>
    </div>
  );
}
