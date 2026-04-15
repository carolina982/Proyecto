import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config";
import Trip from "../models/Trip";
import User from "../models/User";


const router = Router();

let resetToken = "123456789";
console.log("authRoutes cargando correctamente");
// REGISTER
router.put("/trips/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Usuario no autorizado" });
    }

    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    if (user.rol === "admin") {
      Object.assign(trip, req.body);
    } else {
      if (trip.conductorId.toString() !== user._id.toString()) {
        return res.status(403).json({ message: "No autorizado" });
      }

      if (req.body.fechaLlegada) {
        trip.fechaLlegada = req.body.fechaLlegada;
        trip.estado = "completado";
      }
    }

    await trip.save();

    res.json({ message: "Viaje actualizado", trip });

  } catch (error) {
    console.error("Error actualizando viaje:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});
// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    const { password: _pass, ...userData } = user.toObject();

    return res.json({
      message: "Inicio de sesión exitoso",
      token,
      user: userData,
    });

  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email requerido" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    console.log(`Token para ${email}: ${resetToken}`);

    return res.json({
      message: "Código enviado",
      token: resetToken,
    });

  } catch (error) {
    console.error("Error en forgot-password", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword, email } = req.body;

    if (!token || !newPassword || !email) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    if (token !== resetToken) {
      return res.status(400).json({ message: "Token inválido" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return res.json({
      message: "Contraseña actualizada correctamente",
    });

  } catch (error) {
    console.error("Error en reset-password", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

export default router;