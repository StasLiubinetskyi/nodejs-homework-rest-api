const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.ukr.net",
  port: 465,
  secure: true,
  auth: {
    user: process.env.UKR_NET_EMAIL,
    pass: process.env.UKR_NET_PASSWORD,
  },
});

const sendEmail = async (message) => {
  try {
    const info = await transporter.sendMail(message);
    console.log("Email sent: " + info.response);
    return true;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to send email: " + error.message);
  }
};

module.exports = sendEmail;
