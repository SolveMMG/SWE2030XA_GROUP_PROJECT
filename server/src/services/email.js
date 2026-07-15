const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || process.env.EMAIL_HOST,
  port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

async function sendInquiryNotification({ sellerEmail, sellerName, buyerName, listingTitle, message, clientUrl }) {
  await transporter.sendMail({
    from: `"SkillSwap" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
    to: sellerEmail,
    subject: `New inquiry on your listing: ${listingTitle}`,
    html: `
      <h2>Hi ${sellerName},</h2>
      <p><strong>${buyerName}</strong> sent you an inquiry about <strong>${listingTitle}</strong>:</p>
      <blockquote>${message}</blockquote>
      <p><a href="${clientUrl}/inquiries">View inquiries</a></p>
    `,
  });
}

async function sendInquiryStatusUpdate({ buyerEmail, buyerName, listingTitle, status, clientUrl }) {
  const verb = status === 'accepted' ? 'accepted' : 'declined';
  await transporter.sendMail({
    from: `"SkillSwap" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
    to: buyerEmail,
    subject: `Your inquiry was ${verb}: ${listingTitle}`,
    html: `
      <h2>Hi ${buyerName},</h2>
      <p>Your inquiry about <strong>${listingTitle}</strong> was <strong>${verb}</strong>.</p>
      <p><a href="${clientUrl}/inquiries">View your inquiries</a></p>
    `,
  });
}

module.exports = { sendInquiryNotification, sendInquiryStatusUpdate };
