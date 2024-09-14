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

async function SendMail(
  email: string,
  subject: string,
  code: Number,
  text: string
) {
  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: email,
    subject: subject,
    text: text,
    html: `<b>${code}</b>`,
  });
}
export { SendMail };
