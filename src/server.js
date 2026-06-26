import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";


import authRoutes from "./routers/auth.routers.js";
import taskRoutes from "./routers/task.routers.js";


const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));


app.get("/",(req, res)=> res.json({ok: true, name: "Todo API"}));
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

const {PORT = 4000,MONGODB_URI} = process.env;
mongoose.connect(process.env.MONGODB_URI, {dbName: `BackPWA`})
.then(() =>{
    app.listen(PORT, () => console.log(`Api corriendo correctamente en el ${PORT}`));

})
.catch((err =>{
    console.log('Error al conectar a la base d datos', err);
    process.exit(1);
}));
