import { prisma } from "@/lib/prisma";

export type EmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export type EmailGatewayConfig = {
  enabled: boolean;
  provider: "smtp" | "zeptomail" | "sendmail" | "resend" | "mock";
  senderEmail: string;
  senderName: string;
  replyTo?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPass?: string;
  zeptoToken?: string;
  zeptoRegion?: string;
  sendmailPath?: string;
};

/**
 * Loads current Email Gateway configuration from the database SystemSetting record,
 * with fallbacks to process.env variables.
 */
export async function getEmailGatewayConfig(): Promise<EmailGatewayConfig> {
  let settings = null;
  try {
    settings = await prisma.systemSetting.findUnique({
      where: { id: "default" },
    });
  } catch (err) {
    console.warn("[mail] Could not query SystemSetting, falling back to env:", err);
  }

  const enabled = settings?.emailGatewayEnabled ?? Boolean(process.env.SMTP_HOST);
  const provider = (settings?.emailProvider as any) || (process.env.EMAIL_PROVIDER as any) || "smtp";
  const senderEmail = settings?.emailSenderEmail || process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@ligue.ro";
  const senderName = settings?.emailSenderName || "Pro Ligue România";
  const replyTo = settings?.emailReplyTo || process.env.SMTP_REPLY_TO || "contact@ligue.ro";

  return {
    enabled,
    provider,
    senderEmail,
    senderName,
    replyTo,
    smtpHost: settings?.emailSmtpHost || process.env.SMTP_HOST || "",
    smtpPort: settings?.emailSmtpPort || (process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587),
    smtpSecure: settings?.emailSmtpSecure ?? (Number(settings?.emailSmtpPort || process.env.SMTP_PORT) === 465),
    smtpUser: settings?.emailSmtpUser || process.env.SMTP_USER || "",
    smtpPass: settings?.emailSmtpPass || process.env.SMTP_PASS || "",
    zeptoToken: settings?.emailZeptoToken || process.env.ZEPTO_TOKEN || "",
    zeptoRegion: settings?.emailZeptoRegion || process.env.ZEPTO_REGION || "eu",
    sendmailPath: settings?.emailSendmailPath || process.env.SENDMAIL_PATH || "/usr/sbin/sendmail",
  };
}

/**
 * Universal email dispatcher for all platform communications (invites, reminders, auth, notifications).
 */
export async function sendEmail(
  input: EmailInput,
  overrideConfig?: Partial<EmailGatewayConfig>
): Promise<{ ok: boolean; messageId?: string; error?: string; devLogged?: boolean }> {
  const { to, subject, html, text, replyTo } = input;
  const config = { ...(await getEmailGatewayConfig()), ...overrideConfig };

  const fromAddress = `"${config.senderName}" <${config.senderEmail}>`;
  const effectiveReplyTo = replyTo || config.replyTo || config.senderEmail;

  // 1. Gateway disabled or simulator mode -> log in EmailLog as dev_logged
  if (!config.enabled || config.provider === "mock") {
    try {
      await prisma.emailLog.create({
        data: {
          to,
          subject,
          html,
          text: text || "",
          status: "dev_logged",
          provider: config.provider || "mock",
          error: config.enabled ? "Simulator local (dev_logged)" : "Gateway email dezactivat din panoul SuperAdmin",
        },
      });
    } catch (e) {
      console.warn("[mail:dev] Failed to save EmailLog:", e);
    }
    console.log(`[mail:simulator] To: ${to} | Subject: "${subject}" | Gateway: Disabled/Mock`);
    return { ok: true, devLogged: true };
  }

  // 2. Dispatch via chosen gateway
  try {
    const nodemailer = (await import("nodemailer")).default;
    let transporter: any;

    if (config.provider === "zeptomail") {
      // ZeptoMail by Zoho configuration
      // ZeptoMail SMTP endpoint: smtp.zeptomail.eu (or .com, .in)
      const zeptoHost = `smtp.zeptomail.${config.zeptoRegion || "eu"}`;
      const zeptoToken = config.zeptoToken || config.smtpPass;

      if (!zeptoToken) {
        throw new Error("Cheia ZeptoMail Send Mail Token nu este configurată!");
      }

      transporter = nodemailer.createTransport({
        host: zeptoHost,
        port: Number(config.smtpPort || 587),
        secure: Number(config.smtpPort) === 465,
        auth: {
          user: "emailapikey", // ZeptoMail standard SMTP username
          pass: zeptoToken,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
      });
    } else if (config.provider === "sendmail") {
      // Local server sendmail binary
      transporter = nodemailer.createTransport({
        sendmail: true,
        newline: "unix",
        path: config.sendmailPath || "/usr/sbin/sendmail",
      });
    } else if (config.provider === "resend") {
      // Resend SMTP
      transporter = nodemailer.createTransport({
        host: "smtp.resend.com",
        port: 465,
        secure: true,
        auth: {
          user: "resend",
          pass: config.smtpPass || config.zeptoToken,
        },
      });
    } else {
      // Custom SMTP Server (cPanel, Postfix, Gmail, AWS SES, etc.)
      if (!config.smtpHost) {
        throw new Error("Serverul SMTP Host nu este configurat!");
      }

      transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: Number(config.smtpPort || 587),
        secure: Boolean(config.smtpSecure || Number(config.smtpPort) === 465),
        auth:
          config.smtpUser && config.smtpPass
            ? {
                user: config.smtpUser,
                pass: config.smtpPass,
              }
            : undefined,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
      });
    }

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
      text: text || "",
      replyTo: effectiveReplyTo,
    });

    // Record success
    try {
      await prisma.emailLog.create({
        data: {
          to,
          subject,
          html,
          text: text || "",
          status: "sent",
          provider: config.provider,
        },
      });
    } catch {}

    return { ok: true, messageId: info?.messageId || "sent" };
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    console.error("[mail:error] Failed to send email via", config.provider, errorMsg);

    // Record failure in EmailLog for admin diagnostics
    try {
      await prisma.emailLog.create({
        data: {
          to,
          subject,
          html,
          text: text || "",
          status: "failed",
          provider: config.provider,
          error: errorMsg.substring(0, 500),
        },
      });
    } catch {}

    return { ok: false, error: errorMsg };
  }
}

