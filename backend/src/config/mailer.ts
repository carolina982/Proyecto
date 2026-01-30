import nodemailer from "nodemailer";

export const transporter =nodemailer.createTransport ({
    service:"gmail",
    auth:{
        user:"tu_correo@gmail.com",
        pass:"contraseña"
    },
});

//checar la api 