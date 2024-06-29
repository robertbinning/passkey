require('dotenv').config(); // Add this line at the top to load environment variables

const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const https = require("https")
const fs = require("fs")
const { PrismaClient } = require("@prisma/client")
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const app = express()
app.use(bodyParser.json())
app.use(
  cors({
    origin: "https://localhost:3000", // Adjust as necessary
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow credentials
    exposedHeaders: [
      "Cross-Origin-Opener-Policy",
      "Cross-Origin-Embedder-Policy",
    ],
  })
)

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin")
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp")
  next()
})

// In-memory store for credentials and users

const prisma = new PrismaClient()

app.use(session({
  store: new pgSession({
    pool: prisma.$pool, // Use Prisma's pool
    createTableIfMissing: true, // Ensure the table is created if it doesn't exist
  }),
  secret: process.env.SESSION_SECRET, // Use the environment variable
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to false if not using HTTPS
}))

app.use((req, res, next) => {
  console.log('Session:', req.session); // Debugging line
  next();
});

app.post("/login", async (req, res) => {
  const { email } = req.body;
  console.log('Received email:', email); // Debugging statement

  if (!email) {
    return res.status(400).send("Email is required");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    req.session.userId = user.id;
    console.log('Session after login:', req.session); // Debugging statement
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error during login:', error.message, error.stack);
    return res.status(500).send("Login failed");
  }
});

app.get("/session", async (req, res) => {
  console.log('Session check:', req.session); // Debugging statement
  if (!req.session.userId) {
    return res.status(401).send("No active session");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).send("Failed to retrieve session");
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send("Logout failed");
    }
    res.clearCookie('connect.sid');
    return res.status(200).send("Logged out successfully");
  });
});

app.get("/getCredentialId", async (req, res) => {
  const { email } = req.query
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    })

    if (user)
      return res.json({
        credentialId: user.id.replace(/\+/g, "-").replace(/\//g, "_"),
      })
  } catch (error) {
    return res.status(404).send("User not found")
  }
  return res.status(404).send("User not found")
})

app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany()
    return res.status(200).json({
      users,
    })
  } catch (error) {
    return res.status(5050).send("Something went wrong")
  }
})

const options = {
  key: fs.readFileSync("localhost-key.pem"),
  cert: fs.readFileSync("localhost.pem"),
}

https.createServer(options, app).listen(443, () => {
  console.log("Server is running on https://localhost:443")
})
