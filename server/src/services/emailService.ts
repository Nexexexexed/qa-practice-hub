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
<body style="margin:0; padding:0; background-color:#0f0f0f; font-family: 'Segoe UI', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f0f; padding:48px 0;">
    <tr>
      <td align="center">
        <!-- Основная карточка -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#1a1a1a; border-radius:20px; box-shadow:0 12px 40px rgba(0,0,0,0.5); overflow:hidden; border:1px solid #2a2a2a;">
          
          <!-- Шапка с логотипом и градиентом -->
          <tr>
            <td style="background: linear-gradient(135deg, #d70147 0%, #b10038 100%); padding:40px 40px 32px; text-align:center;">
              <!-- Иконка Q -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
                <tr>
                  <td style="width:56px; height:56px; border-radius:14px; background:#ffffff; text-align:center; vertical-align:middle;">
                    <span style="font-size:32px; font-weight:800; color:#d70147;">Q</span>
                  </td>
                </tr>
              </table>
              <h1 style="color:#ffffff; font-size:28px; font-weight:700; margin:0 0 8px; letter-spacing:-0.3px;">QA Practice Hub</h1>
              <p style="color:rgba(255,255,255,0.85); font-size:16px; margin:0;">Отработка навыков автоматизации тестирования</p>
            </td>
          </tr>

          <!-- Тело -->
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#f0f0f0; font-size:20px; font-weight:600; margin:0 0 16px;">Подтверждение email-адреса</h2>
              <p style="color:#a0a0a0; font-size:15px; line-height:1.7; margin:0 0 32px;">
                Вы зарегистрировались на платформе <strong style="color:#f0f0f0;">QA Practice Hub</strong>. 
                Остался один шаг — подтвердить ваш email, чтобы начать решать задачи.
              </p>

              <!-- Кнопка подтверждения -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 40px;">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #d70147 0%, #b10038 100%); border-radius:14px; padding:0; box-shadow:0 8px 20px rgba(215,1,71,0.3);">
                    <a href="${verificationUrl}" target="_blank" style="display:inline-block; padding:18px 52px; color:#ffffff; font-size:16px; font-weight:600; text-decoration:none; letter-spacing:0.4px; border-radius:14px;">
                      Подтвердить email
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Ссылка-запас -->
              <p style="color:#666666; font-size:13px; line-height:1.6; margin:0 0 16px; text-align:center;">
                Кнопка не работает? Скопируйте ссылку и откройте в браузере:
              </p>
              <p style="background:#0f0f0f; border-radius:10px; padding:14px 18px; word-break:break-all; margin:0 0 32px; border:1px solid #2a2a2a;">
                <a href="${verificationUrl}" target="_blank" style="color:#d70147; font-size:13px; text-decoration:underline;">${verificationUrl}</a>
              </p>

              <!-- Блок с информацией -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(215,1,71,0.05); border-left:4px solid #d70147; border-radius:10px; padding:18px;">
                <tr>
                  <td style="color:#a0a0a0; font-size:13px; line-height:1.6;">
                    <strong style="color:#f0f0f0;">Ссылка действительна 24 часа.</strong><br>
                    Если вы не регистрировались на платформе — просто проигнорируйте это письмо.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Футер -->
          <tr>
            <td style="background:#0f0f0f; padding:24px 40px; text-align:center; border-top:1px solid #2a2a2a;">
              <p style="color:#555555; font-size:12px; margin:0 0 4px;">
                © ${new Date().getFullYear()} QA Practice Hub. Все права защищены.
              </p>
              <p style="color:#555555; font-size:12px; margin:0;">
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