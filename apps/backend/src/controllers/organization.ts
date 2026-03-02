import { Request, Response } from "express"
import { prisma } from "@repo/db"
import { uploadLogo } from "../lib/gcs"
import { v4 as uuidv4 } from 'uuid'

export const createOrganization = async (req: Request, res: Response) => {
    try {
        const existingOrg = await prisma.organization.findFirst({
            where: { userId: req.userId }
        })
        if (existingOrg) {
            res.status(400).json({
                success: false,
                message: 'multiple organizations not allowed'
            })
            return
        }

        let logoUrl: string | null = null
        if (req.file) {
            const ext = req.file.originalname.split('.').pop()
            const filePath = `logos/${uuidv4()}.${ext}`
            try {
                logoUrl = await uploadLogo(req.file.buffer, filePath, req.file.mimetype)
            } catch (err) {
                console.error('[org] logo upload failed:', err)
            }
        }

        const org = await prisma.organization.create({
            data: {
                name: req.body.name,
                logo: logoUrl,
                userId: req.userId as string
            }
        })
        res.status(200).json({
            success: true,
            message: "organization created successfully",
            organization: org
        })
    } catch (error) {
        console.error(error, "error in createOrganization")
        res.status(500).json({
            success: false,
            message: "internal server error"
        })
    }
}

export const getOrganization = async (req: Request, res: Response) => {
    try {
        const organization = await prisma.organization.findFirst({
            where: { userId: req.userId }
        })
        if (!organization) {
            res.status(404).json({
                success: false,
                message: 'No organization found'
            })
            return
        }
        res.status(200).json({
            success: true,
            message: 'organization fetched',
            organization
        })
    } catch (error) {
        console.error(error, 'err in getOrganization')
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

export const updateOrganization = async (req: Request, res: Response) => {
    const orgId = req.params.orgId
    try {
        let logoUrl: string | undefined = undefined
        if (req.file) {
            const ext = req.file.originalname.split('.').pop()
            const filePath = `logos/${uuidv4()}.${ext}`
            try {
                logoUrl = await uploadLogo(req.file.buffer, filePath, req.file.mimetype)
            } catch (err) {
                console.error('[org] logo upload failed:', err)
            }
        }

        const updateOrg = await prisma.organization.update({
            where: { id: orgId },
            data: {
                name: req.body.name,
                ...(logoUrl !== undefined && { logo: logoUrl }),
            }
        })
        res.status(200).json({
            success: true,
            message: 'organization updated successfully',
            organization: updateOrg
        })
    } catch (error) {
        console.error(error, 'error in updateOrganization')
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}
