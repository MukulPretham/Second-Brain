import mongoose from "mongoose";

let contentSchema = new mongoose.Schema({
    link: {type: String, required: true},
    type: {type: String, required: true},
    title: {type: String, required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref:"User"}
})

export const Content = mongoose.model("Content", contentSchema);