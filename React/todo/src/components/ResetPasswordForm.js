import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ResetPasswordForm = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { resetToken } = useParams(); // Extract resetToken from the URL

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/auth/reset-password', { resetToken, newPassword: password });
      setSuccessMessage(response.data.message); // Assuming the server returns a success message
      setErrorMessage(''); // Clear any previous error message

      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
      
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'An error occurred'); // Handle error
      setSuccessMessage(''); // Clear any previous success message
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}
      <div className="mb-3">
        <label htmlFor="password" className="form-label">New Password</label>
        <input
          type="password"
          className="form-control"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
        <input
          type="password"
          className="form-control"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">Reset Password</button>
    </form>
  );
};

export default ResetPasswordForm;
