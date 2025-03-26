import mongoose, { Types } from "mongoose";

const contntSchema = new mongoose.Schema({
    link: {type: String, required: true},
    type: {type:String, required: true},
    title: {type:String, required: true},
    tags: [{type: Types.ObjectId, ref:"Tags"}],
    userId: {type: Types.ObjectId, ref: "User" , required: true}
})

export const Content = mongoose.model("Content",contntSchema);