import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import videoroutes from "./Routes/video.js";
import userroutes from "./Routes/User.js";
import commentroutes from "./Routes/comment.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join('uploads')));

app.get('/', (req, res) => {
    res.send("YourTube is working");
});

app.use('/user', userroutes);
app.use('/video', videoroutes);
app.use('/comment', commentroutes);

const DB_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 5000;

mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
        console.log(`Server running on Port ${PORT}`);
    });
})
.catch((error) => {
    console.error("MongoDB connection failed:", error);
});