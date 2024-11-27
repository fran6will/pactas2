import React from 'react';
import { useLocation } from 'react-router-dom';

const SuccessPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sessionId = params.get('session_id');

  return (
    <div>
      <h1>Payment Successful!</h1>
      <p>Session ID: {sessionId || 'No session ID provided'}</p>
    </div>
  );
};

export default SuccessPage;
