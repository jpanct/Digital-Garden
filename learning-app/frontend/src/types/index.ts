export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface Milestone {
  id: string;
  text: string;
  completed: boolean;
}

export interface Module {
  id: string;
  title: string;
  order: number;
  description: string;
  estimated_days: number;
  milestones: Milestone[];
}

export interface LearningPlan {
  id: number;
  user_id: number;
  skill: string;
  level_assessed: string;
  total_milestones: number;
  completed_milestones: number;
  garden_stage: number;
  created_at: string;
  updated_at: string;
  plan_data: {
    title: string;
    description: string;
    estimated_weeks: number;
    modules: Module[];
  };
}

export interface AssessmentMessage {
  id: number;
  role: 'assistant' | 'user';
  content: string;
  created_at: string;
}

export interface AssessmentSession {
  id: number;
  skill: string;
  status: 'active' | 'completed';
  messages: AssessmentMessage[];
}

export interface Resource {
  id: number;
  resource_type: 'video' | 'article' | 'course' | 'book' | 'github';
  title: string;
  url: string;
  source: string;
  description: string;
  relevance_score: number;
}

export interface Note {
  id: number;
  module_id: string;
  content_html: string;
  content_text: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index?: number;
  explanation?: string;
}

export interface Quiz {
  id: number;
  module_id: string;
  questions: QuizQuestion[];
}

export interface QuizResult {
  score: number;
  total_questions: number;
  correct_count: number;
  results: Array<{
    question_id: string;
    correct: boolean;
    correct_index: number;
    explanation: string;
  }>;
}

export interface MilestoneUpdateResponse {
  plan_id: number;
  milestone_id: string;
  completed: boolean;
  completed_milestones: number;
  total_milestones: number;
  garden_stage: number;
  progress_percentage: number;
}
