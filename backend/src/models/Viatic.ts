import mongoose from "mongoose";

const ViaticoSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true,
  },

  conceptos: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      Comidas: { cantidad: 0, costo: 0 },
      Hospedaje: { cantidad: 0, costo: 0 },
      Pensión: { cantidad: 0, costo: 0 },
      Vulcanizadora: { cantidad: 0, costo: 0 },
      Taxi: { cantidad: 0, costo: 0 },
      "Casetas efectivo": { cantidad: 0, costo: 0 },
      "Limpieza Unidad": { cantidad: 0, costo: 0 },
      Multa: { cantidad: 0, costo: 0 },
      Comisiones: { cantidad: 0, costo: 0 },
      Fumigación: { cantidad: 0, costo: 0 },
      DEF: { cantidad: 0, costo: 0 },
      Regaderas: { cantidad: 0, costo: 0 },
    },
  },

  dieselCargas: { type: Number, default: 0 },
  dieselCosto: { type: Number, default: 0 },
  dieselHistorial:{
    type:[
      {
        cargas:{type:Number, default:0},
        costo:{type:Number,default:0},
      }
    ],
    default:[],
  },

  tag: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  factura: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Viatico", ViaticoSchema);