import { Queue } from "bullmq"
import IORedis from "ioredis"

export const EMAIL_QUEUE = "email-queue"

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: null,
})

const emailQueue = new Queue(EMAIL_QUEUE, { connection })

export const enqueueInviteEmail = (email: string, portalId: string) => {
    return emailQueue.add("candidate_invite", { email, portalId })
}
