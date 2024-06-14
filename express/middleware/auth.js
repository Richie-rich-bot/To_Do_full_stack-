const jwt = require("jsonwebtoken");
const { BlacklistToken } = require("../models");
require("dotenv").config();

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      console.log("No Authorization header");
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("Token received:", token);

    if (!token) {
      console.log("Token missing after extraction");
      return res
        .status(401)
        .json({ message: "Token missing, authorization denied" });
    }

    const blacklistedToken = await BlacklistToken.findOne({ token });
    if (blacklistedToken) {
      console.log("Token is blacklisted");
      return res.status(401).json({ message: "Token has been blacklisted" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded:", decoded);

    req.user = decoded.user;
    next();
  } catch (error) {
    console.log("Token verification error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Token is not valid" });
    }
    res.status(400).json({ message: "Token verification failed" });
  }
};

module.exports = auth;
