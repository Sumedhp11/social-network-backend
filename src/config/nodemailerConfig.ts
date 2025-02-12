import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function SendMail({
  email,
  subject,
  code,
  text,
  html,
}: {
  email: string;
  subject: string;
  code?: number;
  text: string;
  html?: string;
}) {
  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: email,
    subject: subject,
    text: text,
    html: html ? html : `<b>${code}</b>`,
  });
}
export { SendMail };
