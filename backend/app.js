const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const serviceRoutes = require("./routes/serviceRoutes");
const authRoutes = require("./routes/authRoutes");
const { setIO } = require("./socket");
require("dotenv").config();
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
setIO(io);
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});
app.use(cors());
app.use(express.json());
app.use("/api/services",serviceRoutes);
app.use("/api/auth",authRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "SmartQ backend is running!",
  });
});
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("MongoDB connected");

  server.listen(PORT, () => {
    console.log(`SmartQ server running on port ${PORT}`);
  });
})
.catch((error) => {
    console.log("MongoDB connection failed:",error.message);
});
