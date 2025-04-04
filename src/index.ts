import express from "express";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";
import { any, z } from "zod";
import { User } from "./views/User";
import { auth } from "./Auth";
import { jwtSecret } from "./config";
import { Content } from "./views/Content";
import { Tags } from "./views/Tags";
import { random } from "./Utils";
import { ShareLinks } from "./views/ShareLinks";


const app = express();

dotenv.config();
app.use(express.json());
app.use(cors())
const saltRounds: number = 5;

const MONGO_URL: string = "mongodb+srv://MukulPretham:MukuL123$$$@cluster0.rfdcz.mongodb.net/SecondBrain"

if (MONGO_URL) {
    mongoose.connect(MONGO_URL)
        .then(() => { console.log("connected to database") })
        .catch((err) => { console.error(err) });
}

app.get("/", (req: Request, res: Response) => {
    res.send("Hello")
})

app.get("/details", (req: Request, res: Response) => {
    let details = jwt.decode("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjE2NTQ0IiwiZW1haWwiOiJyYWtha3VtYXI3MzE3QGdtYWlsLmNvbSIsInRpbWVzdGFtcCI6MTc0MjcyODE4NSwidGVuYW50VHlwZSI6InVzZXIiLCJ0ZW5hbnROYW1lIjoiIiwidGVuYW50SWQiOiIiLCJkaXNwb3NhYmxlIjpmYWxzZX0.djgMIcmMBFEmrlxlYPAtdJg2F33SbNUciYveEekZW8c")
    res.json(details);
})

app.post("/api/v1/signUp", async (req: Request, res: any) => {
    const username: string = req.body.username;
    const password: string = req.body.password;

    let userSchema = z.object({
        username: z.string().min(8).max(50),
        password: z.string().min(8)
            .regex(/[A-Z]/, { message: "Password must contain atleast one uppercase" })
            .regex(/[a-z]/, { message: "Password must contain atleast one lowercase" })
            .regex(/\d/, { message: "Password must contain atleast one number" })
            .regex(/[@$!%*?&]/, { message: "Password must contain atleast one special char" }),
    });

    let currUser = {
        username: username,
        password: password
    }

    console.log(currUser);

    let { success, error } = userSchema.safeParse(currUser);
    if (!success) {
        return res.status(411).json(error)
    }

    const exist = await User.findOne({ username: username });

    if (exist) {
        res.json({ message: 'username taken or already exist' });
        return;
    }

    let hashedPassword = await bcrypt.hash(password, saltRounds);

    currUser.password = hashedPassword;

    try {
        await User.create(currUser);
    } catch (err) {
        throw Error("Cannot insert into the database");
    }

    res.status(200).json({ message: "Account created" });
});

app.post("/api/v1/signIn", async (req: Request, res: Response) => {
    let username = req.body.username;
    let password = req.body.password;

    let userSchema = z.object({
        username: z.string().min(8, { message: "username missing" }).max(50),
        password: z.string().min(8, { message: "Password missing" })
    });

    let { success, error } = userSchema.safeParse({ username: username, password: password });

    if (!success) {
        res.status(403).json(error);
        return;
    }

    const currUser = await User.findOne({ username: username });

    if (!currUser) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    let passwordMatched = await bcrypt.compare(password, currUser.password);

    if (!passwordMatched) {
        res.status(403).json({ message: "Wrong password" });
        return;
    }
    let JwtSecret = jwtSecret;
    if (!JwtSecret) {
        res.status(500).json({ message: "server problem" });
        return;
    }
    let token = jwt.sign({ userID: currUser._id }, jwtSecret);

    res.status(200).json({ token: token });

})

app.post("/api/v1/content", auth, async (req: Request, res: Response) => {
    let type: string = req.body.type;
    let link: string = req.body.link;
    let title: string = req.body.title;
    let tags: string[] = req.body.tags;

    console.log(req.userId);

    let u: string | undefined = req.userId;

    if (!u) {
        res.json({ message: "un authorosez" });
        return;
    }
    let userID = u;

    let finalTags = [];
    //handling tags
    for (const tag of tags) {
        let currTag;
        currTag = await Tags.findOne({ title: tag });
        if (!currTag) {
            await Tags.create({
                title: tag,
            });
            currTag = await Tags.findOne({ title: tag });
        }
        finalTags.push(currTag?._id);
    }

    let currContent = {
        type: type,
        link: link,
        title: title,
        tags: finalTags,
        userId: userID
    }


    try {
        await Content.create(currContent);
        console.log("content added");
    } catch (e) {
        console.log(e);
        res.json({ message: "Invalid input" });
        return;
    }
    res.json({ message: "content added" });

})

app.get("/api/v1/content", auth, async (req: Request, res: any) => {
    let userID = req.userId;
    let userContent;

    try {
        let finalTags = [];
        userContent = await Content.find({ userId: userID });

    } catch (e) {
        return res.status(404).json({ message: "content not found" });
    }

    res.json(userContent);
})



app.delete("/api/v1/content/:_id", auth, async (req: Request, res: Response) => {
    let userID = req.userId;
    let contentID = req.params._id;
    try {
        await Content.deleteOne({
            userId: userID,
            _id: contentID
        })
    } catch (e) {
        res.status(500).json({ message: "Database problem" });
    }
    res.status(200).json({ message: "deleted" });
})

app.get("/api/v1/search", auth, async (req: Request, res: any) => {
    let search: string = req.body.search;
    if (!search) {
        res.json({ message: "type anythig in serch for results" });
    }
    let currTag = await Tags.findOne({ title: search });
    if (!currTag) {
        return res.status(404).json({ message: "Not Found" });
    }
    let currContent = await Content.find({ tags: { $in: [currTag] } });
    res.status(200).json(currContent);
})

app.post("/api/v1/content/share", auth, async (req: any, res: any) => {
    let share: boolean = req.body.share;
    if (!share) {
        return res.status(411).json({ message: 'Invalid inputs' });
    }

    let existingLink = await ShareLinks.findOne({ userID: req.userId });
    if (!existingLink) {
        try {
            await ShareLinks.create({
                hash: random(10),
                userID: req.userId
            });
            let currUser = await ShareLinks.findOne({ userID: req.userId });
            res.json(currUser);
            return;
        } catch (e) {
            return res.status(500).json({ message: "Databnase Problem" });
        }
    }

    res.json(existingLink);

})

app.get("/api/v1/content/share/:hash",async(req,res)=>{
    let hash:string = req.params.hash;
    let currLink = await ShareLinks.findOne({hash: hash});
    if(!currLink){
        res.status(404).json({message: "Not Found"});
        return
    }
    let currUser = await User.findOne({_id: currLink.userID});
    let currContent = await Content.find({
        userId: currUser?._id
    })

    res.json({
        username: currUser?.username,
        content: currContent
    })

})

app.listen(process.env.PORT || 3000, () => {
    console.log("server started");
})