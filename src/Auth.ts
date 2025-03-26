import express, { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const auth = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers["authorization"];
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
        res.status(401).json({ message: "Unauthorized: Missing secret key" });
        return;
    }

    if (!header) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
    }

    try {
        const decoded = jwt.verify(header, jwtSecret) as jwt.JwtPayload;
        req.userId = decoded.id;
        next();
    } catch (err) {
        res.status(403).json({ message: "Invalid or expired token" });
    }
};
