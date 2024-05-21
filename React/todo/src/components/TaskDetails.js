import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

const TaskDetails = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found.");
        }
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const res = await axios.get(`http://localhost:3001/tasks/${id}`, config);
        setTask(res.data);
      } catch (error) {
        console.error("Error fetching task:", error.message);
        // Handle error
      }
    };
    fetchTask();
  }, [id]);

  if (!task) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <h1>Task Details</h1>
      <div>
        <h2>{task.title}</h2>
        <p>Description: {task.description}</p>
        <p>Priority: {task.priority}</p>
        <p>Status: {task.status}</p>
        <p>Due Date: {task.dueDate}</p>
        <Link to="/dashboard" className="btn btn-primary me-2">
          Back to List
        </Link>
        <Link to={`/edit/${task._id}`} className="btn btn-warning">
          Edit
        </Link>
      </div>
    </>
  );
};

export default TaskDetails;
