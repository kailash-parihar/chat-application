// backend/src/utils/generateToken.js

import jwt from "jsonwebtoken";

const issueTokenAndSetCookie = (userId, res) => {
  // Create a payload containing the user's unique ID.
  const payload = { id: userId._id };

  // Retrieve the secret key from environment variables.
  const secretKey = process.env.JWT_SECRET_KEY;
  if (!secretKey) {
    throw new Error("JWT_SECRET_KEY environment variable is not defined");
  }

  // Define token options, such as expiration time (7 days).
  const tokenOptions = { expiresIn: "7d" };

  let token;
  try {
    // Sign the JWT using the payload, secret key, and options.
    token = jwt.sign(payload, secretKey, tokenOptions);
  } catch (err) {
    console.error("Error signing JWT:", err);
    throw err;
  }

  // Define options for the HTTP cookie that will store the token.
  const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    httpOnly: true, // Prevents client-side access
    sameSite: "strict", // Mitigates CSRF attacks
    secure: process.env.NODE_ENV !== "development", // Use HTTPS in production
    path: "/", // Cookie is valid for the entire site
  };

  // Set the token as a cookie in the response.
  res.cookie("loginSession", token, cookieOptions);

  // Return the generated token.
  return token;
};

export default issueTokenAndSetCookie;
