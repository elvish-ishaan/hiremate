import nodemailer from "nodemailer"

const getTransporter = () =>
    nodemailer.createTransport({
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

const generateInterviewLink = (portalId: string, token: string): string => {
    const baseUrl = process.env.BASE_URL || "http://localhost:3000"
    return `${baseUrl}/invite/${portalId}?token=${token}`
}

export const sendCandidateInvite = async (email: string, portalId: string): Promise<void> => {
    const link = generateInviteLink(portalId, email)
    await getTransporter().sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: "Welcome to HireMate",
        text: `Welcome to HireMate! Click the link below to start your interview.\n\n${link}`,
        html: `<p>Welcome to HireMate! Click the link below to start your interview.</p><p><a href="${link}">${link}</a></p>`,
    })
}

export const sendInterviewInvite = async (email: string, name: string, portalId: string, token: string): Promise<void> => {
    const link = generateInterviewLink(portalId, token)
    await getTransporter().sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: "Your HireMate Interview Link",
        text: `Hi ${name},\n\nThank you for applying! Click the link below to start your interview.\n\n${link}\n\nThis link is private — please do not share it.\n\nGood luck!\nThe HireMate Team`,
        html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h2 style="color: #1a1a1a;">Hi ${name},</h2>
  <p style="color: #444;">Thank you for applying! We've reviewed your application and would like to invite you to complete an AI-powered interview.</p>
  <p style="margin: 32px 0;">
    <a href="${link}" style="background: #6d28d9; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
      Start Your Interview
    </a>
  </p>
  <p style="color: #666; font-size: 14px;">Or copy this link into your browser:<br/><a href="${link}" style="color: #6d28d9;">${link}</a></p>
  <p style="color: #888; font-size: 12px; margin-top: 32px;">This link is private — please do not share it. Good luck!</p>
</div>`,
    })
}
