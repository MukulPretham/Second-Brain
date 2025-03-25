import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { string } from "zod";

const app = express();

dotenv.config();

let MONGO_URL: string = "mongodb+srv://MukulPretham:MukuL123$$$@cluster0.rfdcz.mongodb.net/SecondBrain";

mongoose.connect(MONGO_URL)
.then(()=>{console.log("connected to database")});

app.get("/",(req,res)=>{
    res.send("Hello")
})

app.listen(process.env.PORT || 3000,()=>{
    console.log("server started");
})