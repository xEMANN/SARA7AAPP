import nodemailer from "nodemailer"

export async function sendEmail({
    to="",
    text="",
    html="",
    subject="",
    attachments=[],
    cc="",
    bcc="",
}) {
     const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,

        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    

   
    const info = await transporter.sendMail({
        from: `"route academy🫡🤍" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
        attachments,
        cc,
        bcc,

    });

    console.log("Message sent:" , info.messageId);

}

export const emailSubject = {
    confirmEmail : "confirm your email",
    resetPassword : "reset your password",
    welcome : "welcome to route academy"
};