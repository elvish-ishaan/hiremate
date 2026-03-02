import { Worker, Job } from "bullmq"
import IORedis from "ioredis"
import { sendCandidateInvite, sendInterviewInvite } from "./mailer"

export const EMAIL_QUEUE = "email-queue"

interface CandidateInviteJob {
    email: string
    portalId: string
}

interface InterviewInviteJob {
    email: string
    name: string
    portalId: string
    token: string
}

type EmailJob = CandidateInviteJob | InterviewInviteJob

export const startWorker = (redisUrl: string) => {
    const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null })

    const worker = new Worker<EmailJob>(
        EMAIL_QUEUE,
        async (job: Job<EmailJob>) => {
            if (job.name === "interview_invite") {
                const { email, name, portalId, token } = job.data as InterviewInviteJob
                console.log(`[email-service] job ${job.id}: sending interview invite to ${email}`)
                await sendInterviewInvite(email, name, portalId, token)
                console.log(`[email-service] interview invite sent to ${email}`)
            } else {
                const { email, portalId } = job.data as CandidateInviteJob
                console.log(`[email-service] job ${job.id}: sending invite to ${email}`)
                await sendCandidateInvite(email, portalId)
                console.log(`[email-service] invite sent to ${email}`)
            }
        },
        { connection }
    )

    worker.on("failed", (job, err) => {
        console.error(`[email-service] job ${job?.id} failed:`, err.message)
    })

    worker.on("error", (err) => {
        console.error("[email-service] worker error:", err)
    })

    return worker
}
