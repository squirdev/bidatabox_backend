const jwt = require("jsonwebtoken"); // Make sure to install jsonwebtoken
const Admin = require("../models/admin.model");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization; // Assuming the token is sent in the Authorization header

  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided, authorization denied." });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token is not valid." });
    }

    try {
      // Fetch full user details from the database
      const user = await Admin.findById(decoded.id); // Exclude password

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      req.user = user; // Attach full user object to request
      next(); // Proceed to the next middleware or route handler
    } catch (dbError) {
      console.error("Error fetching user:", dbError);
      return res
        .status(500)
        .json({ message: "Server error while fetching user." });
    }
  });
};

module.exports = authMiddleware;
