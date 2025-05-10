// backend/src/controllers/auth.controller.js

import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import issueTokenAndSetCookie from "../utils/issueTokenAndSetCookie.js";
import cloudinary from "../configurations/cloudinary.config.js";

// SIGNUP CONTROLLER: Handles user registration.
export const signup = async (req, res) => {
  // Extract details from the request body.
  const { fullName, email, password, profilePic } = req.body;

  try {
    // Check if all required fields are provided.
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // Check if password length is sufficient.
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long." });
    }
    // Verify if a user with the same email already exists.
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email already exists." });
    }
    // Generate a salt and hash the password securely.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Create a new user object.
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      profilePic,
    });
    // Issue the JWT token, save user to database, and send a success response.
    if (newUser) {
      issueTokenAndSetCookie(newUser, res);
      await newUser.save();
      return res.status(201).json({
        status: "success",
        message: "User Created Successfully",
        user: newUser,
      });
    } else {
      return res.status(400).json({ message: "Invalid User Data" });
    }
  } catch (error) {
    // Log the error and send a 500 response.
    return res.status(500).json({
      message: "User Signup Error",
      errorName: error.name,
      errorMessage: error.message,
    });
  }
};

// LOGIN CONTROLLER: Handles user login.
export const login = async (req, res) => {
  // Extract email and password from request.
  const { email, password } = req.body;
  try {
    // Find user by email.
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User Not Found" });
    }
    // Compare the provided password with stored hash.
    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }
    // Issue JWT token via cookie if authentication succeeds.
    issueTokenAndSetCookie(user, res);
    return res.status(200).json({
      status: "success",
      message: "User Logged in Successfully",
      user: user,
    });
  } catch (error) {
    // Log error and send a generic error response.
    console.debug("Error in login controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// LOGOUT CONTROLLER: Clears the login session cookie.
export const logout = (req, res) => {
  try {
    // Clear cookie with security options.
    res.clearCookie("loginSession", {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
    });
    return res.status(200).json({ message: "User Logout Successfully" });
  } catch (error) {
    // Log error and send a response.
    console.debug("Error in logout controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PROFILE PICTURE UPDATE CONTROLLER: Updates the user's profile picture.
export const updateProfile = async (req, res) => {
  try {
    // Get profile picture data from request.
    const { profilePic } = req.body;
    // Retrieve user id from JWT token.
    const userId = req.user._id;
    // Validate presence of profile picture.
    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }
    // Upload the picture to Cloudinary.
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    // Prepare update object with the new secure URL.
    const updateObject = { profilePic: uploadResponse.secure_url };
    const options = { new: true }; // Return the updated document.
    // Update user profile in the database.
    const updatedUserProfilePic = await User.findByIdAndUpdate(
      userId,
      updateObject,
      options
    );
    return res.status(200).json(updatedUserProfilePic);
  } catch (error) {
    // Log error and return error response.
    console.log("Error in update profile:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// CHECK AUTHENTICATION CONTROLLER: Returns authenticated user data.
export const checkAuth = (req, res) => {
  try {
    // Return user information from the authenticated request.
    return res.json(req.user);
  } catch (error) {
    // Send error response on exception.
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
