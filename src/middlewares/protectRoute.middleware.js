// backend/src/middlewares/protectRoute.middleware.js

import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    // Get the token from cookies
    const token = req.cookies.loginSession;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Found" });
    }

    // Verify token using the secret key from environment variables
    const secretKey = process.env.JWT_SECRET_KEY;
    const decodeToken = jwt.verify(token, secretKey);
    if (!decodeToken) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    // Look up the user by ID (excluding the password) from the decoded token
    const user = await User.findById(decodeToken.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User Not Found in Session" });
    }

    // Attach the user object to the request and continue to next middleware
    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware:", error.name, error.message);
  }
};
