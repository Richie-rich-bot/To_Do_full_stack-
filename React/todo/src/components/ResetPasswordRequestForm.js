import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";
import axios from "axios";

function ResetPasswordRequestForm() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Logic to send password reset email
    // This can be implemented using Axios or any other method as per your backend setup
    // Example:
    try {
      // Call your API to send password reset email
       await axios.post("http://localhost:3001/auth/reset-password-request", { email });
      setEmailSent(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-center mb-4">Forgot Password</h2>
        {emailSent ? (
          <div className="alert alert-success" role="alert">
            An email has been sent to {email} with further instructions.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="inputEmail" className="form-label">
                <FaEnvelope className="me-2" /> Email:
              </label>
              <input
                type="email"
                className="form-control"
                id="inputEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Reset Password
            </button>
          </form>
        )}
        <p className="mt-3 text-center">
          Remembered your password? <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPasswordRequestForm;
