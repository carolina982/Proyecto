import bcrypt from "bcryptjs";
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  nombre: string;
  /** Apellido completo (paterno + materno). Se mantiene por compatibilidad. */
  apellido: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  /** femenino | masculino | "" (sin especificar) */
  genero?: string;
  email: string;
  password: string;
  rol: string;
  contacto: string;
  /** false = desactivado (sigue en BD, no aparece en asignaciones). */
  activo: boolean;
  photoUrl?: string | null;
  /**
   * false = el usuario aún debe elegir si cambia la contraseña asignada y si sube foto.
   * Ausente/true = ya pasó ese paso (o es cuenta previa).
   */
  profileSetupCompleted?: boolean;
  /** Si true, el login pide un código enviado al correo. */
  twoFactorEmail?: boolean;
  twoFactorCode?: string;
  twoFactorCodeExp?: Date;
  /** corporativo-hm = perfil creado/sincronizado desde Corporativo HM */
  origen?: string | null;
  expoPushToken?: string | null;
  webPushSubscriptions?: {
    endpoint: string;
    p256dh: string;
    auth: string;
  }[];
  /**
   * Permisos explícitos (independientes del rol).
   * Se suman a los permisos por defecto del rol.
   */
  permissions?: string[];
  /** Preferencias de correos automáticos de viajes (por usuario). */
  emailNotifications?: {
    /** Master: si false, no recibe ningún correo de la app. */
    enabled?: boolean;
    tripAssigned?: boolean;
    tripStarted?: boolean;
    tripCompleted?: boolean;
  };
  resetToken?: string;
  resetTokenExp?: Date;

  comparePassword(password: string): Promise<boolean>;
}

/** Une apellido paterno + materno en un solo string. */
export function joinApellidos(paterno?: string | null, materno?: string | null) {
  return [paterno, materno]
    .map((s) => String(s || "").trim())
    .filter(Boolean)
    .join(" ");
}

export const isBcryptHash = (value: string) =>
  typeof value === "string" && /^\$2[aby]\$\d{2}\$/.test(value);

/** Hashea contraseña en texto plano. Si ya es bcrypt, la deja igual. */
export async function hashPassword(plainOrHash: string): Promise<string> {
  const value = String(plainOrHash || "");
  if (!value) return value;
  if (isBcryptHash(value)) return value;
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(value, salt);
}

const userSchema = new Schema<IUser>(
  {
    nombre: { type: String, required: true },
    apellido: { type: String },
    apellidoPaterno: { type: String, default: "" },
    apellidoMaterno: { type: String, default: "" },
    genero: {
      type: String,
      enum: ["", "femenino", "masculino"],
      default: "",
    },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    // Operadores creados solo como catálogo pueden no tener acceso al login
    password: { type: String, required: false, select: false },
    rol: {
      type: String,
      enum: [
        "Administrador",
        "Usuario",
        "Admin",
        "Operador",
        "Ayudante General",
        // Legacy: se normaliza a Administrador al guardar
        "Superadministrador",
      ],
      required: true,
    },
    contacto: { type: String },
    activo: { type: Boolean, default: true },
    photoUrl: { type: String, default: null },
    profileSetupCompleted: { type: Boolean, default: true },
    twoFactorEmail: { type: Boolean, default: false },
    twoFactorCode: { type: String, select: false },
    twoFactorCodeExp: { type: Date, select: false },
    origen: { type: String, default: null },
    expoPushToken: { type: String, default: null },
    webPushSubscriptions: {
      type: [
        {
          endpoint: { type: String, required: true },
          p256dh: { type: String, required: true },
          auth: { type: String, required: true },
        },
      ],
      default: [],
    },
    permissions: { type: [String], default: [] },
    emailNotifications: {
      enabled: { type: Boolean, default: false },
      tripAssigned: { type: Boolean, default: false },
      tripStarted: { type: Boolean, default: false },
      tripCompleted: { type: Boolean, default: false },
    },
    resetToken: { type: String, select: false },
    resetTokenExp: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret: any) {
    ret.id = String(ret._id || ret.id || "");
    delete ret.password;
    delete ret.resetToken;
    delete ret.resetTokenExp;
    delete ret.twoFactorCode;
    delete ret.twoFactorCodeExp;
    delete ret.__v;
    return ret;
  },
});
userSchema.set("toObject", { virtuals: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  // Evita doble-hash si ya viene hasheada
  if (isBcryptHash(this.password)) return;
  this.password = await hashPassword(this.password);
});

userSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate() as Record<string, unknown> | null;
  if (!update) return;

  const plainUpdate = update as { password?: string; $set?: { password?: string } };
  const password = plainUpdate.$set?.password ?? plainUpdate.password;
  if (!password) return;

  const hash = await hashPassword(password);
  if (!plainUpdate.$set) {
    plainUpdate.$set = {};
  }
  plainUpdate.$set.password = hash;
  if (plainUpdate.password !== undefined) {
    delete plainUpdate.password;
  }
});

userSchema.methods.comparePassword = async function (password: string) {
  // Asegura tener el campo aunque password tenga select:false
  const stored: string | undefined =
    this.password ||
    (await mongoose.model<IUser>("User").findById(this._id).select("+password").then((u) => u?.password));

  if (!stored) return false;
  // Contraseña guardada en texto plano (datos viejos)
  if (!isBcryptHash(stored)) {
    return stored === password;
  }
  return bcrypt.compare(password, stored);
};

export default mongoose.model<IUser>("User", userSchema);
