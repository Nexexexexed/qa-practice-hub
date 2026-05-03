import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.yandex.ru',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  tls: {
    ciphers: 'SSLv3',
  },
});

const SUBJECT = '🎓 QA Practice Hub — Подтверждение email';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

  const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f4f7fa; font-family: 'Segoe UI', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fa; padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.08); overflow:hidden;">
          
          <!-- Шапка -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding:36px 40px; text-align:center;">
              <h1 style="color:#ffffff; font-size:26px; font-weight:700; margin:0 0 8px;">QA Practice Hub</h1>
              <p style="color:rgba(255,255,255,0.9); font-size:16px; margin:0;">Платформа для отработки навыков автоматизации тестирования</p>
            </td>
          </tr>

          <!-- Тело -->
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#1e293b; font-size:20px; font-weight:600; margin:0 0 16px;">Подтверждение email-адреса</h2>
              <p style="color:#475569; font-size:15px; line-height:1.6; margin:0 0 24px;">
                Вы зарегистрировались на платформе <strong>QA Practice Hub</strong>. Остался один шаг — подтвердить ваш email.
              </p>

              <!-- Кнопка -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius:12px; padding:0;">
                    <a href="${verificationUrl}" target="_blank" style="display:inline-block; padding:16px 48px; color:#ffffff; font-size:16px; font-weight:600; text-decoration:none; letter-spacing:0.3px;">
                      Подтвердить email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:#94a3b8; font-size:13px; line-height:1.5; margin:0 0 16px;">
                Кнопка не работает? Скопируйте ссылку в браузер:
              </p>
              <p style="background:#f1f5f9; border-radius:8px; padding:12px 16px; word-break:break-all; margin:0 0 24px;">
                <a href="${verificationUrl}" target="_blank" style="color:#6366f1; font-size:13px; text-decoration:underline;">${verificationUrl}</a>
              </p>

              <!-- Инфо -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fefce8; border-left:4px solid #eab308; border-radius:8px; padding:16px; margin-bottom:24px;">
                <tr>
                  <td style="color:#a16207; font-size:13px; line-height:1.5;">
                    <strong>Ссылка действительна 24 часа.</strong><br>
                    Если вы не регистрировались на платформе — просто проигнорируйте это письмо.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Футер -->
          <tr>
            <td style="background:#f8fafc; padding:24px 40px; text-align:center; border-top:1px solid #e2e8f0;">
              <p style="color:#94a3b8; font-size:12px; margin:0 0 4px;">
                © ${new Date().getFullYear()} QA Practice Hub. Все права защищены.
              </p>
              <p style="color:#94a3b8; font-size:12px; margin:0;">
                Это автоматическое письмо. Пожалуйста, не отвечайте на него.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"QA Practice Hub" <${process.env.SMTP_USER}>`,
    to,
    subject: SUBJECT,
    html,
  });
}