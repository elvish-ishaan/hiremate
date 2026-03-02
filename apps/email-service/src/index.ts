import "dotenv/config"
import { startWorker } from "./worker"

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"

startWorker(REDIS_URL)
console.log("[email-service] started, waiting for jobs...")
