/* eslint-disable no-console */
import nodemailer from "nodemailer";
import config from "../config";

export const sendResetPasswordEmail = async (to: string, html: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: config.NODE_ENV === "production", // Use SSL in production
      auth: {
        user: config.nodemailer_email,
        pass: config.nodemailer_password,
      },
    });

    await transporter.verify();
    console.log("SMTP server is ready");

    const mailData = {
      from: config.nodemailer_email,
      to,
      subject: "Reset Password | Pawfect",
      text: "Reset your password within 10 minutes.",
      html,
    };

    await new Promise((resolve, reject) => {
      transporter.sendMail(mailData, (err, info) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log(info);
          resolve(info);
        }
      });
    });
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};
