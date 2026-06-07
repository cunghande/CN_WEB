import nodemailer from 'nodemailer';

const appName = process.env.APP_NAME || 'LuxuryWear';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true';
const smtpUser = process.env.SMTP_USER?.trim();
const smtpPass = process.env.SMTP_PASS?.replace(/\s+/g, '');
const smtpFrom = process.env.SMTP_FROM || smtpUser || `${appName} <no-reply@luxurywear.local>`;

let transporter;

const hasSmtpConfig = () => Boolean(smtpHost && smtpUser && smtpPass);

const getTransporter = () => {
  if (!hasSmtpConfig()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
  }
  return transporter;
};

const money = (value) => Number(value || 0).toLocaleString('vi-VN');

const wrapEmail = ({ title, body, ctaLabel, ctaUrl }) => `
  <div style="font-family:Arial,sans-serif;background:#f6f3ee;padding:28px;color:#0f172a">
    <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb">
      <div style="background:#0f172a;color:#ffffff;padding:22px 26px">
        <div style="font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6ee7b7">${appName}</div>
        <h1 style="margin:8px 0 0;font-size:24px;line-height:1.3">${title}</h1>
      </div>
      <div style="padding:26px;font-size:15px;line-height:1.7;color:#334155">
        ${body}
        ${ctaUrl ? `<p style="margin:26px 0 4px"><a href="${ctaUrl}" style="display:inline-block;background:#10b981;color:#052e1b;text-decoration:none;font-weight:800;padding:12px 18px;border-radius:999px">${ctaLabel}</a></p>` : ''}
        <p style="margin-top:26px;color:#64748b;font-size:13px">Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.</p>
      </div>
    </div>
  </div>
`;

const sendMail = async ({ to, subject, html, text }) => {
  const mailer = getTransporter();

  if (!mailer) {
    console.error('[EMAIL SERVICE] Chưa cấu hình SMTP nên không thể gửi email thật.');
    return false;
  }

  try {
    await mailer.sendMail({ from: smtpFrom, to, subject, text, html });
    return true;
  } catch (error) {
    console.error('[EMAIL SERVICE] Không gửi được email:', error.message);
    return false;
  }
};

export const sendPasswordResetOtpEmail = async (email, otp, resetLink, expiresMinutes = 15) => {
  const subject = `${appName} - Mã OTP đặt lại mật khẩu`;
  const text = `Mã OTP đặt lại mật khẩu ${appName} của bạn là ${otp}. Mã có hiệu lực ${expiresMinutes} phút. Bạn cũng có thể mở link: ${resetLink}`;
  const html = wrapEmail({
    title: 'Mã OTP đặt lại mật khẩu',
    body: `
      <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
      <p>Mã OTP của bạn là:</p>
      <div style="margin:18px 0;padding:16px 20px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:14px;text-align:center;font-size:30px;font-weight:900;letter-spacing:8px;color:#065f46">${otp}</div>
      <p>Mã này chỉ có hiệu lực trong <strong>${expiresMinutes} phút</strong>.</p>
    `,
    ctaLabel: 'Mở trang đặt lại mật khẩu',
    ctaUrl: resetLink
  });

  return sendMail({ to: email, subject, html, text });
};

export const sendOrderConfirmationEmail = async (email, orderId, totalAmount) => {
  const orderUrl = `${frontendUrl}/orders`;
  const subject = `${appName} - Đặt hàng thành công #${orderId}`;
  const text = `Đơn hàng #${orderId} đã được tạo thành công. Tổng thanh toán: ${money(totalAmount)} VND. Xem đơn hàng: ${orderUrl}`;
  const html = wrapEmail({
    title: `Đặt hàng thành công #${orderId}`,
    body: `
      <p>Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý.</p>
      <p><strong>Tổng thanh toán:</strong> ${money(totalAmount)} VND</p>
    `,
    ctaLabel: 'Xem đơn hàng',
    ctaUrl: orderUrl
  });

  return sendMail({ to: email, subject, html, text });
};

export const sendOrderStatusEmail = async (email, orderId, statusLabel, totalAmount) => {
  const orderUrl = `${frontendUrl}/orders`;
  const subject = `${appName} - Cập nhật đơn hàng #${orderId}`;
  const text = `Đơn hàng #${orderId} hiện ${statusLabel}. Tổng thanh toán: ${money(totalAmount)} VND. Xem đơn hàng: ${orderUrl}`;
  const html = wrapEmail({
    title: `Cập nhật đơn hàng #${orderId}`,
    body: `
      <p>Trạng thái đơn hàng của bạn vừa được cập nhật.</p>
      <p><strong>Trạng thái mới:</strong> ${statusLabel}</p>
      <p><strong>Tổng thanh toán:</strong> ${money(totalAmount)} VND</p>
    `,
    ctaLabel: 'Theo dõi đơn hàng',
    ctaUrl: orderUrl
  });

  return sendMail({ to: email, subject, html, text });
};
