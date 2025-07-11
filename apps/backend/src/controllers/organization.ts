import { Request, Response } from "express"
import { prisma } from "@repo/db"

export const createOrganization = async (req: Request, res: Response) => {
    try {
        //add validation
        //save to db
        try {
            const organization = await prisma.organization.create({
                data: req.body
            })
            res.status(200).json({
                success: true,
                message: "organization created successfully",
                data: organization
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