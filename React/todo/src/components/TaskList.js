import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaTrashAlt, FaEdit } from "react-icons/fa";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found.");
        }
        const res = await axios.get("http://localhost:3001/tasks/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTasks(res.data);
      } catch (error) {
        console.error("Error fetching tasks:", error.message);
      }
    };

    const fetchUserName = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found.");
        }
        const res = await axios.get("http://localhost:3001/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserName(res.data.name);
      } catch (error) {
        console.error("Error fetching user name:", error.message);
      }
    };

    fetchTasks();
    fetchUserName();
  }, []);

  const deleteTask = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found.");
        }
        await axios.delete(`http://localhost:3001/tasks/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTasks(tasks.filter((task) => task._id !== id));
      } catch (error) {
        console.error("Error deleting task:", error.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found.");
      }
      await axios.post("http://localhost:3001/logout", null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Clear local storage and redirect to login page
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/"; // Redirect to login page
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Task List</h1>
        <div>
          <p className="mb-0">Welcome, {userName}</p>
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div>
      </div>
      <Link to="/create" className="btn btn-primary mb-3">
        Create Task
      </Link>
      <ul className="list-group">
        {tasks.map((task) => (
          <li
            key={task._id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <Link to={`/tasks/${task._id}`}>{task.title}</Link>
            <div>
              <Link
                to={`/edit/${task._id}`}
                className="btn btn-sm btn-warning me-2"
              >
                <FaEdit />
              </Link>
              <button
                onClick={() => deleteTask(task._id)}
                className="btn btn-sm btn-danger"
              >
                <FaTrashAlt />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default TaskList;
