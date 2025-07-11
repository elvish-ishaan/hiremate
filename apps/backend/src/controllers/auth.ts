import { prisma } from "@repo/db"
import { Request, Response } from "express" 
//login route
export const login = async (req: Request, res: Response) => {
    try {
        //add validation
        //save to db
        try {
            const user = await prisma.user.create({
                data: req.body
            })
            res.status(200).json({
                success: true,
                message: "user created successfully",
                data: user
            })
            return
        } catch (error) {
            console.log(error, "error in saving db")
            res.status(500).json({
                success: false,
                message: "internal server error"
            })
        }
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "internal server error"
         })
    }
}


// register route
export const register = async (req: Request, res: Response) => {
    try {
        //add validation
        //save to db
        try {
            const user = await prisma.user.create({
                data: req.body
            })
            res.status(200).json({
                success: true,
                message: "user created successfully",
                data: user
            })
            return
        } catch (error) {
            console.log(error, "error in saving db")
            res.status(500).json({
                success: false,
                message: "internal server error"
            })
        }
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "internal server error"
         })
    }
}   
