import bcrypt from "bcryptjs";
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: string;
  contacto: string;
  photoUrl?: string | null;
  expoPushToken?: string | null;
  resetToken?: string;
  resetTokenExp?: Date;

  comparePassword(password: string): Promise<boolean>;
}

const isBcryptHash = (value: string) =>
  typeof value === "string" && /^\$2[aby]\$/.test(value);

const userSchema = new Schema<IUser>(
  {
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
    expoPushToken: { type: String, default: null },
    resetToken: { type: String },
    resetTokenExp: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  // Evita doble-hash si ya viene hasheada
  if (isBcryptHash(this.password)) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate() as Record<string, unknown> | null;
  if (!update) return;

  const plainUpdate = update as { password?: string; $set?: { password?: string } };
  const password = plainUpdate.$set?.password ?? plainUpdate.password;
  if (!password || isBcryptHash(password)) return;

  const hash = await bcrypt.hash(password, 10);
  if (!plainUpdate.$set) {
    plainUpdate.$set = {};
  }
  plainUpdate.$set.password = hash;
  if (plainUpdate.password !== undefined) {
    delete plainUpdate.password;
  }
});

userSchema.methods.comparePassword = function (password: string) {
  if (!this.password) return Promise.resolve(false);
  // Contraseña guardada en texto plano (datos viejos / update roto)
  if (!isBcryptHash(this.password)) {
    return Promise.resolve(this.password === password);
  }
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
