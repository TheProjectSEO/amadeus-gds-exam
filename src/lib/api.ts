// Apps Script API client + configuration
// The Apps Script URL and Google Client ID are configured here

// ─── Config ─────────────────────────────────────────────────────────
// Replace these values after setting up Google Cloud + Apps Script
export const GOOGLE_CLIENT_ID = '872142500142-f5d6hde4m428avdnq637kcas989qa2g5.apps.googleusercontent.com';
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbycNhh-crQKJM_iQQ33MEBCLDTQW70Da-qiSin4TxDIllkpBKLlrGEF4WbKRo2M0smfSg/exec';

// ─── Types ──────────────────────────────────────────────────────────

export interface SubmitExamPayload {
  idToken: string;
  studentName: string;
  studentEmail: string;
  studentSection: string;
  answers: Record<number, string>;
  questionOrder: number[]; // which 100 questions were assigned
  questionsAttempted: number;
  timeTakenSeconds: number;
}

export interface SubmitExamResponse {
  success: boolean;
  error?: string;
  alreadySubmitted?: boolean;
}

export interface CheckResultsResponse {
  released: boolean;
  totalCorrect?: number;
  totalQuestions?: number;
  scorePercent?: number;
}

export interface SubmissionRow {
  studentName: string;
  email: string;
  section: string;
  questionsAttempted: number;
  totalCorrect: number;
  scorePercent: number;
  submissionTime: string;
}

// ─── API Functions ──────────────────────────────────────────────────

async function postToAppsScript(payload: Record<string, unknown>): Promise<unknown> {
  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' }, // Apps Script requires text/plain for CORS
    body: JSON.stringify(payload),
  });
  return response.json();
}

async function getFromAppsScript(params: Record<string, string>): Promise<unknown> {
  const url = new URL(APPS_SCRIPT_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const response = await fetch(url.toString());
  return response.json();
}

export async function submitExam(payload: SubmitExamPayload): Promise<SubmitExamResponse> {
  const result = await postToAppsScript({
    action: 'submitExam',
    ...payload,
  });
  return result as SubmitExamResponse;
}

export async function checkResults(idToken: string): Promise<CheckResultsResponse> {
  const result = await getFromAppsScript({
    action: 'checkResults',
    idToken,
  });
  return result as CheckResultsResponse;
}

export async function releaseResults(idToken: string, release: boolean): Promise<{ success: boolean }> {
  const result = await postToAppsScript({
    action: 'releaseResults',
    idToken,
    release,
  });
  return result as { success: boolean };
}

export async function getSubmissions(idToken: string): Promise<{ submissions: SubmissionRow[] }> {
  const result = await getFromAppsScript({
    action: 'getSubmissions',
    idToken,
  });
  return result as { submissions: SubmissionRow[] };
}
