export type Role = "student" | "professor";

export interface User {
  role: Role;
  name: string;
  hemisId: string;
  avatar: string;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  professorName: string;
}

export interface TranscriptSegment {
  time: string;
  text: string;
}

export interface Lecture {
  id: string;
  courseId: string;
  title: string;
  date: string;
  audioUrl: string;
  transcript: TranscriptSegment[];
  summary: string[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestampRef?: string;
}

export interface ClassroomAnalytics {
  connectedStudents: number;
  comprehensionRate: number;
  confusedTopics: string[];
}

export interface AskLectureResponse {
  answer?: string;
  timestampRef?: string;
  fallback?: boolean;
  error?: string;
}