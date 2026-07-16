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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importStar(require("mongoose"));
const userSchema = new mongoose_1.Schema({
    nombre: { type: String, required: true },
    apellido: { type: String },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    // Operadores creados solo como catálogo pueden no tener acceso al login
    password: { type: String, required: false },
    rol: {
        type: String,
        enum: ["Admin", "Operador", "Ayudante General"],
        required: true,
    },
    contacto: { type: String },
    photoUrl: { type: String, default: null },
    resetToken: { type: String },
    resetTokenExp: { type: Date },
}, { timestamps: true });
userSchema.pre("save", async function (next) {
    try {
        if (!this.isModified("password") || !this.password)
            return next();
        const salt = await bcryptjs_1.default.genSalt(10);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
userSchema.pre("findOneAndUpdate", async function (next) {
    try {
        const update = this.getUpdate();
        if (!update)
            return next();
        const plainUpdate = update;
        const password = plainUpdate.password ?? plainUpdate.$set?.password;
        if (password) {
            const hash = await bcryptjs_1.default.hash(password, 10);
            if (plainUpdate.$set) {
                plainUpdate.$set.password = hash;
            }
            else {
                plainUpdate.password = hash;
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
userSchema.methods.comparePassword = function (password) {
    if (!this.password)
        return Promise.resolve(false);
    return bcryptjs_1.default.compare(password, this.password);
};
exports.default = mongoose_1.default.model("User", userSchema);
