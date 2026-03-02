import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: Number(process.env.SMTP_PORT) || 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

const generateInviteLink = (portalId: string, email: string): string => {
    const baseUrl = process.env.BASE_URL || "http://localhost:3000"
    return `${baseUrl}/invite/${portalId}?email=${encodeURIComponent(email)}`
}

export const sendCandidateInvite = async (email: string, portalId: string): Promise<void> => {
    const link = generateInviteLink(portalId, email)
    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: "Welcome to HireMate",
        text: `Welcome to HireMate! Click the link below to start your interview.\n\n${link}`,
        html: `<p>Welcome to HireMate! Click the link below to start your interview.</p><p><a href="${link}">${link}</a></p>`,
    })
}
