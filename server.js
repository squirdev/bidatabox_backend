require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
const Admin = require("./models/admin.model");
const router = require("./routes");

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

const systemRootDir = path.parse(__dirname).root;
console.log("System Root Directory:", systemRootDir);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/upload", express.static(path.join(systemRootDir, "upload")));
// app.use("/downloads", express.static(path.join(__dirname, "downloads")));
app.use(fileUpload());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("MongoDB Connected");
    await insertAdmin();
  })
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Simple route
app.get("/", (req, res) => {
  res.send("Welcome to Express + MongoDB API!");
});

app.get("/downloads/:filename", (req, res) => {
  const file = path.join(__dirname, "downloads", req.params.filename);
  console.log("User is going to download");
  res.download(file); // sets Content-Disposition automatically
});

app.use(router);

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

async function insertAdmin() {
  try {
    const existingConfig = await Admin.findOne(); // Check if any config exists
    if (!existingConfig) {
      await Admin.create({
        username: "admin",
        password:
          "$2b$10$UW7UBQPXRl.j49lXYRpBgupV/afVVLsoh4xt89gLlB.QgFpFqM4B6",
      }); // Insert default object
      console.log("Inserted Admin.");
    } else {
      console.log("Admin already exists, skipping insertion.");
    }
  } catch (error) {
    console.error("Error inserting Admin:", error);
  }
}
