export type Feedback = {
  exercise: string;
  answer: string;
  reasoning: string;
  diagnosis: string;
};

export type Session = {
  id: string;
  code: string;
  createdAt: string;
};

export type Diagnosis = {
  id: string;
  sessionId: string;
  feedback: Feedback;
  createdAt: string;
};