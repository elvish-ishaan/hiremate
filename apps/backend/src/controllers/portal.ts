import { Request, Response } from "express"
import { prisma } from "@repo/db"
import { sendMail } from "../lib/mailer"

export const createPortal = async (req: Request, res: Response) => {
    try {
        //add validation
        //save to db
        try {
            const portal = await prisma.portal.create({
                data: req.body
            })
            //send demo link to first candidate
            const candidateEmail = portal.candidates[0]
            await sendMail(candidateEmail as string, portal.id)
            res.status(200).json({
                success: true,
                message: "portal created successfully",
                data: portal
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