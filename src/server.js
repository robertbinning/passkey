const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const https = require("https")
const fs = require("fs")
const { PrismaClient } = require("@prisma/client")

const app = express()
app.use(bodyParser.json())
app.use(
  cors({
    origin: "https://localhost:3000", // Adjust as necessary
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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

app.post("/register", async (req, res) => {
  console.log("Register request received:", req.body)
  const { id, rawId, response, type, email } = req.body
  try {
    await prisma.userCredential.create({
      data: {
        id,
        raw_id: rawId,
        response: JSON.stringify(response),
        type,
        email,
      },
    })
  } catch (e) {
    return res.status(500).send("Something went wrong")
  }

  try {
    const res1 = await prisma.user.create({
      data: {
        id,
        email,
      },
    })
    console.log("res ", res1)
  } catch (e) {
    return res.status(500).send("Something went wrong")
  }
  return res.status(200).send("Registered successfully")
})

app.post("/login", async (req, res) => {
  console.log("Login request received:", req.body)
  const { id, rawId, response, type } = req.body
  console.log("The id is ", id)
  // Verify the assertion here (this example just checks if the credential exists)
  try {
    const credRes = await prisma.userCredential.findUnique({
      where: { id: id },
    })

    if (!credRes) return res.status(400).send("Credential not found")
  } catch (e) {
    return res.status(400).send("Credential not found")
  }

  return res.status(200).send("Logged in successfully")
})

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
