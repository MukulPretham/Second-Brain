import mongoose from "mongoose";

let shareLinkSchema = new mongoose.Schema({
    hash: String,
    userID: {type: mongoose.Types.ObjectId, ref:"User", required: true}
})

export const ShareLinks = mongoose.model("Links",shareLinkSchema);