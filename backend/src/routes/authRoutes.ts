import { Router } from "express";
import User from "../models/User";

const router = Router();
console.log("athRoutes cargando  correctamente ")
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Faltan datos" });}
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });}
    if (user.password !== password) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" }); }
    const { password: _pass, ...userData } = user.toObject();
    return res.json(userData);
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

export default router;