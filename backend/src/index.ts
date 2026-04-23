import "dotenv/config";
import express from "express";
import cors from "cors";
import apiRoutes from "./routes/api";

const app = express();
const PORT = process.env.PORT || 3001;

// Debug: Check if API key is loaded
console.log(`🔑 OPENWEATHER_API_KEY loaded: ${process.env.OPENWEATHER_API_KEY ? "✅ YES" : "❌ NO"}`);
if (process.env.OPENWEATHER_API_KEY) {
  console.log(`🔑 API Key (first 10 chars): ${process.env.OPENWEATHER_API_KEY.substring(0, 10)}...`);
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", apiRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
