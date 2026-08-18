import mongoose from "mongoose";
import { MONGO_URI } from "./config";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const dbName = mongoose.connection.name || "(sin nombre)";
    const host = mongoose.connection.host || "?";
    console.log(`MongoDB conectado correctamente → ${host} / ${dbName}`);
  } catch (error) {
    console.error("error conectado a MongoDB", error);
    process.exit(1);
  }
};

export default connectDB;
