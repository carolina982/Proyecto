import cors from "cors";
import express from "express";
import path from "path";
import connectDB from "./config/db";

import announcement from "./routes/announcements";
import authRoutes from "./routes/authRoutes";
import tripRoutes from "./routes/tripRoutes";
import unitRoutes from "./routes/unitRoutes";
import userRoutes from "./routes/userRoutes";
import viaticRoutes from "./routes/viaticRoutes";

const app = express();
const PORT = 3000;
connectDB();

app.use("/uploads",express.static(path.join(__dirname,"../uploads")));

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/viatics", viaticRoutes);
app.use("/api/announcements", announcement);
app.use("/api",authRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});