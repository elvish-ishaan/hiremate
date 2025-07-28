import { Request, Response } from "express";
import { prisma } from "@repo/db"



//get all the reports of the portal candidates
export const getReports = async (req: Request, res: Response) => {
    const { portalId } = req.params;
    try {
        //get all the sessions associated with the portal
        const sessions = await prisma.session.findMany({
            where: {
                portalId: portalId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                conversation: true,
            },
        })
        //do calculations 
        const finalSessions = sessions.map((session) => {
            const conversation = session.conversation
            const avgScore = conversation.reduce((acc, curr) => acc + curr.score, 0) / conversation.length
            return {
                ...session,
                avgScore
            }
        })
        console.log(finalSessions,'gettin final sessions..........')
        //send the compiled report
        res.status(200).json({
            success: true,
            message: "reports fetched successfully",
            data: finalSessions
        })
    } catch (error) {
        console.log(error,'error in getting reports')
        res.status(500).json({
            success: false,
            message: "internal server error"
        })
        return
    }
   
}

//get session details
export const getSessionDetails = async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    try {
        //get the session details
        const session = await prisma.session.findUnique({
            where: {
                id: sessionId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                conversation: true,
            },
        })
        //send the compiled report
        res.status(200).json({
            success: true,
            message: "session details fetched successfully",
            data: session
        })
    } catch (error) {
        console.log(error,'error in getting session details')
        res.status(500).json({
            success: false,
            message: "internal server error"
        })
        return
    }
   
}   