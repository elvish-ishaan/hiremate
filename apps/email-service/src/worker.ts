import { Worker, Job } from "bullmq"
import IORedis from "ioredis"
import { sendCandidateInvite } from "./mailer"

export const EMAIL_QUEUE = "email-queue"

interface CandidateInviteJob {
    email: string
    portalId: string
}

export const startWorker = (redisUrl: string) => {
    const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null })

    const worker = new Worker<CandidateInviteJob>(
        EMAIL_QUEUE,
        async (job: Job<CandidateInviteJob>) => {
            const { email, portalId } = job.data
            console.log(`[email-service] job ${job.id}: sending invite to ${email}`)
            await sendCandidateInvite(email, portalId)
            console.log(`[email-service] invite sent to ${email}`)
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
