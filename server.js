import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Validate API key
if (!process.env.API_KEY) {
  console.error("❌ API_KEY is missing in your .env file");
  process.exit(1);
}

const API_KEY = process.env.API_KEY;

// Root route
app.get("/", (req, res) => {
  res.send("✅ API is running successfully");
});

// Quotes endpoint
app.get("/quotes", async (req, res) => {
  try {
    const category = req.query.category || "success";

    const response = await fetch(
      `https://api.api-ninjas.com/v1/quotes?category=${category}`,
      {
        method: "GET",
        headers: {
          "X-Api-Key": API_KEY,
        },
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to fetch quotes from API Ninjas",
        status: response.status,
      });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error("❌ Error fetching quotes:", error.message);

    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
