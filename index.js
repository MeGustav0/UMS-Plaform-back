const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// CORS настройки
const corsOptions = {
  origin: "https://usm-platform-d16ff.web.app",
  credentials: true
};

app.use(cors(corsOptions));

app.options("*", (req, res) => {
  res.set("Access-Control-Allow-Origin", corsOptions.origin);
  res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Allow-Credentials", "true");
  res.status(204).send("");
});

// Парсинг JSON
app.use(express.json());

// Подключение маршрутов
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const userRoutes = require("./routes/users");
const orgRoutes = require("./routes/organizations");
const releaseRoutes = require("./routes/releases");

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);
app.use("/api/organizations", orgRoutes);
app.use("/api/releases", releaseRoutes);

// Проверочный маршрут
app.get("/api/health", (req, res) => {
  res.send({ message: "✅ Backend работает!" });
});

// Запуск сервера
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});