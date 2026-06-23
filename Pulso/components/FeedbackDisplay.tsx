import React from 'react';

interface FeedbackDisplayProps {
  feedback: string;
  isError: boolean;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ feedback, isError }) => {
  return (
    <div className={`p-4 rounded-md ${isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
      <p>{feedback}</p>
    </div>
  );
};

export default FeedbackDisplay;