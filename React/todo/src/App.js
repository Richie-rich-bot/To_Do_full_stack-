import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignInForm from "./components/SignInForm";
import SignUpForm from "./components/SignUpForm";
import TaskList from "./components/TaskList";
import TaskDetails from "./components/TaskDetails";
import TaskForm from "./components/TaskForm";
import "bootstrap/dist/css/bootstrap.min.css";
import ResetPasswordRequestForm from "./components/ResetPasswordRequestForm";
import ResetPasswordForm from "./components/ResetPasswordForm";

function App() {
  return (
    <>
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <Router>
              <Routes>
                <Route path="/signup" element={<SignUpForm />} />
                <Route path="/" element={<SignInForm />} />
                <Route path="/resetpasswordrequestform" element={<ResetPasswordRequestForm />} />
                <Route path="/reset-password/:resetToken" element={<ResetPasswordForm />} /> {/* Update this line */}
                <Route path="/dashboard" element={<TaskList />} />
                <Route path="/tasks/:id" element={<TaskDetails />} />
                <Route path="/create" element={<TaskForm />} />
                <Route path="/edit/:id" element={<TaskForm />} />
              </Routes>
            </Router>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
