require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const cors = require("cors");
const { User, Task, BlacklistToken } = require("./models");
const auth = require("./middleware/auth");
const nodemailer = require("nodemailer")

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect("mongodb://localhost:27017/contact", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("error", (error) => console.error(error));
mongoose.connection.once("open", () => console.log("Connected to database"));

// Register User
app.post("/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({ username, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ message: "User registered successfully", token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Login User
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ message: "Login successful", token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Logout
app.post("/logout", auth, async (req, res) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  try {
    await BlacklistToken.create({ token });
    res.status(200).send("Logged out successfully");
  } catch (error) {
    res.status(500).send("Failed to log out");
  }
});
// Get users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Endpoint to request password reset
app.post("/auth/reset-password-request", async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email input
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = jwt.sign({ email }, process.env.RESET_SECRET, {
      expiresIn: "1h",
    });

    // Save reset token to user document
    user.resetToken = resetToken;
    await user.save();

    // Send reset password email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ofotsurich@gmail.com",
        pass: "txrh cafe oryb rxcp",
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      html: `<p>Please click <a href="http://localhost:3000/reset-password/${resetToken}">here</a> to reset your password.</p>`,
    };
    

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error in /auth/reset-password-request:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Endpoint to reset password when link is clicked in the email
app.post("/auth/reset-password", async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Validate inputs
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    // Verify reset token
    const decoded = jwt.verify(resetToken, process.env.RESET_SECRET);
    if (!decoded) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Find user by email
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetToken = null; // Clear the reset token
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error('Error in /auth/reset-password:', error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Create a new task
app.post("/tasks/create", auth, async (req, res) => {
  try {
    const { title, description, priority, status, dueDate } = req.body;
    const createdBy = req.user.id;

    // Validate task input
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    const task = new Task({
      title,
      description,
      priority,
      status,
      dueDate,
      createdBy,
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error("Error in /tasks/create:", err.message);
    res.status(500).send("Server Error");
  }
});

// Get all tasks
app.get("/tasks/all", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user.id });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get a single task
app.get("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Update a task
app.put("/tasks/:id", auth, async (req, res) => {
  try {
    const { title, description, priority, status, dueDate } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      { title, description, priority, status, dueDate },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Delete a task
app.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
