import "dotenv/config"
import express from "express"
import cors from "cors"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client.ts"

const app = express()
const PORT = 4000
const JWT_SECRET = process.env.JWT_SECRET

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

app.use(cors())
app.use(express.json())

app.get("/api/health", async (req, res) => {
  console.log("REGISTER ROUTE HIT")
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: "ok", database: "connected" })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: "error",
      database: "disconnected",
    })
  }
})

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required",
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      })
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return res.status(409).json({
        error: "Username already exists",
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
      },
    })

    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        balance: user.balance,
      },
    })
  } catch (error) {
    console.error("REGISTER ERROR:", error)

    res.status(500).json({
      error: "Failed to create account",
    })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return res.status(401).json({
        error: "Invalid username or password",
      })
    }

    const valid = await bcrypt.compare(
      password,
      user.passwordHash
    )

    if (!valid) {
      return res.status(401).json({
        error: "Invalid username or password",
      })
    }

    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        balance: user.balance,
      },
    })
  } catch (error) {
    console.error("LOGIN ERROR:", error)

    res.status(500).json({
      error: "Failed to log in",
    })
  }
})

app.get("/api/markets", async (req, res) => {
  try {
    const markets = await prisma.market.findMany({
      orderBy: { createdAt: "desc" },
    })

    res.json(markets)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: "Failed to fetch markets",
    })
  }
})

app.listen(PORT, () => {
  console.log(`Guessy API running on http://localhost:${PORT}`)
})