import cors from "cors";
import express from "express";
import connectDB from "./config/db";

import announcement from "./routes/announcements";
import tripRoutes from "./routes/tripRoutes";
import unitRoutes from "./routes/unitRoutes";
import userRoutes from "./routes/userRoutes";
import viaticRoutes from "./routes/viaticRoutes";

const app = express();
const PORT = 3000;

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/viatics", viaticRoutes);
app.use("/api/announcements", announcement);
// Servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});