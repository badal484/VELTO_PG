const nodemailer = require('nodemailer');

const FOOTER = `
  <div style="margin-top:32px;padding-top:20px;border-top:1px solid #EBEBEB;text-align:center;font-size:12px;color:#717171;">
    <p style="margin:0 0 4px;">Velto Stay — Find Your Perfect Stay, Instantly</p>
    <p style="margin:0;">nexxbuyy@gmail.com | +91 6204646300</p>
  </div>`;

const OTP_BOX = (otp) => `
  <div style="background:#F7F7F7;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
    <p style="margin:0 0 8px;font-size:13px;color:#717171;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">Your OTP</p>
    <p style="margin:0;font-size:40px;font-weight:700;color:#FF385C;letter-spacing:0.15em;">${otp}</p>
    <p style="margin:8px 0 0;font-size:12px;color:#717171;">Valid for 10 minutes. Do not share this code.</p>
  </div>`;

const templates = {
  email_verify: ({ otp }) => ({
    subject: 'Verify your email — Velto Stay',
    body: `
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#222222;">Welcome to Velto Stay!</h2>
      <p style="color:#717171;margin:0 0 4px;">Use the OTP below to verify your email address.</p>
      ${OTP_BOX(otp)}
      <p style="color:#717171;font-size:13px;">If you didn't create an account, you can safely ignore this email.</p>`,
  }),

  forgot_password: ({ otp }) => ({
    subject: 'Password Reset OTP — Velto Stay',
    body: `
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#222222;">Reset your password</h2>
      <p style="color:#717171;margin:0 0 4px;">Use the OTP below to reset your Velto Stay password.</p>
      ${OTP_BOX(otp)}
      <p style="color:#717171;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>`,
  }),

  booking_confirmed: ({ userName, bookingId, pgName, pgAddress, checkIn, amount, mapsLink }) => ({
    subject: `Booking Confirmed – ${bookingId}`,
    body: `
      <h2 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#222222;">Your booking is confirmed!</h2>
      <p style="color:#717171;margin:0 0 24px;">Hi ${userName}, here are your booking details.</p>
      <div style="background:#F7F7F7;border-radius:12px;padding:20px;margin-bottom:20px;">
        <p style="margin:0 0 8px;"><strong>Booking ID:</strong> ${bookingId}</p>
        <p style="margin:0 0 8px;"><strong>Property:</strong> ${pgName}</p>
        <p style="margin:0 0 8px;"><strong>Address:</strong> ${pgAddress}</p>
        <p style="margin:0 0 8px;"><strong>Check-In:</strong> ${checkIn}</p>
        <p style="margin:0;"><strong>Amount Paid:</strong> ₹${amount}</p>
      </div>
      ${mapsLink ? `<p><a href="${mapsLink}" style="color:#FF385C;font-weight:600;">Get Directions on Google Maps →</a></p>` : ''}`,
  }),

  booking_cancelled: ({ userName, bookingId, pgName, refundAmount, refundMessage }) => ({
    subject: `Booking Cancelled – ${bookingId}`,
    body: `
      <h2 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#222222;">Booking Cancelled</h2>
      <p style="color:#717171;margin:0 0 24px;">Hi ${userName}, your booking has been cancelled.</p>
      <div style="background:#F7F7F7;border-radius:12px;padding:20px;margin-bottom:20px;">
        <p style="margin:0 0 8px;"><strong>Booking ID:</strong> ${bookingId}</p>
        <p style="margin:0 0 8px;"><strong>Property:</strong> ${pgName}</p>
        <p style="margin:0 0 8px;"><strong>Refund:</strong> ${refundMessage}</p>
        ${refundAmount > 0 ? `<p style="margin:0;color:#008A05;font-weight:600;">₹${refundAmount} will be credited within 3–5 business days.</p>` : ''}
      </div>`,
  }),

  payment_received: ({ userName, bookingId, amount }) => ({
    subject: `Payment Received – ${bookingId}`,
    body: `
      <h2 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#222222;">Payment Received</h2>
      <p style="color:#717171;margin:0 0 24px;">Hi ${userName}, we've received your payment.</p>
      <div style="background:#F7F7F7;border-radius:12px;padding:20px;">
        <p style="margin:0 0 8px;"><strong>Booking ID:</strong> ${bookingId}</p>
        <p style="margin:0;"><strong>Amount:</strong> ₹${amount}</p>
      </div>`,
  }),

  application_approved: ({ userName, pgName }) => ({
    subject: 'Your Partner Application is Approved! 🎉',
    body: `
      <h2 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#222222;">Congratulations, ${userName}!</h2>
      <p style="color:#717171;margin:0 0 24px;">Your application for <strong>${pgName}</strong> has been approved.</p>
      <p style="color:#484848;">Your property is now live on Velto Stay. Log in to your Owner Dashboard to manage bookings and track revenue.</p>
      <div style="margin-top:24px;">
        <a href="${process.env.CLIENT_URL}/owner/dashboard" style="background:#FF385C;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">Go to Owner Dashboard →</a>
      </div>`,
  }),

  application_rejected: ({ userName, reason }) => ({
    subject: 'Update on Your Partner Application',
    body: `
      <h2 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#222222;">Application Update</h2>
      <p style="color:#717171;margin:0 0 24px;">Hi ${userName}, we've reviewed your application.</p>
      <p style="color:#484848;">Unfortunately, we're unable to approve your application at this time.</p>
      <div style="background:#FFF1F2;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="margin:0;color:#C13515;font-size:14px;"><strong>Reason:</strong> ${reason}</p>
      </div>
      <p style="color:#717171;font-size:13px;">You may reapply after 30 days with an updated application.</p>`,
  }),

  payout_processed: ({ userName, month, year, grossRevenue, commissionPercent, netAmount, transactionRef }) => ({
    subject: `Payout Processed – ${month}/${year}`,
    body: `
      <h2 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#222222;">Payout Processed</h2>
      <p style="color:#717171;margin:0 0 24px;">Hi ${userName}, your monthly payout has been processed.</p>
      <div style="background:#F7F7F7;border-radius:12px;padding:20px;margin-bottom:20px;">
        <p style="margin:0 0 8px;"><strong>Period:</strong> Month ${month}, ${year}</p>
        <p style="margin:0 0 8px;"><strong>Gross Revenue:</strong> ₹${grossRevenue}</p>
        <p style="margin:0 0 8px;"><strong>Platform Commission (${commissionPercent}%):</strong> ₹${Math.round(grossRevenue * commissionPercent / 100)}</p>
        <p style="margin:0 0 8px;color:#008A05;font-weight:700;font-size:16px;"><strong>Net Payout:</strong> ₹${netAmount}</p>
        ${transactionRef ? `<p style="margin:0;font-size:13px;color:#717171;"><strong>Ref:</strong> ${transactionRef}</p>` : ''}
      </div>`,
  }),

  support_reply: ({ userName, subject }) => ({
    subject: `Support Reply: ${subject}`,
    body: `
      <h2 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#222222;">New Reply on Your Support Ticket</h2>
      <p style="color:#717171;margin:0 0 24px;">Hi ${userName}, our support team has replied to your ticket.</p>
      <p style="color:#484848;"><strong>Subject:</strong> ${subject}</p>
      <div style="margin-top:24px;">
        <a href="${process.env.CLIENT_URL}/support" style="background:#FF385C;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">View Reply →</a>
      </div>`,
  }),
};

const wrap = (body) => `
  <div style="max-width:600px;margin:0 auto;font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:#FFFFFF;border:1px solid #EBEBEB;border-radius:16px;overflow:hidden;">
    <div style="background:#FF385C;padding:24px 32px;">
      <h1 style="color:#FFFFFF;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.02em;">Velto Stay</h1>
      <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px;">Find Your Perfect Stay, Instantly</p>
    </div>
    <div style="padding:32px;color:#222222;line-height:1.6;">
      ${body}
      ${FOOTER}
    </div>
  </div>`;

const sendEmail = async (options, attempt = 1) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  let subject = options.subject;
  let html = options.html;

  if (options.type && templates[options.type]) {
    const tpl = templates[options.type](options.data || {});
    subject = tpl.subject;
    html = wrap(tpl.body);
  } else if (html) {
    html = wrap(html);
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `Velto Stay <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject,
      html,
    });
  } catch (err) {
    if (attempt < 3) {
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
      return sendEmail(options, attempt + 1);
    }
    throw err;
  }
};

module.exports = sendEmail;
