import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import connectDB from "./config/db";

import announcement from "./routes/announcementRoutes";
import authRoutes from "./routes/authRoutes";
import tripRoutes from "./routes/tripRoutes";
import unitRoutes from "./routes/unitRoutes";
import userRoutes from "./routes/userRoutes";
import viaticRoutes from "./routes/viaticRoutes";

dotenv.config();

const app = express();
const PORT =Number(process.env.PORT) || 3000;
connectDB();

app.use(cors ({
    origin:"*",
    methods:["GET","POST","PUT","DELETE","OPTIONS"],
    allowedHeaders:["Content-Type","Authorization"],
}));

app.options("*",cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname,"../uploads")));

app.use("/api/users", userRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/viatics", viaticRoutes);
app.use("/api/announcements", announcement);
app.use("/api/auth",authRoutes);


app.listen(PORT, "0.0.0.0", () => {
 console.log(`Servidor corriendo en puerto ${PORT}`)
});