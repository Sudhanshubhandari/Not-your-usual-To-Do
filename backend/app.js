import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
 import userRoutes from "./routes/userRoutes.js";
 import taskRoutes from "./routes/taskRoutes.js";
import subtaskRoutes from "./routes/subtaskRoutes.js"
import { errorHandler, notFoundHandler } from "./middlewares/errorMiddleware.js";
import colors from "colors";


dotenv.config();

// Connecting to MongoDB
connectDB();

// Express specific
const app = express();

// Middlewares

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/subTasks", subtaskRoutes);



if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.join(__dirname, "frontend/build/index.html"))
  );
} else {
  app.get("/", (req, res) => res.send("API is running"));
}

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);