//using nodemailer
import nodemailer from "nodemailer"
import { portalLinkGenerator } from "./utils"

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'jamil37@ethereal.email',
        pass: 'WJBpDenhdrvhY2xXd1'
    }
});

export const sendMail = async (email: string, portalId: string) => {
    const link = portalLinkGenerator(portalId)
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to HireMate",
        text: `Welcome to HireMate! Please click on the link below to login to your account.\n\n${link}`,
        html: `<p>Welcome to HireMate! Please click on the link below to login to your account.</p><p><a href="${link}">${link}</a></p>`
    }
    try {
        await transporter.sendMail(mailOptions)
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}   