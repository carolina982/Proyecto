"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.deleteUser = exports.updateUser = exports.loginUser = exports.registesrUser = exports.createUser = exports.getUserById = exports.getUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto = __importStar(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const mailer_1 = require("../config/mailer");
const User_1 = __importDefault(require("../models/User"));
const getUser = async (req, res) => {
    try {
        const users = await User_1.default.find();
        return res.json(users);
    }
    catch (error) {
        console.error("Error obteniendo usuarios:", error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};
exports.getUser = getUser;
const getUserById = async (req, res) => {
    const { id } = req.params;
    if (!id || id.length !== 24) {
        return res.status(400).json({ message: "ID de usuario inválido" });
    }
    try {
        const user = await User_1.default.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        return res.json(user);
    }
    catch (error) {
        console.error("Error obteniendo usuario:", error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};
exports.getUserById = getUserById;
const createUser = async (req, res) => {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password || !rol) {
        return res.status(400).json({ message: "Faltan datos" });
    }
    try {
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "Usuario ya existe" });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await User_1.default.create({ nombre, email, password: hashedPassword, rol });
        return res.status(201).json(user);
    }
    catch (error) {
        console.error("Error creando usuario:", error);
        return res.status(500).json({ message: "Error creando usuario", error });
    }
};
exports.createUser = createUser;
// Registrar usuario
const registesrUser = async (req, res) => {
    try {
        const { nombre, apellido, email, password, rol } = req.body;
        if (!nombre || !apellido || !email || !password || !rol) {
            return res.status(400).json({ message: "Faltan datos obligatorios" });
        }
        const existingUser = await User_1.default.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: "Usiario ya existe" });
        }
        const newUser = new User_1.default({ nombre, apellido, email: email.toLowerCase(), password, rol, photoUrl: req.file ? `/uploads/${req.file.filename}` : null, });
        await newUser.save();
        const token = jsonwebtoken_1.default.sign({ id: newUser._id, email: newUser.email, rol: newUser.rol }, config_1.JWT_SECRET, { expiresIn: "1d" });
        res.status(201).json({ id: newUser._id,
            nombre: newUser.nombre,
            apellido: newUser.apellido,
            email: newUser.apellido,
            rol: newUser.rol,
            photoUrl: newUser.photoUrl || null,
            token,
        });
    }
    catch (error) {
        console.error("Error  resgistrando usuario", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
exports.registesrUser = registesrUser;
// Login usuario
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log("Datos recibidos en login", { email, password });
    if (!email || !password) {
        return res.status(400).json({ message: "Faltan datos" });
    }
    try {
        const user = await User_1.default.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log("Usuario no econtrado");
            return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
        }
        console.log("usuario econtrado", user.email);
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            console.log("contraseña incorrecta");
            return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, rol: user.rol }, config_1.JWT_SECRET, { expiresIn: "1d" });
        console.log("Token generado", token ? "ok" : "Error");
        res.json({
            id: user._id,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            rol: user.rol,
            photoUrl: user.photoUrl || null,
            token,
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};
exports.loginUser = loginUser;
const updateUser = async (req, res) => {
    try {
        const { nombre, apellido, email, rol } = req.body;
        const updateData = { nombre, apellido, email, rol };
        if (req.file) {
            updateData.photoUrl = `/uploads/${req.file.filename}`;
        }
        const user = await User_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!user) {
            return res.status(404).json({ message: "Usuario no econtrado" });
        }
        res.json(user);
    }
    catch (error) {
        console.error("Error al actualizar usuario", error);
        res.status(500).json({ message: "Error al actualizar usuario" });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    const { id } = req.params;
    console.log("Id recibiendo en backend", id);
    try {
        const user = await User_1.default.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.json({ message: "Usuario eliminado correctamente" });
    }
    catch (error) {
        console.error("Error eliminando usuario", error);
        res.status(500).json({ message: "Error eliminando usuario" });
    }
};
exports.deleteUser = deleteUser;
const forgotPassword = async (req, res) => {
    console.log("📩 Petición recibida en forgotPassword:", req.body);
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email es requerido" });
    }
    try {
        const user = await User_1.default.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        const token = crypto.randomBytes(32).toString("hex");
        user.resetToken = token;
        user.resetTokenExp = new Date(Date.now() + 3600000);
        await user.save();
        const resetUrl = `http://192.168.1.81:3000/api/users/reset-password/${token}`;
        await mailer_1.transporter.sendMail({
            to: user.email,
            from: "correo@volta.com",
            subject: "Restablece tu contraseña",
            html: `<p>Solicitaste restablecer tu contraseña</p>
             <p>Haz clic aqui para crear una nueva contraseña:</p>
             <a href="${resetUrl}">${resetUrl}</a>
             <p>Este enlace expira en 1 hora</p>`,
        });
        res.json({ message: "Correo enviado correctamente" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al enviar correo" });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        const user = await User_1.default.findOne({ resetToken: token,
            resetTokenExp: { $gt: new Date() },
        });
        if (!user) {
            return res.status(400).json({ message: "Token invalido o expirado" });
        }
        const hashed = await bcryptjs_1.default.hash(password, 10);
        user.password = hashed;
        user.resetToken = undefined;
        user.resetTokenExp = undefined;
        await user.save();
        res.json({ message: "Contraseña restablecidad correctamente" });
    }
    catch (error) {
        console.error("Error en resetPassword", error);
        res.status(500).json({ message: "Error al restablecer contraseña" });
    }
};
exports.resetPassword = resetPassword;
