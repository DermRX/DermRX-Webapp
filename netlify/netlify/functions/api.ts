import express, { Request, Response } from "express";
import serverless from "serverless-http";
import { registerRoutes } from "./routes"; // Import your existing routes

const app = express();
app.use(express.json());
registerRoutes(app); // Ensure routes are registered

app.get("/", (_req: Request, res: Response) => {
    res.send("Express API on Netlify!");
});

export const handler = serverless(app);
