import { Hono } from "hono";
import { cors } from "hono/cors";
import { authMiddleware } from "./middleware/auth";
import devotions from "./routes/devotions";
import streaks from "./routes/streaks";
// import chat from './routes/chat' // We'll add this later

// Exporting types for other files to use
export type Variables = {
    user: any;
};

const app = new Hono<{ Variables: Variables }>();

// 1. Global Middleware
app.use("/*", cors());

// 2. Public Routes
app.get("/", (c) => c.text("Selah API is running"));

// 3. Protected Routes Middleware
// Any route starting with /api/* gets the Auth Guard
app.use("/api/*", authMiddleware);

// 4. Mount the Sub-Apps
// This keeps your URL structure clean: /api/devotions, /api/streaks
app.route("/api/devotions", devotions);
app.route("/api/streaks", streaks);
// app.route('/api/chat', chat)

export default app;
