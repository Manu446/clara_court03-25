const express = require("express");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Example API routes
app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.users.findMany();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { name, email } = req.body;
    const newUser = await prisma.users.create({
      data: { name, email },
    });
    res.json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create user" });
  }
});

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

// Fallback to index.html for SPA or root
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Clara Court app running on port ${PORT}`);
});
