// server.js
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const PORT = 5000;
const API_KEY = process.env.API_KEY;

app.get("/quotes", async (req, res) => {
  try {
    let response = await fetch(
      "https://api.api-ninjas.com/v2/quotes?categories=success,wisdom",
      { headers: { "X-Api-Key": API_KEY } }
    );
    if (!response.ok) throw new Error("API failed");
    let data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch quotes" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
