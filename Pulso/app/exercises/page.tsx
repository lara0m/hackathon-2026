import { useState } from 'react';
import FractionExercise from '../../components/FractionExercise';
import FeedbackDisplay from '../../components/FeedbackDisplay';

const ExercisesPage = () => {
  const [exercise, setExercise] = useState('');
  const [answer, setAnswer] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ exercise, answer, reasoning }),
    });

    const data = await response.json();
    setFeedback(data);
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold">Fraction Exercises</h1>
      <FractionExercise setExercise={setExercise} />
      <form onSubmit={handleSubmit} className="mt-4">
        <input
          type="text"
          placeholder="Your answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="border p-2"
        />
        <input
          type="text"
          placeholder="Your reasoning"
          value={reasoning}
          onChange={(e) => setReasoning(e.target.value)}
          className="border p-2 mt-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 mt-2">
          Submit
        </button>
      </form>
      {feedback && <FeedbackDisplay feedback={feedback} />}
    </div>
  );
};

export default ExercisesPage;