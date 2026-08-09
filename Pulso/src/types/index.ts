export type Language = 'python' | 'javascript' | 'typescript' | 'java' | 'c';

export type Difficulty = 'easier' | 'same' | 'harder';

export type ErrorType =
  | 'variable_scope'
  | 'wrong_loop_logic'
  | 'index_off_by_one'
  | 'wrong_condition'
  | 'type_confusion'
  | 'syntax_error'
  | 'function_misuse'
  | 'wrong_operator'
  | 'missing_return'
  | 'logic_inverted'
  | 'none'; // cuando está correcto

export type DiagnosisResult = {
  is_correct: boolean;
  error_type: ErrorType;
  error_explanation: string; // explicación breve para el alumno, sin revelar la respuesta
  hint: string; // pista para que lo intente de nuevo
  next_difficulty: Difficulty;
  encouragement: string; // mensaje motivacional corto
};

export type Exercise = {
  prompt: string; // enunciado del problema
  starter_code: string; // código con blancos o código incompleto
  blanks: string[]; // las partes que el alumno tiene que completar (para validación)
  difficulty: 'easy' | 'medium' | 'hard';
  concept: string; // qué concepto evalúa este ejercicio
};

export type Session = {
  id: string;
  code: string;
  teacher_name: string;
  topic: string;
  created_at: string;
};

export type Student = {
  id: string;
  session_id: string;
  name: string;
  language: Language;
  score: number;
  exercises_completed: number;
  created_at: string;
};

export type Answer = {
  id: string;
  student_id: string;
  session_id: string;
  exercise_prompt: string;
  student_answer: string;
  is_correct: boolean;
  error_type: ErrorType;
  error_explanation: string;
  hint_used: boolean;
  next_difficulty: Difficulty;
  created_at: string;
};

// Lo que ve el docente en el dashboard
export type DashboardData = {
  total_students: number;
  active_students: number;
  error_summary: { error_type: ErrorType; count: number; label: string }[];
  students: {
    id: string;
    name: string;
    language: Language;
    score: number;
    exercises_completed: number;
    last_error_type: ErrorType | null;
    status: 'ok' | 'struggling' | 'idle';
  }[];
};