const nodemailer = require("nodemailer");

const smtpSenderEmail = process.env.SMTP_SENDER_EMAIL!;
const smtpSenderName = process.env.SMTP_SENDER_NAME!;
const smtpSenderEmailPassword = process.env.SMTP_SENDER_EMAIL_PASSWORD!;
const createTransporter = () => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for port 465, false for other ports
        auth: {
            user: smtpSenderEmail,
            pass: smtpSenderEmailPassword,
        },
    });
    return transporter;
}

export const sendEmail = async (emails: string[], subject: string, html?: string) => {
    const commaSeperatedEmails = emails.join(',');
    // send mail with defined transport object
    const transporter = createTransporter();
    const info = await transporter.sendMail({
        from: `${smtpSenderName} ${smtpSenderEmail}`, // sender address
        to: commaSeperatedEmails, // list of receivers
        subject: subject, // Subject line
        html: html, // html body
    });
    console.log("Message sent: %s", info.messageId);
}
