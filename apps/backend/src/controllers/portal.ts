import { Request, Response } from "express"
import { prisma } from "@repo/db"

export const createPortal = async (req: Request, res: Response) => {
    try {
        const { title, description, role, skillsRequired, jobType, department, organizationId } = req.body
        const portal = await prisma.portal.create({
            data: {
                title,
                description,
                role,
                skillsRequired,
                candidates: [],
                jobType,
                department,
                organizationId
            }
        })
        res.status(200).json({
            success: true,
            message: "portal created successfully",
            data: portal
        })
    } catch (error) {
        console.error(error, "error in createPortal")
        res.status(500).json({
            success: false,
            message: "internal server error"
        })
    }
}

export const listPortals = async (req: Request, res: Response) => {
    try {
        const portals = await prisma.portal.findMany({
            where: {
                organizationId: req.params.orgId,
            },
            orderBy: [{ createdAt: "desc" }],
            include: {
                _count: { select: { applicants: true } },
            },
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

export const updatePortalById = async (req: Request, res: Response) => {
    try {
        const { title, description, role, skillsRequired, jobType, department, isOpen } = req.body
        const portal = await prisma.portal.update({
            where: {
                id: req.params.portalId
            },
            data: {
                title,
                description,
                role,
                skillsRequired,
                jobType,
                department,
                ...(isOpen !== undefined && { isOpen }),
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
        await prisma.portal.delete({
            where: {
                id: req.params.portalId
            }
        })
        res.status(200).json({
            success: true,
            message: "portal deleted successfully",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "internal server error"
        })
    }
}
