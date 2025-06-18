import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { EventEmitter } from "events";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { createServer } from "http";
import { Server } from "socket.io";

import videoroutes from "./Routes/video.js";
import userroutes from "./Routes/User.js";
import commentroutes from "./Routes/comment.js";
import downloadRoutes from "./Routes/download.js";
import paymentRoutes from "./Routes/payment.js";

EventEmitter.defaultMaxListeners = 20;

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join("uploads")));


app.get("/", (req, res) => {
  res.send("YourTube is working");
});
app.use("/user", userroutes);
app.use("/video", videoroutes);
app.use("/comment", commentroutes);
app.use("/api/download", downloadRoutes);
app.use("/payment", paymentRoutes);


io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);

    socket.on("offer", (data) => {
      socket.to(roomId).emit("offer", { sdp: data.sdp });
    });

    socket.on("answer", (data) => {
      socket.to(roomId).emit("answer", { sdp: data.sdp });
    });

    socket.on("ice-candidate", (data) => {
      socket.to(roomId).emit("ice-candidate", { candidate: data.candidate });
    });

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
      console.log(`User ${userId} disconnected from room ${roomId}`);
    });
  });
});

// DB and Server Initialization
const DB_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 5000;

mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });
