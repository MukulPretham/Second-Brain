import mongoose from "mongoose";

const tagsSchema = new mongoose.Schema({
    title: {type: String, required: true, unique: true}
})

export const Tags = mongoose.model("Tags",tagsSchema);