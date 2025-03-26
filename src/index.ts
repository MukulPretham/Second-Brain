import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

const app = express();

dotenv.config();

const MONGO_URL: string | undefined = process.env.MONGO_URL

if (MONGO_URL) {
    mongoose.connect(MONGO_URL)
        .then(() => { console.log("connected to database") })
        .catch((err) => { console.error(err) });
}

app.get("/", (req, res) => {
    res.send("Hello")
})

app.listen(process.env.PORT || 3000, () => {
    console.log("server started");
})