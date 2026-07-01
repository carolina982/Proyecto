import nodemailer from "nodemailer";

//import { EMAIL_PASS, EMAIL_USER } from "./config";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  
  /*auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS?.trim(),
  },*/

});