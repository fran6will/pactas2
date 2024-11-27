import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const SuccessPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sessionId = params.get('session_id');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/payments/verify-session?session_id=${sessionId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch payment details');
          }
          return response.json();
        })
        .then((data) => {
          setPaymentDetails(data);
          setLoading(false);
        })
        .catch((error) => {
          setError(error.message);
          setLoading(false);
        });
    } else {
      setError('Session ID is missing');
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return <div>Loading payment details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Payment Successful!</h1>
      {paymentDetails ? (
        <ul>
          <li>Amount: {paymentDetails.paymentIntent.amount / 100} {paymentDetails.paymentIntent.currency.toUpperCase()}</li>
          <li>Status: {paymentDetails.paymentIntent.status}</li>
          <li>Session ID: {paymentDetails.session.id}</li>
        </ul>
      ) : (
        <p>No payment details available.</p>
      )}
    </div>
  );
};

export default SuccessPage;
