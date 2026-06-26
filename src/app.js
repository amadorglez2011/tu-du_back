import express from "express";
import morgan from "morgan";
import cors from "cors";
import authRoutes from "../src/routers/auth.routers.js";
import taskRoutes from "../src/routers/task.routers.js";
import {connectToDB} from "../src/db/connect.js";

const app = express();

app.use(
    cors({
    origin: ["http://localhost:5173/",
        process.env.FRONTEND_ORIGIN || ""
    ].filter(Boolean),
    credentials: true,
})
);
app.use(express.json());
app.use(morgan("dev"));

app.use(async (_req, _res, next) => {
    try { await connectToDB(); next(); } catch (e) { next(e); }
 });
 
 app.get("/", (_req, res) => res.json({ok: true, name: "todo-pwa-api" }));
 app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

export default app;