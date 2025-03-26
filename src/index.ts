import express from "express";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { any, z } from "zod";
import { User } from "./views/User";
import { auth } from "./Auth";
const app = express();

dotenv.config();
app.use(express.json());
const saltRounds:number = 5;

const MONGO_URL: string = "mongodb+srv://MukulPretham:MukuL123$$$@cluster0.rfdcz.mongodb.net/SecondBrain"

if (MONGO_URL) {
    mongoose.connect(MONGO_URL)
        .then(() => { console.log("connected to database") })
        .catch((err) => { console.error(err) });
}

app.get("/", (req: Request, res: Response) => {
    res.send("Hello")
})


app.post("/api/v1/signUp",async(req: Request,res: any)=>{
    const username: string = req.body.username;
    const password: string = req.body.password;
    
    let userSchema = z.object({
        username: z.string().min(8).max(50),
        password: z.string().min(8)
        .regex(/[A-Z]/,{message: "Password must contain atleast one uppercase"})
        .regex(/[a-z]/,{message: "Password must contain atleast one lowercase"})
        .regex(/\d/,{message: "Password must contain atleast one number"})
        .regex(/[@$!%*?&]/,{message: "Password must contain atleast one special char"}),
    });

    let currUser = {
        username: username,
        password: password
    }

    let { success,error } = userSchema.safeParse(currUser);
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

    res.status(200).json({message: "Account created"});
});

app.post("/api/v1/signIn",async(req: Request,res: Response)=>{
    let username = req.body.username;
    let password = req.body.password;

    let userSchema = z.object({
        username: z.string().min(8,{message: "username missing"}).max(50),
        password: z.string().min(8, {message: "Password missing"})
    });

    let { success , error} = userSchema.safeParse({username: username, password: password});
    
    if(!success){
        res.status(403).json(error);
        return;
    }

    const currUser = await User.findOne({username: username});

    if(!currUser){
        res.status(404).json({message: "User not found"});
        return;
    }
    
    let passwordMatched = await bcrypt.compare(password,currUser.password);
    
    if(!passwordMatched){
        res.status(403).json({message: "Wrong password"});
        return;
    }
    let jwtSecret: string | undefined = process.env.JWT_SECRET;
    if(!jwtSecret){
        res.status(500).json({message: "server problem"});
        return;
    }
    let token = jwt.sign({userID: currUser._id},jwtSecret);

    res.status(200).json({token: token});

})

app.get("/api/v1/secret",auth,(req: Request, res: Response)=>{
    res.send("welcome special user");
})

app.listen(process.env.PORT || 3000, () => {
    console.log("server started");
})