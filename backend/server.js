require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const User = require("./models/User.js");
const Team = require("./models/Team.js");
const { isTeamMember } = require("./utils/teamMembership.js");

// Import routes
const authRoute = require("./routes/authRoute.js");
const teamRoute = require("./routes/teamRoute.js");
const taskRoute = require("./routes/taskRoute.js");
const askGeminiRoute = require("./routes/askGeminiRoute.js");
const fileRoutes = require("./routes/fileRoute.js");
const chatRoute = require("./routes/chatRoute.js");

const mentorRoute = require("./routes/mentorRoute.js");
const hackathonRoute = require("./routes/hackathonRoute.js");

const app = express();
const allowedOrigins = [
  "http://localhost:3000",
  "https://intern-project-igdtuw.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ✅ Logger + JSON middleware
app.use(morgan("dev"));
app.use(express.json());

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ Failed to connect to MongoDB:", err));

// ✅ Test route
app.get("/test", (req, res) => res.send("Test route working ✅"));

// ✅ Mount all routes
app.use("/api/auth", authRoute);
app.use("/api/teams", teamRoute);
app.use("/api/chat", chatRoute);
app.use("/api/tasks", taskRoute);
app.use("/api/gemini", askGeminiRoute);
app.use("/api/files", fileRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set("io", io);

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (typeof token !== "string" || !token) {
      return next(new Error("Not authorized"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(new Error("Not authorized"));
    }

    socket.data.user = user;
    return next();
  } catch (error) {
    console.error("SOCKET AUTH ERROR:", error.message);
    return next(new Error("Not authorized"));
  }
});

io.on("connection", (socket) => {
  socket.on("chat:join", async (teamId, acknowledge) => {
    const respond = typeof acknowledge === "function" ? acknowledge : () => {};

    try {
      if (typeof teamId !== "string" || !mongoose.isValidObjectId(teamId)) {
        return respond({ ok: false, message: "Invalid team ID" });
      }

      const team = await Team.findById(teamId).select("members");
      if (!isTeamMember(team, socket.data.user._id)) {
        return respond({
          ok: false,
          message: "Team not found or you are not a member",
        });
      }

      await socket.join(`team:${team._id.toString()}`);
      return respond({ ok: true });
    } catch (error) {
      console.error("SOCKET TEAM JOIN ERROR:", error);
      return respond({ ok: false, message: "Could not join team chat" });
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
