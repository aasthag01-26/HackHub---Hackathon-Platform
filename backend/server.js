require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const connectDB = require("./config/db.js");

// Connect Database
connectDB();

// Import routes
const authRoute = require("./routes/authRoute.js");
const teamRoute = require("./routes/teamRoute.js");
const taskRoute = require("./routes/taskRoute.js");
const askGeminiRoute = require("./routes/askGeminiRoute.js");
const fileRoutes = require("./routes/fileRoute.js");

const app = express();

// ✅ CORS setup (allow frontend localhost)
app.use(
  cors({
    origin: ["http://localhost:3000", // Your React app
          "https://intern-project-igdtuw.vercel.app",
    ],

    credentials: true,
  })
);

// ✅ Logger + JSON middleware
app.use(morgan("dev"));
app.use(express.json());



// ✅ Test route
app.get("/test", (req, res) => res.send("Test route working ✅"));

// ✅ Mount all routes
app.use("/api/auth", authRoute);
app.use("/api/teams", teamRoute);
app.use("/api/tasks", taskRoute);
app.use("/api/gemini", askGeminiRoute);
app.use("/api/files", fileRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
