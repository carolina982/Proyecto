import mongoose from "mongoose";

/** Singleton de configuración de negocio / sistema. */
const SettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "app" },
    /** Precio unitario actual de DEF. Solo afecta registros nuevos. */
    defUnitPrice: { type: Number, default: 400, min: 0 },
    /** Precio por día de comida. Solo afecta gastos nuevos. */
    comidaUnitPrice: { type: Number, default: 400, min: 0 },
    /** Precio por día de comisión. Solo afecta gastos nuevos. */
    comisionUnitPrice: { type: Number, default: 200, min: 0 },
    /** Correos automáticos de viajes (asignación, inicio, fin). Por defecto apagado. */
    tripEmailsEnabled: { type: Boolean, default: false },
    /**
     * Master global: si false, ningún correo sale del sistema
     * (aunque usuarios individuales tengan preferencias activas).
     */
    emailSendingEnabled: { type: Boolean, default: true },
    /** Bolsa abierta para futuras claves sin migrar esquema. */
    extras: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", SettingsSchema);

export const DEFAULT_DEF_UNIT_PRICE = 400;
export const DEFAULT_COMIDA_UNIT_PRICE = 400;
export const DEFAULT_COMISION_UNIT_PRICE = 200;
export const SETTINGS_KEY = "app";
