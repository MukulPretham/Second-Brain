import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import {z} from "zod";
import { User } from "./views/User.ts";
const app = express();

dotenv.config();
app.use(express.json());
const saltRounds:number = 5;

const MONGO_URL: string | undefined = process.env.MONGO_URL

if (MONGO_URL) {
    mongoose.connect(MONGO_URL)
        .then(() => { console.log("connected to database") })
        .catch((err) => { console.error(err) });
}

app.get("/", (req, res) => {
    res.send("Hello")
})


app.post("/api/v1/signUp",async(req: any,res: any)=>{
    const username: string = req.body.username;
    const password: string = req.body.password;
    
    let userSchema = z.object({
        username: z.string().min(8).max(50),
        password: z.string().min(8)
        .regex(/[A-Z]/,{message: "Password must contain atleast one uppercase"})
        .regex(/[a-z]/,{message: "Password must contain atleast one lowercase"})
        .regex(/\d/,{message: "Password must contain atleast one number"})
        .regex(/[@$!%*?&]/,{message: "Password must contain atleast one special char"}),
    })

    let currUser = {
        username: username,
        password: password
    }

    let {success,error} = userSchema.safeParse(currUser);
    if(!success){
        return res.status(411).json(error)
    }

    const exist = await User.findOne({username: username});

    if(exist){
        res.json({message: 'username taken or already exist'});
        return;
    }

    let hashedPassword = await bcrypt.hash(password,saltRounds);

    currUser.password = hashedPassword;

    try{
        await User.create(currUser);
    }catch(err){
        throw Error("Cannot insert into the database");
    }

    res.status(200).json({message: "user is in valid form"});
})

app.listen(process.env.PORT || 3000, () => {
    console.log("server started");
})