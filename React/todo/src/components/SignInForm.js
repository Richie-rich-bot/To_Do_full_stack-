import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import axios from "axios";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loginFailed, setLoginFailed] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      // Redirect after successful login
      navigate("/dashboard");
    } catch (error) {
      setLoginFailed(true);
      setError("Incorrect email or password.");
      console.error(error.response.data.message);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-center mb-4">Sign In</h2>
        {loginFailed && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className={`mb-3 ${loginFailed ? "has-error" : ""}`}>
            <label htmlFor="inputEmail" className="form-label">
              <FaEnvelope className="me-2" /> Email:
            </label>
            <input
              type="email"
              className={`form-control ${loginFailed ? "is-invalid" : ""}`}
              id="inputEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={`mb-3 ${loginFailed ? "has-error" : ""}`}>
            <label htmlFor="inputPassword" className="form-label">
              <FaLock className="me-2" /> Password:
            </label>
            <input
              type="password"
              className={`form-control ${loginFailed ? "is-invalid" : ""}`}
              id="inputPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Sign In
          </button>
        </form>
        <p className="mt-3 text-center">
          <Link to="/resetpasswordrequestform">Forgot Password?</Link>
        </p>
        <p className="mt-3 text-center">
          Not a member? <Link to="/signup">Sign up now</Link>
        </p>
      </div>
    </div>
  );
}

export default SignInForm;
