import { Request, Response } from "express"
import { prisma } from "@repo/db"
import { sendMail } from "../lib/mailer"

export const createPortal = async (req: Request, res: Response) => {
    try {
        //add validation
        //save to db
        const { title, description, role, skillsRequired, candidates, jobType, department, organizationId } = req.body
        console.log(req.body, "body........");
        try {
            const portal = await prisma.portal.create({
                data: {
                    title,
                    description,
                    role,
                    skillsRequired,
                    candidates,
                    jobType,
                    department,
                    organizationId
                }
            })

            //TODO: USE ANY QUEUE HERE AND MAKE OTHER SERVICE FOR EMAIL
            //send demo link to every candidate
            try {
                const candidateEmail = portal.candidates
                for (let i = 0; i < candidateEmail.length; i++) {
                    await sendMail(candidateEmail[i] as string, portal.id)
            }
            } catch (error) {
                console.log(error, "error in sending mail")
            }
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


//list all portals
export const listPortals = async (req: Request, res: Response) => {
    try {
        const portals = await prisma.portal.findMany({
            where: {
                organizationId: req.params.orgId,
            },
            orderBy: [{ createdAt: "desc" }],
        })
        res.status(200).json({
            success: true,
            message: "portals fetched successfully",
            portals
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "internal server error"
        })
    }
}

// get portal by id
export const getPortalById = async (req: Request, res: Response) => {
    try {
        const portal = await prisma.portal.findUnique({
            where: {
                id: req.params.portalId
            }
        })
        res.status(200).json({
            success: true,
            message: "portal fetched successfully",
            data: portal
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "internal server error"
        })
    }
}   

// update portal by id
export const updatePortalById = async (req: Request, res: Response) => {
    try {
        const { title, description, role, skillsRequired, candidates, jobType, department, organizationId } = req.body
        const portal = await prisma.portal.update({
            where: {
                id: req.params.id
            },
            data: {
                title,
                description,
                role,
                skillsRequired,
                candidates,
                jobType,
                department,
                organizationId
            }
        })
        res.status(200).json({
            success: true,
            message: "portal updated successfully",
            data: portal
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "internal server error"
        })
    }
}

export const deletePortalById = async (req: Request, res: Response) => {
    try {
        const portal = await prisma.portal.delete({
            where: {
                id: req.params.id
            }
        })
        res.status(200).json({
            success: true,
            message: "portal deleted successfully",
            data: portal
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "internal server error"
        })
    }
}