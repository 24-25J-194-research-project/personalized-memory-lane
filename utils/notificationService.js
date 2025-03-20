import nodemailer from "nodemailer";

export const sendEmergencyEmail = async (email, message) => {
  if (!email) return;

  const transporter = nodemailer.createTransport({
    host: "smtp.mail.yahoo.com", // Yahoo SMTP server
    port: 465,
    secure: true, // true for SSL connection
    auth: {
      user: process.env.EMAIL_USER, // Your Yahoo email address
      pass: process.env.EMAIL_PASSWORD, // Your Yahoo password or App Password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🚨 Emergency Alert!",
    text: `The user might be in danger. Message received:\n\n"${message}"\n\nPlease check on them immediately.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Emergency email sent to:", email);
  } catch (error) {
    console.error("Failed to send emergency email:", error.message);
  }
};

export default sendEmergencyEmail;
