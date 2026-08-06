import fs from "fs";
import path from "path";
import { EMAIL_USER } from "../config/config";
import { isMailerConfigured, transporter } from "../config/mailer";

const logoVoltaPath = path.join(__dirname, "../../assets/logo-volta.jpeg");
const logoVoltaBase64 = fs.existsSync(logoVoltaPath)
  ? fs.readFileSync(logoVoltaPath).toString("base64")
  : null;

/** Solo Gmail SMTP (EMAIL_USER + EMAIL_PASS). Resend no se usa. */
export const getActiveMailer = (): "gmail" | "none" => {
  return isMailerConfigured() ? "gmail" : "none";
};

const buildResetHtml = (nombreUsuario: string, code: string) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f3f4f6;border-radius:16px">
    <div style="background:#ffffff;border-radius:14px;padding:28px;border:1px solid #e5e7eb">
      <div style="text-align:center;margin:0 0 20px">
        <img src="cid:logo-volta" alt="Volta" width="140" style="display:inline-block;max-width:140px;height:auto;border:0;outline:none" />
      </div>
      <h2 style="margin:0 0 8px;color:#111111;font-size:20px;text-align:center">Recuperación de contraseña</h2>
      <p style="margin:0 0 16px;color:#6b7280;font-size:14px;text-align:center">${nombreUsuario}, usa este código para restablecer tu contraseña:</p>
      <div style="text-align:center;margin:20px 0">
        <span style="display:inline-block;font-size:34px;font-weight:800;letter-spacing:8px;color:#111111;background:#f3f4f6;border-radius:12px;padding:14px 22px">${code}</span>
      </div>
      <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center">Este código expira en 10 minutos. Si no solicitaste esto, ignora este correo.</p>
    </div>
  </div>
`;

const buildTripAssignedHtml = (options: {
  userName: string;
  roleLabel: string;
  routeLabel: string;
  assignedBy: string;
}) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f3f4f6;border-radius:16px">
    <div style="background:#ffffff;border-radius:14px;padding:28px;border:1px solid #e5e7eb">
      <div style="text-align:center;margin:0 0 20px">
        <img src="cid:logo-volta" alt="Volta" width="140" style="display:inline-block;max-width:140px;height:auto;border:0;outline:none" />
      </div>
      <h2 style="margin:0 0 8px;color:#111111;font-size:20px;text-align:center">Viaje asignado</h2>
      <p style="margin:0 0 16px;color:#6b7280;font-size:14px;text-align:center">
        Hola ${options.userName}, te asignaron un viaje como <strong style="color:#111111">${options.roleLabel}</strong>.
      </p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:0 0 16px">
        <p style="margin:0 0 8px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.04em">Origen → Destino</p>
        <p style="margin:0 0 14px;color:#111111;font-size:16px;font-weight:700">${options.routeLabel}</p>
        <p style="margin:0 0 8px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.04em">Asignado por</p>
        <p style="margin:0;color:#111111;font-size:15px;font-weight:600">${options.assignedBy}</p>
      </div>
      <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center">
        Revisa el detalle en la app Volta (sección Viajes).
      </p>
    </div>
  </div>
`;

const buildTripStatusHtml = (options: {
  userName: string;
  statusLabel: string;
  routeLabel: string;
  operatorName: string;
}) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f3f4f6;border-radius:16px">
    <div style="background:#ffffff;border-radius:14px;padding:28px;border:1px solid #e5e7eb">
      <div style="text-align:center;margin:0 0 20px">
        <img src="cid:logo-volta" alt="Volta" width="140" style="display:inline-block;max-width:140px;height:auto;border:0;outline:none" />
      </div>
      <h2 style="margin:0 0 8px;color:#111111;font-size:20px;text-align:center">${options.statusLabel}</h2>
      <p style="margin:0 0 16px;color:#6b7280;font-size:14px;text-align:center">
        Hola ${options.userName},
      </p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:0 0 16px">
        <p style="margin:0 0 8px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.04em">Operador</p>
        <p style="margin:0 0 14px;color:#111111;font-size:15px;font-weight:600">${options.operatorName}</p>
        <p style="margin:0 0 8px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.04em">Origen → Destino</p>
        <p style="margin:0;color:#111111;font-size:16px;font-weight:700">${options.routeLabel}</p>
      </div>
      <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center">
        Revisa el detalle en la app Volta (sección Viajes).
      </p>
    </div>
  </div>
`;

export type SendEmailResult =
  | { ok: true; provider: "gmail"; id?: string }
  | { ok: false; message: string; detail?: string };

export type SendResetResult = SendEmailResult;

/** Envía HTML solo por Gmail SMTP. */
export async function sendHtmlEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  if (!isMailerConfigured()) {
    return {
      ok: false,
      message:
        "Correo no configurado. Define EMAIL_USER y EMAIL_PASS (contraseña de aplicación de Gmail).",
    };
  }

  try {
    const info = await transporter.sendMail({
      from: `Volta App <${EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      ...(logoVoltaBase64
        ? {
            attachments: [
              {
                filename: "logo-volta.jpeg",
                content: logoVoltaBase64,
                encoding: "base64" as const,
                cid: "logo-volta",
              },
            ],
          }
        : {}),
    });
    console.log(`Correo enviado via gmail → ${options.to} <${info.messageId}>`);
    return { ok: true, provider: "gmail", id: info.messageId };
  } catch (error: any) {
    console.error("Error Gmail SMTP:", error?.message || error);
    return {
      ok: false,
      message: "No se pudo enviar el correo por Gmail.",
      detail: error?.message || String(error),
    };
  }
}

/** Envía el código de recuperación por Gmail. */
export async function sendPasswordResetCode(options: {
  to: string;
  code: string;
  userName?: string;
}): Promise<SendResetResult> {
  const nombreUsuario = String(options.userName || "").trim() || "Hola";
  return sendHtmlEmail({
    to: options.to,
    subject: "Recuperación de contraseña — Volta",
    html: buildResetHtml(nombreUsuario, options.code),
  });
}

/** Avisa por correo que se asignó un viaje (operador o acompañante). */
export async function sendTripAssignedEmail(options: {
  to: string;
  userName?: string;
  role: "operador" | "acompanante";
  routeLabel: string;
  assignedBy?: string;
}): Promise<SendEmailResult> {
  const userName = String(options.userName || "").trim() || "Hola";
  const assignedBy = String(options.assignedBy || "").trim() || "Administración";
  const roleLabel = options.role === "acompanante" ? "acompañante" : "operador";
  const routeLabel = String(options.routeLabel || "").trim() || "Viaje";

  return sendHtmlEmail({
    to: options.to,
    subject: `Viaje asignado — ${routeLabel}`,
    html: buildTripAssignedHtml({
      userName,
      roleLabel,
      routeLabel,
      assignedBy,
    }),
  });
}

/** Avisa a admins por correo cuando un viaje inicia o finaliza. */
export async function sendTripStatusEmail(options: {
  to: string;
  userName?: string;
  status: "started" | "completed";
  routeLabel: string;
  operatorName: string;
}): Promise<SendEmailResult> {
  const userName = String(options.userName || "").trim() || "Hola";
  const operatorName = String(options.operatorName || "").trim() || "Operador";
  const routeLabel = String(options.routeLabel || "").trim() || "Viaje";
  const statusLabel =
    options.status === "completed" ? "Viaje finalizado" : "Viaje iniciado";

  return sendHtmlEmail({
    to: options.to,
    subject: `${statusLabel} — ${routeLabel}`,
    html: buildTripStatusHtml({
      userName,
      statusLabel,
      routeLabel,
      operatorName,
    }),
  });
}
