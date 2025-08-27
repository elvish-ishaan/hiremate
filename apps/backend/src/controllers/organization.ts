import { Request, Response } from "express"
import { prisma } from "@repo/db"

export const createOrganization = async (req: Request, res: Response) => {
    try {
        //add validation
        
        //check if already org present
        const existingOrg = await prisma.organization.findFirst({
            where: {
                userId: req.userId
            }
        })
        if(existingOrg){
            res.status(500).json({
                success: false,
                message: 'multiple organizations not allowed'
            })
            return
        }

        //if not, save to db
        try {
             await prisma.organization.create({
                data: {
                    name: req.body.name,
                    logo: req.body.logo,
                    userId: req.userId
                }
            })
            res.status(200).json({
                success: true,
                message: "organization created successfully",
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


export const getOrganization = async (req: Request, res: Response) => {
    try {
        try {
            const organization = await prisma.organization.findFirst({
            where: {
                userId: req.userId
            }
        })
        if(!organization){
            return res.status(404).json({
                success: false,
                message: 'No organization found'
            })
        }
        return res.status(200).json({
            success: true,
            message: 'organization fethed',
            organization
        })
        } catch (error) {
            console.log(error,'err in getting org from db')
            res.status(500).json({
                success: false,
                message: 'something went wrong'
            })
            return
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

//update org
export const updateOrganization = async (req: Request, res: Response) => {
    const orgId = req.params.orgId
    try {
        try {
            const updateOrg = await prisma.organization.update({
                where: {
                    id: orgId as string
                },
                data: {
                    name: req.body.name,
                    logo: req.body.logo
                }
            })
            console.log(updateOrg,'updaed org........')
            if(!updateOrg){
                res.status(500).json({
                    success: false,
                    message: 'cant update the organization'
                })
                return
            }
            res.status(200).json({
                success: true,
                message: 'organization updated successfully'
            })
            return
        } catch (error) {
            console.log(error,'error in updating org in db')
        }
    } catch (error) {
       res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
        return
    }
}