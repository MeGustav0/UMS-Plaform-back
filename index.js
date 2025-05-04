const express = require("express");
 const cors = require("cors");
 require("dotenv").config();
 
 const app = express();
 app.use(cors());
 app.use(express.json());
 
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

 app.get("/api/health", (req, res) => {
   res.send({ message: "Backend работает!" });
 });

 const PORT = process.env.PORT || 4000;
 app.listen(PORT, () => {
   console.log(`🚀 Server started on http://localhost:${PORT}`);
 });