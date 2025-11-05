import nodemailer from "nodemailer";
export const transporter =nodemailer.createTransport ({
    service:"gamail",
    auth:{
        user:"tu_correo@volta.com",
        pass:"contraseña"
    },
});