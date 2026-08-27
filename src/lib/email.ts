import { prisma } from "@/lib/prisma";

type EmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(input: EmailInput): Promise<boolean> {
  const { to, subject, html, text } = input;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    // Dev mode: log + store in EmailLog table so admins can inspect
    try {
      await prisma.emailLog.create({
        data: {
          to,
          subject,
          html,
          text: text || "",
          status: "dev_logged",
        },
      });
    } catch (e) {
      console.warn("Could not log email:", e);
    }
    console.log(`[mail:dev] to=${to} subject=${subject}`);
    return true;
  }

  try {
    const nodemailer = (await import("nodemailer")).default;
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || smtpUser,
      to,
      subject,
      html,
      text,
    });
    await prisma.emailLog.create({
      data: { to, subject, html, text: text || "", status: "sent" },
    });
    return true;
  } catch (e) {
    console.error("Email send error:", e);
    try {
      await prisma.emailLog.create({
        data: { to, subject, html, text: text || "", status: "failed" },
      });
    } catch {}
    return false;
  }
}
