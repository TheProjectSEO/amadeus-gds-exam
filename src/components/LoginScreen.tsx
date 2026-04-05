import { useEffect, useRef } from 'react';
import { Plane, ChevronLeft } from 'lucide-react';
import { renderGoogleButton } from '../lib/auth';

interface LoginScreenProps {
  onBack: () => void;
}

export function LoginScreen({ onBack }: LoginScreenProps) {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (buttonRef.current) {
      renderGoogleButton(buttonRef.current);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="cursor-pointer flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to menu
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Plane className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Sign in to take the Exam</h2>
          <p className="text-sm text-slate-400">
            Sign in with your Google account to begin. Your name and email will be recorded.
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 sm:p-8">
          <div className="flex justify-center">
            <div ref={buttonRef} />
          </div>

          <div className="mt-6 space-y-2 text-xs text-slate-500">
            <p>By signing in, you agree to:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-500">
              <li>Your name and email being recorded for grading</li>
              <li>Your answers being saved to the teacher's records</li>
              <li>One submission per email address</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
