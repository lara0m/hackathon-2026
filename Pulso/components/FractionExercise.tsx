import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const FractionExercise = () => {
  const [exercise, setExercise] = useState('');
  const [answer, setAnswer] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('exercises')
      .insert([{ exercise, answer, reasoning }]);

    if (error) {
      console.error('Error inserting exercise:', error);
      return;
    }

    // Call the feedback API here
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ exercise, answer, reasoning }),
    });

    const feedbackData = await response.json();
    setFeedback(feedbackData);
  };

  return (
    <div>
      <h2>Fraction Exercise</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Exercise:
            <input
              type="text"
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Your Answer:
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Reasoning:
            <textarea
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              required
            />
          </label>
        </div>
        <button type="submit">Submit</button>
      </form>
      {feedback && (
        <div>
          <h3>Feedback:</h3>
          <p>{feedback}</p>
        </div>
      )}
    </div>
  );
};

export default FractionExercise;