/**
 * Diagnostic test email dispatcher with instant verification.
 */
export async function sendTestEmail(
  targetEmail: string,
  customConfig?: Partial<EmailGatewayConfig>
): Promise<{ ok: boolean; messageId?: string; error?: string; latencyMs: number; details?: any }> {
  const start = Date.now();
  const config = { ...(await getEmailGatewayConfig()), ...customConfig };

  const testSubject = `[Test Conexiune Gateway] Pro Ligue România • ${new Date().toLocaleTimeString("ro-RO")}`;
  const testHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #090d16; color: #ffffff; border-radius: 16px; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="display: inline-block; padding: 6px 14px; background: #a3e635; color: #020617; border-radius: 9999px; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">
          Verificare Gateway Reușită
        </span>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin: 16px 0 8px 0; text-transform: uppercase;">
          Test Conexiune Email Reușit!
        </h1>
        <p style="color: #94a3b8; font-size: 14px; margin: 0;">
          Serverul tău de email a trimis cu succes acest mesaj de diagnostic.
        </p>
      </div>

      <div style="background: #0f172a; border-radius: 12px; padding: 18px; margin-bottom: 24px; border: 1px solid #334155;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="color: #64748b; padding: 6px 0;">Provider Configurat:</td>
            <td style="color: #a3e635; font-weight: bold; text-align: right; text-transform: uppercase;">${config.provider}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 6px 0;">Expeditor (From):</td>
            <td style="color: #f1f5f9; text-align: right;">${config.senderName} &lt;${config.senderEmail}&gt;</td>
          </tr>
          ${
            config.provider === "zeptomail"
              ? `<tr><td style="color: #64748b; padding: 6px 0;">Regiune ZeptoMail:</td><td style="color: #f1f5f9; text-align: right;">zeptomail.${config.zeptoRegion || "eu"}</td></tr>`
              : `<tr><td style="color: #64748b; padding: 6px 0;">Host SMTP:</td><td style="color: #f1f5f9; text-align: right;">${config.smtpHost || "N/A"}:${config.smtpPort || 587}</td></tr>`
          }
          <tr>
            <td style="color: #64748b; padding: 6px 0;">Data &amp; Ora Trimiterii:</td>
            <td style="color: #f1f5f9; text-align: right;">${new Date().toLocaleString("ro-RO")}</td>
          </tr>
        </table>
      </div>

      <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">
        Acest mesaj a fost declanșat din Consola SuperAdministrator Pro Ligue România.
      </p>
    </div>
  `;

  const result = await sendEmail(
    {
      to: targetEmail,
      subject: testSubject,
      html: testHtml,
      text: `Test conexiune gateway Pro Ligue România. Provider: ${config.provider}. Timp: ${new Date().toISOString()}`,
    },
    customConfig
  );

  const latencyMs = Date.now() - start;

  return {
    ...result,
    latencyMs,
    details: {
      provider: config.provider,
      sender: `"${config.senderName}" <${config.senderEmail}>`,
      target: targetEmail,
      latencyMs,
    },
  };
}

/**
 * Pre-formatted transactional email for Team Invitations.
 */
export async function sendTeamInvitationEmail({
  inviteeEmail,
  inviteeName,
  teamName,
  teamColor,
  teamLogoUrl,
  inviterName,
  sport,
  acceptLink,
  directSignupLink,
}: {
  inviteeEmail: string;
  inviteeName?: string | null;
  teamName: string;
  teamColor?: string | null;
  teamLogoUrl?: string | null;
  inviterName: string;
  sport: string;
  acceptLink: string;
  directSignupLink?: string;
}): Promise<boolean> {
  const subject = `Invitație Oficială în Echipă: ${teamName} te cheamă în lot!`;
  const accentColor = teamColor || "#84cc16";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 32px 20px; background: #020617; color: #ffffff;">
      <div style="background: #0f172a; border-radius: 24px; padding: 32px; border: 1px solid #1e293b; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
        
        <!-- Header Badge -->
        <div style="margin-bottom: 24px;">
          <span style="display: inline-block; padding: 6px 16px; background: rgba(163, 230, 53, 0.15); color: #a3e635; border: 1px solid rgba(163, 230, 53, 0.3); border-radius: 9999px; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">
            Invitație Oficială • ${sport.toUpperCase()}
          </span>
        </div>

        <!-- Team Crest or Monogram -->
        <div style="margin: 0 auto 20px auto; width: 72px; height: 72px; border-radius: 20px; background: ${accentColor}; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 900; color: #ffffff; text-align: center; line-height: 72px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);">
          ${teamLogoUrl ? `<img src="${teamLogoUrl}" alt="${teamName}" style="width: 72px; height: 72px; border-radius: 20px; object-fit: cover;" />` : teamName.substring(0, 3).toUpperCase()}
        </div>

        <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: -0.02em;">
          ${teamName}
        </h1>

        <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin: 0 0 28px 0;">
          Salut, <strong>${inviteeName || "Sportivule"}</strong>!<br />
          Managerul echipei, <strong>${inviterName}</strong>, ți-a pregătit profilul și te invită să te alături lotului oficial pentru competițiile viitoare.
        </p>

        <!-- Call to action button -->
        <div style="margin-bottom: 28px;">
          <a href="${acceptLink}" style="display: inline-block; padding: 16px 36px; background: #a3e635; color: #020617; text-decoration: none; border-radius: 14px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 10px 15px -3px rgba(163, 230, 53, 0.3);">
            Acceptă Invitația &amp; Activează Profilul ↗
          </a>
        </div>

        <p style="color: #64748b; font-size: 12px; margin: 0 0 16px 0;">
          Dacă butonul de mai sus nu funcționează, copiază acest link în browser:<br />
          <a href="${acceptLink}" style="color: #38bdf8; word-break: break-all;">${acceptLink}</a>
        </p>

        ${
          directSignupLink
            ? `<div style="border-top: 1px solid #1e293b; padding-top: 16px; margin-top: 20px;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                  Nu ai încă un cont pe platformă? <a href="${directSignupLink}" style="color: #a3e635; font-weight: bold; text-decoration: underline;">Înregistrează-te direct aici</a>.
                </p>
              </div>`
            : ""
        }
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <p style="color: #475569; font-size: 11px; margin: 0;">
          Mesaj automat expediat prin Pro Ligue România • Platforma Oficială de Competiții Sportive.
        </p>
      </div>
    </div>
  `;

  const result = await sendEmail({
    to: inviteeEmail,
    subject,
    html,
    text: `Ai primit o invitație în echipa ${teamName} de la ${inviterName}. Accesează linkul pentru acceptare: ${acceptLink}`,
  });

  return result.ok;
}
