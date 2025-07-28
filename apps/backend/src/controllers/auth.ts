import { prisma } from "@repo/db"
import { Request, Response } from "express" 
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

//login route
export const login = async (req: Request, res: Response) => {
    try {
        //add validation
        try {
           //find user
           const user = await prisma.user.findUnique({
               where: {
                   email: req.body.email
               },
               include:{
                organizations: true
               }
           })
           if (!user) {
               res.status(400).json({
                   success: false,
                   message: "user not found"
               })
               return
           }
           //check password
           const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password)
           if (!isPasswordCorrect) {
               res.status(400).json({
                   success: false,
                   message: "invalid password"
               })
               return
           }
           //prepare the jwt token
           const tokenData = {
               userId: user.id,
               email: user.email,
               name: user.name
           }
           const token = jwt.sign(tokenData, process.env.JWT_SECRET as string, {
               expiresIn: "12h"
           })
           res.status(200).json({
               success: true,
               message: "user logged in successfully",
               token: token,
               user: user
           })  
           return 
        } catch (error) {
            console.log(error, "error in getting user from db")
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
        const { name, email, password } = req.body
        if (!name || !email || !password) {
            res.status(400).json({
                success: false,
                message: "missing required fields"
            })
            return
        }
        //check if user already exists
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if (user) {
            res.status(400).json({
                success: false,
                message: "user already exists"
            })
            return
        }   
        //hash the passoword before saving to db
        const hashedPassword = await bcrypt.hash(password, 10)
        //save to db
        try {
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword
                }
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
            return
        }
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "internal server error"
         })
    }
}   
